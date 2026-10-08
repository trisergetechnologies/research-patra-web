import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/blog',
  poweredByHeader: false,
  // This app lives inside the main site's repo; keep Turbopack from treating the parent folder as the root.
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
  },
};

export default nextConfig;
