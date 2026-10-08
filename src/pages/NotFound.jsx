import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowRight, BookOpen, Search } from 'lucide-react';
import { useContactForm } from '../context/ContactFormContext';
import PageMeta from '../components/PageMeta';

const QUICK_LINKS = [
  { to: '/services', label: 'Our Services' },
  { to: '/thesis-writing', label: 'Thesis Writing' },
  { to: '/research-papers', label: 'Research Papers' },
  { to: '/about', label: 'About Us' },
];

const NotFound = () => {
  const { pathname } = useLocation();
  const { openContactForm } = useContactForm();

  useEffect(() => {
    const robots = document.createElement('meta');
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', 'noindex');
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  return (
    <div className="bg-surface min-h-[80vh] font-sans relative overflow-hidden flex items-center selection:bg-[#f97316] selection:text-white">
      <PageMeta title="Page Not Found | Research Patra" description="The page you are looking for does not exist." />
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#EA580C] rounded-full blur-[140px] opacity-10 pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#F97316] rounded-full blur-[140px] opacity-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-center w-full">
        <p className="text-sm font-bold text-muted tracking-wider uppercase mb-4 flex items-center justify-center gap-2">
          <span className="w-4 h-[2px] bg-[#F97316]"></span> ERROR 404 <span className="w-4 h-[2px] bg-[#F97316]"></span>
        </p>

        <h1 className="text-[7rem] sm:text-[10rem] font-extrabold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#EA580C] animate-slide-up">
          404
        </h1>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-body mt-4 mb-4 leading-tight">
          This page went missing from the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#EA580C]">bibliography.</span>
        </h2>
        <p className="text-lg text-muted font-medium max-w-2xl mx-auto mb-2">
          We couldn't find what you were looking for. It may have been moved or never existed.
        </p>
        <p className="text-sm text-muted font-mono mb-10 break-all">{pathname}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Home size={18} /> Back to Home
          </Link>
          <button
            type="button"
            onClick={() => openContactForm({ source: '404' })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[#F97316] text-[#F97316] font-bold hover:bg-[#F97316] hover:text-white transition-all"
          >
            <BookOpen size={18} /> Talk to an Expert
          </button>
        </div>

        <div className="bg-[#0F172A] rounded-[2rem] p-8 relative shadow-2xl text-left max-w-2xl mx-auto overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F97316] rounded-full blur-[60px] opacity-30 pointer-events-none"></div>
          <p className="text-white font-bold mb-4 flex items-center gap-2 relative">
            <Search size={18} className="text-[#F97316]" /> Popular pages
          </p>
          <div className="grid sm:grid-cols-2 gap-3 relative">
            {QUICK_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-[#F97316] transition-all"
              >
                {label}
                <ArrowRight size={16} className="text-[#F97316] group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
