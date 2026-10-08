import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    rules: {
      // Header/footer links to "/", "/about" etc. point at the main site (outside basePath), so they must be plain <a>.
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  { ignores: ['.next/**', 'node_modules/**'] },
];

export default config;
