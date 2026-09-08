import { adminGate } from '../../lib/admin-gate';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData } from '../../lib/use-admin';

export async function getServerSideProps(ctx) {
  return adminGate(ctx);
}

export default function AdminFans({ admin }) {
  const { data, loading, error } = useAdminData('/api/admin/fans');

  return (
    <AdminLayout title="Fans" admin={admin}>
      {loading && <p className="admin-note">Loading…</p>}
      {error && <p className="rf-error rf-error--summary" role="alert">{error}</p>}
      {data && (data.fans || []).length === 0 && (
        <div className="admin-empty">No fan profiles yet.</div>
      )}
      {data && (data.fans || []).length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fan</th>
                <th>Follows fighters</th>
                <th>Follows events</th>
                <th>Weight classes</th>
                <th>Countries</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.fans.map((f) => (
                <tr key={f.profileId}>
                  <td>
                    <strong>{f.fullName || f.username || '—'}</strong>
                    <div className="admin-sub">@{f.username || '—'}</div>
                  </td>
                  <td>{f.followFighters ? 'Yes' : 'No'}</td>
                  <td>{f.followEvents ? 'Yes' : 'No'}</td>
                  <td>{f.weights && f.weights.length ? f.weights.join(', ') : '—'}</td>
                  <td>{f.countries && f.countries.length ? f.countries.join(', ') : '—'}</td>
                  <td>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}