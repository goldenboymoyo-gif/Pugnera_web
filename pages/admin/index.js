import { adminGate } from '../../lib/admin-gate';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData } from '../../lib/use-admin';

export async function getServerSideProps(ctx) {
  return adminGate(ctx);
}

function Stat({ label, value, accent }) {
  return (
    <div className="admin-stat">
      <span className={`admin-stat__value ${accent ? 'admin-stat__value--accent' : ''}`}>{value}</span>
      <span className="admin-stat__label">{label}</span>
    </div>
  );
}

export default function AdminOverview({ admin }) {
  const { data, loading, error } = useAdminData('/api/admin/overview');

  return (
    <AdminLayout title="Overview" admin={admin}>
      {loading && <p className="admin-note">Loading…</p>}
      {error && <p className="rf-error rf-error--summary" role="alert">{error}</p>}
      {data && (
        <div className="admin-stats">
          <Stat label="Fans" value={data.fans} />
          <Stat label="Boxers" value={data.boxers} />
          <Stat label="Pending review" value={data.pendingBoxers} accent />
          <Stat label="Approved" value={data.boxerByStatus.approved} />
          <Stat label="Scheduled fights" value={data.scheduledFights} />
          <Stat label="Published events" value={data.publishedEvents} />
          <Stat label="Active rankings" value={data.activeRankings} />
          <Stat label="Total follows" value={data.follows} />
          <Stat label="Audit (24h)" value={data.auditLast24h} />
        </div>
      )}
    </AdminLayout>
  );
}