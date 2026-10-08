/** Cloudinary images go through lib/imageLoader.js; anything else is served as-is. */
export function canOptimize(url) {
  return typeof url === 'string' && url.startsWith('https://res.cloudinary.com/');
}
