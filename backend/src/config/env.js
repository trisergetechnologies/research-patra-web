import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  port: Number(process.env.PORT) || 5000,
  mongoUri: required('MONGODB_URI'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 7,
  // Use "none" in production when the frontend and API are on different sites.
  cookieSameSite: (process.env.COOKIE_SAMESITE || 'lax').toLowerCase(),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  // Optional at boot so auth keeps working without them; uploads return 503 until they are set.
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'research-patra',
  },
  // Where links in workflow emails point; defaults to the first allowed client origin.
  adminUrl: (process.env.ADMIN_URL || (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',')[0].trim()).replace(/\/$/, ''),
  // Public site origin for reader-facing links (newsletter confirm/unsubscribe); the blog lives under /blog.
  siteUrl: (process.env.SITE_URL || process.env.ADMIN_URL || (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',')[0].trim()).replace(/\/$/, ''),
  blogRevalidateUrl: process.env.BLOG_REVALIDATE_URL || '',
  revalidateSecret: process.env.REVALIDATE_SECRET || '',
  // Optional at boot; in development login codes are printed to the console until these are set.
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
    from: process.env.MAIL_FROM || '',
  },
  seedAdminEmail: (process.env.SEED_ADMIN_EMAIL || 'researchpatra@gmail.com').toLowerCase(),
  seedAdminName: process.env.SEED_ADMIN_NAME || 'Research Patra',
  seedStaffEmail: (process.env.SEED_STAFF_EMAIL || 'vaibhavkpandey13@gmail.com').toLowerCase(),
  seedStaffName: process.env.SEED_STAFF_NAME || 'Vaibhav Pandey',
  // External plagiarism discovery. Tavily is required for a web check; OpenAlex is optional academic OA.
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
  openAlexApiKey: process.env.OPENALEX_API_KEY || '',
  openAlexMailto: process.env.OPENALEX_MAILTO || '',
};
