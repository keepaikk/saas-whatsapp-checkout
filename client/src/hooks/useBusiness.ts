import { useEffect, useState } from 'react';
import { getBusiness } from './api';
import { Business } from '../types';

export function useBusiness(slug: string) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let cancelled = false;

    getBusiness(slug)
      .then((b) => { if (!cancelled) { setBusiness(b); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e); setLoading(false); } });

    return () => { cancelled = true; };
  }, [slug]);

  return { business, loading, error };
}
