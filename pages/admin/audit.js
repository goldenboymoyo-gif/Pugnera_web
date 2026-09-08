import { adminGate } from '../../lib/admin-gate';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData } from '../../lib/use-admin';

export async function getServerSideProps(ctx) {
  return adminGate(ctx);
}

export default function AdminAudit({ admin }) {
  const { data, loading, error, reload } = useAdminData('/api/admin/audit');

  return (
    <AdminLayout title="Audit log" admin={admin}>
      <div className="admin-toolbar">
        <button className="btn btn--outline" onClick={reload}>Refresh</button>
      </div>
      {loading && <p className="admin-note">Loading…</p>}
      {error && <p className="rf-error rf-error--summary" role="alert">{error}</p>}
      {data && (data.audit || []).length === 0 && (
        <div className="admin-empty">No audit events recorded yet.</div>
      )}
      {data && (data.audit || []).length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.audit.map((a) => (
                <tr key={a.id}>
                  <td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</td>
                  <td>{a.actor || 'system'}</td>
                  <td><span className="admin-chip">{a.action}</span></td>
                  <td>{a.targetType ? `${a.targetType}:${a.targetId || ''}` : '—'}</td>
                  <td className="admin-sub">{a.metadata ? JSON.stringify(a.metadata) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}