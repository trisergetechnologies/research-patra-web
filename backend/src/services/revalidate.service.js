import { env } from '../config/env.js';

/**
 * Tells the Next.js blog to drop cached pages after public content changes.
 * Fire-and-forget: the CMS action has already succeeded; the blog also revalidates hourly on its own.
 */
export function revalidateBlog({ slugs = [], tags = [] } = {}) {
  if (!env.blogRevalidateUrl || !env.revalidateSecret) return;

  const body = JSON.stringify({ slugs: [...new Set(slugs.filter(Boolean))], tags: [...new Set(tags)] });
  fetch(env.blogRevalidateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': env.revalidateSecret },
    body,
    signal: AbortSignal.timeout(5000),
  })
    .then((res) => {
      if (!res.ok) console.warn(`[revalidate] blog responded ${res.status}`);
    })
    .catch((err) => console.warn(`[revalidate] failed: ${err.message}`));
}
