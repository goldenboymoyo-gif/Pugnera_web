import { useState } from 'react';
import { adminGate } from '../../lib/admin-gate';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData, adminAction } from '../../lib/use-admin';

const STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Not approved',
  suspended: 'Suspended',
};

export async function getServerSideProps(ctx) {
  return adminGate(ctx);
}

function RecordEditor({ boxer, onDone }) {
  const [wins, setWins] = useState(boxer.wins);
  const [losses, setLosses] = useState(boxer.losses);
  const [draws, setDraws] = useState(boxer.draws);
  const [kos, setKos] = useState(boxer.kos);
  const [source, setSource] = useState(boxer.recordSource === 'official' ? 'official' : 'self');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    setBusy(true);
    setErr('');
    try {
      await adminAction(`/api/admin/boxers/${boxer.id}/record`, 'POST', {
        wins: Number(wins) || 0,
        losses: Number(losses) || 0,
        draws: Number(draws) || 0,
        kos: Number(kos) || 0,
        source,
      });
      onDone();
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="admin-inline-form">
      {err && <p className="rf-error" role="alert">{err}</p>}
      <div className="admin-record-inputs">
        <label>Wins <input type="number" min="0" value={wins} onChange={(e) => setWins(e.target.value)} /></label>
        <label>Losses <input type="number" min="0" value={losses} onChange={(e) => setLosses(e.target.value)} /></label>
        <label>Draws <input type="number" min="0" value={draws} onChange={(e) => setDraws(e.target.value)} /></label>
        <label>KOs <input type="number" min="0" value={kos} onChange={(e) => setKos(e.target.value)} /></label>
        <label>
          Source
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="official">Official</option>
            <option value="self">Self-reported</option>
          </select>
        </label>
      </div>
      <div className="admin-row-actions">
        <button className="btn btn--primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save record'}</button>
        <button className="btn btn--outline" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

export default function AdminBoxers({ admin }) {
  const { data, loading, error, bump } = useAdminData('/api/admin/boxers');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [actErr, setActErr] = useState('');

  const act = async (path, method, body) => {
    setActErr('');
    setBusyId(body && body._id ? body._id : 'x');
    try {
      await adminAction(path, method, body);
      bump();
    } catch (e) {
      setActErr(e.message);
    }
    setBusyId(null);
  };

  const list = (data && data.boxers || [])
    .filter((b) => statusFilter === 'all' || b.status === statusFilter)
    .sort((a, b) => {
      const order = { pending: 0, approved: 1, rejected: 2, suspended: 3 };
      return order[a.status] - order[b.status];
    });

  return (
    <AdminLayout title="Boxers" admin={admin}>
      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Not approved</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      {actErr && <p className="rf-error rf-error--summary" role="alert">{actErr}</p>}
      {loading && <p className="admin-note">Loading…</p>}
      {error && <p className="rf-error rf-error--summary" role="alert">{error}</p>}
      {data && list.length === 0 && (
        <div className="admin-empty">No boxer profiles yet. New registrations appear here for review.</div>
      )}
      {data && list.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Boxer</th>
                <th>Weight</th>
                <th>Country</th>
                <th>Record</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.boxingName || b.fullName || b.username || '—'}</strong>
                    <div className="admin-sub">@{b.username || '—'}</div>
                    {b.verified && <span className="admin-chip admin-chip--ok">Verified</span>}
                  </td>
                  <td>{b.weightClassLabel || b.weightClass || '—'}</td>
                  <td>{b.country || '—'}</td>
                  <td>
                    {b.wins}-{b.losses}-{b.draws}
                    {b.kos > 0 ? ` (${b.kos} KO)` : ''}
                    <div className="admin-sub">{b.recordSource === 'official' ? 'official' : 'self-reported'}</div>
                  </td>
                  <td>
                    <span className={`admin-chip admin-chip--${b.status}`}>{STATUS_LABEL[b.status]}</span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      {b.status === 'pending' && (
                        <button
                          className="btn btn--primary"
                          disabled={busyId === b.id}
                          onClick={() => {
                            setBusyId(b.id);
                            act('/api/admin/boxers/' + b.id + '/status', 'POST', { status: 'approved', _id: b.id });
                          }}
                        >
                          Approve
                        </button>
                      )}
                      {b.status === 'approved' && (
                        <button
                          className="btn btn--outline"
                          disabled={busyId === b.id}
                          onClick={() => {
                            setBusyId(b.id);
                            act('/api/admin/boxers/' + b.id + '/status', 'POST', { status: 'suspended', _id: b.id });
                          }}
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        className="btn btn--outline"
                        disabled={busyId === b.id}
                        onClick={() => {
                          setBusyId(b.id);
                          act('/api/admin/boxers/' + b.id + '/verify', 'POST', { verified: !b.verified, _id: b.id });
                        }}
                      >
                        {b.verified ? 'Un-verify' : 'Verify'}
                      </button>
                      <button className="btn btn--outline" onClick={() => setEditingRecord(editingRecord === b.id ? null : b.id)}>
                        Record
                      </button>
                    </div>
                    {editingRecord === b.id && (
                      <RecordEditor boxer={b} onDone={() => { setEditingRecord(null); bump(); }} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}