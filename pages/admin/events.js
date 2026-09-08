import { useState } from 'react';
import { adminGate } from '../../lib/admin-gate';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData, adminAction } from '../../lib/use-admin';

export async function getServerSideProps(ctx) {
  return adminGate(ctx);
}

const STATUS_LABEL = { announced: 'Announced', published: 'Published', completed: 'Completed', cancelled: 'Cancelled' };

export default function AdminEvents({ admin }) {
  const events = useAdminData('/api/admin/events');
  const refdata = useAdminData('/api/admin/refdata');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', time: '', venue: '', city: '', country: '', status: 'published' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [actErr, setActErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  const countries = (refdata.data && refdata.data.countries) || [];

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      await adminAction('/api/admin/events', 'POST', {
        name: form.name,
        date: form.date || null,
        time: form.time || null,
        venue: form.venue || null,
        city: form.city || null,
        country: form.country || null,
        status: form.status,
      });
      setShowForm(false);
      setForm({ name: '', date: '', time: '', venue: '', city: '', country: '', status: 'published' });
      events.bump();
    } catch (e2) {
      setErr(e2.message);
    }
    setSaving(false);
  };

  const togglePublish = async (ev) => {
    setActErr('');
    setBusyId(ev.id);
    try {
      await adminAction(`/api/admin/events/${ev.id}`, 'POST', { status: ev.status === 'published' ? 'announced' : 'published' });
      events.bump();
    } catch (e2) {
      setActErr(e2.message);
    }
    setBusyId(null);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    setActErr('');
    setBusyId(id);
    try {
      await adminAction(`/api/admin/events/${id}`, 'DELETE');
      events.bump();
    } catch (e2) {
      setActErr(e2.message);
    }
    setBusyId(null);
  };

  return (
    <AdminLayout title="Events" admin={admin}>
      <div className="admin-toolbar">
        <button className="btn btn--primary" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Close form' : 'New event'}</button>
      </div>
      {actErr && <p className="rf-error rf-error--summary" role="alert">{actErr}</p>}

      {showForm && (
        <form className="register-form admin-create-form" onSubmit={create}>
          {err && <p className="rf-error rf-error--summary" role="alert">{err}</p>}
          <div className="form-row">
            <div className="form-field">
              <label>Event name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Pugnera Fight Night: London" required />
            </div>
            <div className="form-field">
              <label>Country</label>
              <select value={form.country} onChange={set('country')}>
                <option value="">—</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div className="form-field">
              <label>Time</label>
              <input type="time" value={form.time} onChange={set('time')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Venue</label>
              <input type="text" value={form.venue} onChange={set('venue')} placeholder="e.g. O2 Arena" />
            </div>
            <div className="form-field">
              <label>City</label>
              <input type="text" value={form.city} onChange={set('city')} />
            </div>
          </div>
          <div className="form-field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="announced">Announced</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Creating…' : 'Create event'}</button>
        </form>
      )}

      {events.loading && <p className="admin-note">Loading…</p>}
      {events.error && <p className="rf-error rf-error--summary" role="alert">{events.error}</p>}
      {events.data && (events.data.events || []).length === 0 && (
        <div className="admin-empty">No events yet.</div>
      )}
      {events.data && (events.data.events || []).length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Venue</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.data.events.map((ev) => (
                <tr key={ev.id}>
                  <td><strong>{ev.name}</strong>{ev.time ? <div className="admin-sub">{ev.time}</div> : null}</td>
                  <td>{ev.date || '—'}</td>
                  <td>{ev.venue || '—'}</td>
                  <td>{ev.city || '—'}</td>
                  <td><span className={`admin-chip admin-chip--${ev.status}`}>{STATUS_LABEL[ev.status] || ev.status}</span></td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="btn btn--outline" disabled={busyId === ev.id} onClick={() => togglePublish(ev)}>
                        {ev.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button className="btn btn--outline" disabled={busyId === ev.id} onClick={() => remove(ev.id)}>Delete</button>
                    </div>
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