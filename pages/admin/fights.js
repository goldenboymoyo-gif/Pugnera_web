import { useState } from 'react';
import { adminGate } from '../../lib/admin-gate';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdminData, adminAction } from '../../lib/use-admin';

export async function getServerSideProps(ctx) {
  return adminGate(ctx);
}

const STATUS_LABEL = { scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled' };

export default function AdminFights({ admin }) {
  const fights = useAdminData('/api/admin/fights');
  const refdata = useAdminData('/api/admin/refdata');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    eventId: '',
    boxer1: '',
    boxer2: '',
    weightClass: '',
    date: '',
    venue: '',
    country: '',
    status: 'scheduled',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [actErr, setActErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  const countries = (refdata.data && refdata.data.countries) || [];
  const weights = (refdata.data && refdata.data.weightClasses) || [];
  const boxerChoices = (refdata.data && refdata.data.boxerChoices) || [];

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      await adminAction('/api/admin/fights', 'POST', {
        title: form.title,
        eventId: form.eventId || null,
        boxer1: form.boxer1 || null,
        boxer2: form.boxer2 || null,
        weightClass: form.weightClass || null,
        date: form.date || null,
        venue: form.venue || null,
        country: form.country || null,
        status: form.status,
      });
      setShowForm(false);
      setForm({ title: '', eventId: '', boxer1: '', boxer2: '', weightClass: '', date: '', venue: '', country: '', status: 'scheduled' });
      fights.bump();
    } catch (e2) {
      setErr(e2.message);
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this fight?')) return;
    setActErr('');
    setBusyId(id);
    try {
      await adminAction(`/api/admin/fights/${id}`, 'DELETE');
      fights.bump();
    } catch (e2) {
      setActErr(e2.message);
    }
    setBusyId(null);
  };

  return (
    <AdminLayout title="Fights" admin={admin}>
      <div className="admin-toolbar">
        <button className="btn btn--primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close form' : 'New fight'}
        </button>
      </div>
      {actErr && <p className="rf-error rf-error--summary" role="alert">{actErr}</p>}

      {showForm && (
        <form className="register-form admin-create-form" onSubmit={create}>
          {err && <p className="rf-error rf-error--summary" role="alert">{err}</p>}
          <div className="form-row">
            <div className="form-field">
              <label>Fight / card title</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Alvarez v Mbilli" required />
            </div>
            <div className="form-field">
              <label>Weight class</label>
              <select value={form.weightClass} onChange={set('weightClass')}>
                <option value="">—</option>
                {weights.map((w) => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Boxer 1</label>
              <select value={form.boxer1} onChange={set('boxer1')}>
                <option value="">—</option>
                {boxerChoices.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Boxer 2</label>
              <select value={form.boxer2} onChange={set('boxer2')}>
                <option value="">—</option>
                {boxerChoices.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Event</label>
              <input type="text" value={form.eventId} onChange={set('eventId')} placeholder="Event id (UUID)" />
            </div>
            <div className="form-field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Venue</label>
              <input type="text" value={form.venue} onChange={set('venue')} />
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
          <div className="form-field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Creating…' : 'Create fight'}</button>
        </form>
      )}

      {fights.loading && <p className="admin-note">Loading…</p>}
      {fights.error && <p className="rf-error rf-error--summary" role="alert">{fights.error}</p>}
      {fights.data && (fights.data.fights || []).length === 0 && (
        <div className="admin-empty">No fights yet.</div>
      )}
      {fights.data && (fights.data.fights || []).length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Boxers</th>
                <th>Weight</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fights.data.fights.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.title}</strong>{f.eventName ? <div className="admin-sub">{f.eventName}</div> : null}</td>
                  <td>{[f.boxer1Label, f.boxer2Label].filter(Boolean).join(' vs ') || '—'}</td>
                  <td>{f.weightClassLabel || f.weightClass || '—'}</td>
                  <td>{f.date || '—'}</td>
                  <td>{f.venue || '—'}</td>
                  <td><span className={`admin-chip admin-chip--${f.status}`}>{STATUS_LABEL[f.status] || f.status}</span></td>
                  <td>
                    <button className="btn btn--outline" disabled={busyId === f.id} onClick={() => remove(f.id)}>Delete</button>
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