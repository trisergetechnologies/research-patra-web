// next/image loader (next.config.mjs -> images.loaderFile). Cloudinary already serves AVIF/WebP with
// automatic quality, so instead of re-encoding through Next we just ask Cloudinary for the needed width.
const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)([^/]*\b[whc]_[^/]*)\/(.+)$/;

export default function imageLoader({ src, width, quality }) {
  const m = src.match(CLOUDINARY);
  if (!m) return src;
  const [, base, transform, publicId] = m;
  const parts = Object.fromEntries(transform.split(',').map((p) => [p.slice(0, p.indexOf('_')), p.slice(p.indexOf('_') + 1)]));
  const w = Number(parts.w);
  const h = Number(parts.h);
  // Keep the slot's aspect ratio when the stored URL is a fixed crop.
  const height = w && h ? `,h_${Math.round((width * h) / w)}` : '';
  return `${base}f_auto,q_${quality || 'auto'},c_${parts.c || 'limit'},w_${width}${height}/${publicId}`;
}
