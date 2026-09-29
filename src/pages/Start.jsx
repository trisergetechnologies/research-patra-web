import { Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import PageMeta from '../components/PageMeta';
import StartIntakeForm from '../components/StartIntakeForm';
import ThemeToggle from '../components/ThemeToggle';
import { SITE } from '../config/site';

const proof = ['100+ theses', 'PhD experts', 'Confidential'];

const steps = [
  { label: 'Submit', detail: 'Share what you need' },
  { label: 'Review', detail: 'We assess within hours' },
  { label: 'Quote', detail: 'Clear scope & timeline' },
];

const WHATSAPP_URL = `https://wa.me/${SITE.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
  'Hi Research Patra — I need help with my research.'
)}`;

export default function Start() {
  return (
    <div className="min-h-screen font-sans text-body flex flex-col relative overflow-x-hidden bg-soft pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <PageMeta
        title="Start Your Research Journey | Research Patra"
        description="Tell us what you need — topic selection, thesis support, or publication help. PhD experts ready to guide your academic journey."
        path="/start"
      />

      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-[#F97316] blur-[140px] opacity-[0.14]" />
      <div className="pointer-events-none absolute top-[20%] -right-40 w-[480px] h-[480px] rounded-full bg-[#EA580C] blur-[130px] opacity-[0.1]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-gradient-to-t from-soft to-transparent" />

      <header className="relative z-40 sticky top-0 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#151c2c]/95 backdrop-blur-md shadow-sm isolate text-slate-900 dark:text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <Link
            to="/"
            className="text-lg sm:text-xl font-extrabold tracking-tight shrink-0 text-slate-900 dark:text-white min-h-11 inline-flex items-center"
          >
            Research <span className="text-[#F97316]">Patra</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center min-h-11 px-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#F97316] transition-colors"
            >
              Full website
            </Link>
            <ThemeToggle className="min-h-11 min-w-11" />
            <a
              href={`tel:${SITE.phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F97316] text-white text-sm font-semibold min-h-11 px-3.5 sm:px-5 shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:bg-[#EA580C] active:scale-[0.98] transition-all"
            >
              <Phone size={16} aria-hidden />
              <span className="hidden min-[380px]:inline">Call</span>
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 lg:pt-14 pb-8 sm:pb-14 lg:pb-16">
          {/* Mobile compact hero — form comes next */}
          <div className="lg:hidden mb-5 start-fade-in">
            <p className="text-[#F97316] font-bold text-xs tracking-wide uppercase mb-2">
              Research Patra
            </p>
            <h1 className="text-[1.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 dark:text-white">
              Tell us what you need.
              <span className="block text-[#F97316]">We’ll take it from there.</span>
            </h1>
            <p className="mt-2.5 text-sm text-muted font-medium leading-relaxed">
              PhD experts for topics, thesis chapters, and journal manuscripts.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {proof.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-16 items-start">
            {/* Desktop copy column */}
            <div className="hidden lg:block lg:pt-4 start-fade-in">
              <p className="text-[#F97316] font-bold text-sm tracking-wide mb-3">
                Research Patra
              </p>
              <h1 className="text-5xl xl:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight mb-4 text-slate-900 dark:text-white">
                Tell us what you need.
                <span className="block text-[#F97316] mt-1">We’ll take it from there.</span>
              </h1>
              <p className="text-lg text-muted font-medium leading-relaxed max-w-md mb-8">
                Topic selection, thesis chapters, or journal-ready manuscripts — our PhD experts guide you through every stage.
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-muted mb-10">
                {proof.map((item, i) => (
                  <span key={item} className="inline-flex items-center gap-3">
                    {i > 0 && <span className="w-px h-4 bg-gray-300 dark:bg-slate-600" aria-hidden />}
                    {item}
                  </span>
                ))}
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted mb-4">
                What happens next
              </p>
              <div className="flex items-stretch gap-0">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-start flex-1 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F172A] text-white text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{step.label}</span>
                      </div>
                      <p className="text-xs text-muted pl-9 leading-snug">{step.detail}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex-1 mx-3 mt-3.5 h-px bg-gradient-to-r from-gray-300 dark:from-slate-600 to-transparent min-w-[12px]" aria-hidden />
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-10 text-sm text-muted">
                Prefer WhatsApp or a quick call?{' '}
                <a href={`tel:${SITE.phone}`} className="font-bold text-[#F97316] hover:underline">
                  {SITE.phoneDisplay}
                </a>
                {' · '}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#F97316] hover:underline"
                >
                  WhatsApp
                </a>
              </p>
            </div>

            {/* Form — primary focus on mobile */}
            <div className="start-fade-in-delay" id="request">
              <div className="relative rounded-2xl sm:rounded-[1.75rem] bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.18)] dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] p-5 sm:p-8 text-slate-900 dark:text-slate-100">
                <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-[#F97316]/60 to-transparent" />
                <div className="mb-5 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Start your request</h2>
                  <p className="text-sm text-muted mt-1">
                    About a minute. We usually reply within a few hours.
                  </p>
                </div>
                <StartIntakeForm source="ads-start" />
              </div>

              <div className="lg:hidden mt-6 grid grid-cols-3 gap-2">
                {steps.map((step, i) => (
                  <div
                    key={step.label}
                    className="text-center rounded-xl bg-white/80 dark:bg-[#151c2c]/80 border border-slate-200 dark:border-white/10 px-2 py-3 min-h-[5.5rem]"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0F172A] text-white text-xs font-bold mb-1.5">
                      {i + 1}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{step.label}</p>
                    <p className="text-[11px] text-muted mt-0.5 leading-snug">{step.detail}</p>
                  </div>
                ))}
              </div>

              <p className="lg:hidden mt-5 text-center text-sm text-muted">
                Or call{' '}
                <a href={`tel:${SITE.phone}`} className="font-bold text-[#F97316]">
                  {SITE.phoneDisplay}
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-theme py-5 px-5 text-center text-sm text-muted bg-surface dark:bg-[#151c2c]">
        <p>
          © {new Date().getFullYear()} Research Patra ·{' '}
          <Link to="/services" className="font-semibold text-[#F97316] hover:underline">
            Explore services
          </Link>
          {' · '}
          <Link to="/" className="font-semibold text-muted hover:text-[#F97316] transition-colors">
            Home
          </Link>
        </p>
      </footer>

      {/* Mobile sticky Call + WhatsApp */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#151c2c]/95 backdrop-blur-md px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
        role="navigation"
        aria-label="Quick contact"
      >
        <div className="max-w-lg mx-auto grid grid-cols-2 gap-2.5">
          <a
            href={`tel:${SITE.phone}`}
            className="inline-flex items-center justify-center gap-2 min-h-12 rounded-full bg-[#F97316] text-white text-sm font-bold shadow-[0_6px_16px_rgba(249,115,22,0.35)] active:scale-[0.98] transition-transform"
          >
            <Phone size={17} aria-hidden />
            Call now
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-12 rounded-full border-2 border-[#25D366] text-[#128C7E] dark:text-[#25D366] bg-white dark:bg-[#0B1220] text-sm font-bold active:scale-[0.98] transition-transform"
          >
            <MessageCircle size={17} aria-hidden />
            WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        @keyframes startFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .start-fade-in {
          animation: startFadeIn 0.45s ease-out both;
        }
        .start-fade-in-delay {
          animation: startFadeIn 0.45s ease-out 0.08s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .start-fade-in,
          .start-fade-in-delay {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
