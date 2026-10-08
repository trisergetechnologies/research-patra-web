import { getSitemapData } from './api';

/**
 * Pre-renders known pages at build time. If the API is unreachable during a build we return [],
 * and pages render on first request instead (dynamicParams stays on).
 */
export async function staticParams(kind, key = 'slug') {
  try {
    const data = await getSitemapData();
    return data[kind].map((item) => ({ [key]: item.slug }));
  } catch (err) {
    console.warn(`[blog] generateStaticParams(${kind}) skipped: ${err.message}`);
    return [];
  }
}
