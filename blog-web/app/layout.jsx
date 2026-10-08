import Script from 'next/script';
import { Outfit, Bricolage_Grotesque, Instrument_Sans, Source_Serif_4 } from 'next/font/google';
import SiteShell from '@/components/site/SiteShell';
import Footer from '@/components/site/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { DEFAULT_OG_IMAGE, organizationLd, websiteLd } from '@/lib/seo';
import { BLOG_DESCRIPTION, BLOG_NAME, BLOG_URL, SITE_NAME, SITE_URL, abs } from '@/lib/site';
import './globals.css';
import './journal.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', axes: ['opsz'], display: 'swap' });
const instrument = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument', display: 'swap' });
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
});

const GA_ID = 'G-QTV3JJN9GT';
const ADS_ID = 'AW-18407288038';

// Runs before paint so the saved theme (shared with the main site via localStorage) never flashes.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;var v=d?{'--page':'11 18 32','--surface':'17 24 39','--body':'248 250 252','--muted':'203 213 225','--border':'255 255 255','--soft':'15 23 42','--badge':'249 115 22','--scroll-track':'#0F172A','--border-solid':'rgba(255, 255, 255, 0.10)','--badge-solid':'rgba(249, 115, 22, 0.15)'}:{'--page':'255 255 255','--surface':'255 255 255','--body':'15 23 42','--muted':'100 116 139','--border':'226 232 240','--soft':'248 250 252','--badge':'255 247 237','--scroll-track':'#F8FAFC','--border-solid':'#E2E8F0','--badge-solid':'#FFF7ED'};r.classList.toggle('dark',d);for(var k in v)r.style.setProperty(k,v[k]);}catch(e){}})();`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BLOG_NAME} | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  description: BLOG_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: BLOG_URL,
    types: { 'application/rss+xml': [{ url: abs('/feed.xml'), title: BLOG_NAME }] },
  },
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_IN', url: BLOG_URL, images: [DEFAULT_OG_IMAGE] },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE.url] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const fontVars = `${outfit.variable} ${bricolage.variable} ${instrument.variable} ${sourceSerif.variable}`;
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <SiteShell footer={<Footer />}>{children}</SiteShell>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');gtag('config','${ADS_ID}');`}
        </Script>
      </body>
    </html>
  );
}
