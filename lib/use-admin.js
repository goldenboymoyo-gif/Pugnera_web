// Client-side data hook for the admin dashboard.
import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../lib/client-api';

export function useAdminData(path, { autoload = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoload);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch(path);
    if (!res.ok) {
      setError(res.error || 'Could not load data');
      setLoading(false);
      return;
    }
    setData(res.data);
    setLoading(false);
  }, [path]);

  useEffect(() => {
    if (autoload) reload();
  }, [autoload, reload, version]);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, reload, bump, setData };
}

// Simple async-action helper for admin mutations (approve, delete, etc.).
export async function adminAction(path, method, body) {
  const res = await apiFetch(path, { method, body });
  if (!res.ok) throw new Error(res.error || 'Request failed');
  return res.data;
}