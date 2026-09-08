import { useState } from 'react';
import { adminGate } from '../../lib/admin-gate';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData, adminAction } from '../../lib/use-admin';

export async function getServerSideProps(ctx) {
  return adminGate(ctx);
}

const STATUS_LABEL = { active: 'Active', archived: 'Archived', draft: 'Draft' };

export default function AdminRankings({ admin }) {
  const rankings = useAdminData('/api/admin/rankings');
  const refdata = useAdminData('/api/admin/refdata');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ weightClass: '', position: '', boxerProfile: '', period: '2026-Q3', source: 'Pugnera panel', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [actErr, setActErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  const weights = (refdata.data && refdata.data.weightClasses) || [];
  const boxerChoices = (refdata.data && refdata.data.boxerChoices) || [];

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.weightClass || !form.boxerProfile) {
      setErr('Weight class and boxer are required.');
      return;
    }
    setSaving(true);
    try {
      await adminAction('/api/admin/rankings', 'POST', {
        weightClass: form.weightClass,
        position: Number(form.position) || 1,
        boxerProfile: form.boxerProfile,
        period: form.period,
        source: form.source,
        status: form.status,
      });
      setShowForm(false);
      rankings.bump();
    } catch (e2) {
      setErr(e2.message);
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this ranking entry?')) return;
    setActErr('');
    setBusyId(id);
    try {
      await adminAction(`/api/admin/rankings/${id}`, 'DELETE');
      rankings.bump();
    } catch (e2) {
      setActErr(e2.message);
    }
    setBusyId(null);
  };

  return (
    <AdminLayout title="Rankings" admin={admin}>
      <div className="admin-toolbar">
        <button className="btn btn--primary" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Close form' : 'Add entry'}</button>
      </div>
      {actErr && <p className="rf-error rf-error--summary" role="alert">{actErr}</p>}

      {showForm && (
        <form className="register-form admin-create-form" onSubmit={create}>
          {err && <p className="rf-error rf-error--summary" role="alert">{err}</p>}
          <div className="form-row">
            <div className="form-field">
              <label>Weight class</label>
              <select value={form.weightClass} onChange={set('weightClass')}>
                <option value="">—</option>
                {weights.map((w) => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Position</label>
              <input type="number" min="1" value={form.position} onChange={set('position')} />
            </div>
          </div>
          <div className="form-field">
            <label>Boxer</label>
            <select value={form.boxerProfile} onChange={set('boxerProfile')}>
              <option value="">—</option>
              {boxerChoices.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Period</label>
              <input type="text" value={form.period} onChange={set('period')} placeholder="e.g. 2026-Q3" />
            </div>
            <div className="form-field">
              <label>Source</label>
              <input type="text" value={form.source} onChange={set('source')} placeholder="e.g. Pugnera panel" />
            </div>
          </div>
          <div className="form-field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Add ranking'}</button>
        </form>
      )}

      {rankings.loading && <p className="admin-note">Loading…</p>}
      {rankings.error && <p className="rf-error rf-error--summary" role="alert">{rankings.error}</p>}
      {rankings.data && (rankings.data.rankings || []).length === 0 && (
        <div className="admin-empty">No rankings yet.</div>
      )}
      {rankings.data && (rankings.data.rankings || []).length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Div</th>
                <th>Pos</th>
                <th>Boxer</th>
                <th>Period</th>
                <th>Source</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rankings.data.rankings.map((r) => (
                <tr key={r.id}>
                  <td>{r.weightClassLabel || r.weightClass || '—'}</td>
                  <td>{r.position}</td>
                  <td>{r.boxerLabel || r.boxerProfile || '—'}</td>
                  <td>{r.period || '—'}</td>
                  <td>{r.source || '—'}</td>
                  <td><span className={`admin-chip admin-chip--${r.status}`}>{STATUS_LABEL[r.status] || r.status}</span></td>
                  <td>
                    <button className="btn btn--outline" disabled={busyId === r.id} onClick={() => remove(r.id)}>Delete</button>
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