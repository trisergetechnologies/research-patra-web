import slugifyLib from 'slugify';

export function slugify(text, max = 80) {
  return slugifyLib(String(text || ''), { lower: true, strict: true, trim: true }).slice(0, max).replace(/-+$/, '');
}

/**
 * Returns `base` or `base-2`, `base-3`... so the slug is free.
 * `isTaken(slug)` must resolve true when another record already uses it.
 */
export async function uniqueSlug(base, isTaken) {
  const root = base || 'untitled';
  let candidate = root;
  for (let n = 2; await isTaken(candidate); n++) candidate = `${root}-${n}`;
  return candidate;
}

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
