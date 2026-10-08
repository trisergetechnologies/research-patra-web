import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Filters live in the URL so lists survive reloads, back/forward and can be shared. */
export function useUrlFilters(defaults) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const out = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const v = params.get(key);
      if (v !== null) out[key] = typeof defaults[key] === 'number' ? Number(v) || defaults[key] : v;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const setFilters = useCallback(
    (patch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === '' || v == null || v === defaults[k]) next.delete(k);
            else next.set(k, String(v));
          }
          return next;
        },
        { replace: true }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setParams]
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);
  const active = Object.keys(defaults).some((k) => filters[k] !== defaults[k]);

  return [filters, setFilters, { reset, active }];
}
