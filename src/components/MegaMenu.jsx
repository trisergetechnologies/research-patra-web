import { Link } from 'react-router-dom';
import { useContactForm } from '../context/ContactFormContext';
import { MEGA_MENU } from '../data/servicePages';

export default function MegaMenu({ onNavigate }) {
  const { openContactForm } = useContactForm();

  const handleClick = () => {
    onNavigate?.();
  };

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-16 md:top-20 w-[min(100vw-1.5rem,920px)] bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 shadow-2xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden pointer-events-none group-hover:pointer-events-auto z-50">
      <div className="grid lg:grid-cols-[240px_1fr]">
        {/* Intentional navy accent — same in both themes */}
        <div className="bg-[#0F172A] p-6 text-white hidden lg:flex flex-col justify-between">
          <div>
            <p className="font-bold text-lg mb-2">Research Patra</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ethical thesis writing, data analysis, and manuscript formatting for scholars worldwide.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              openContactForm({ source: 'mega-menu' });
              handleClick();
            }}
            className="mt-6 w-full py-2.5 bg-[#F97316] text-white font-bold rounded-full text-sm hover:bg-[#EA580C] transition-colors"
          >
            Send a Message
          </button>
        </div>
        {/* Explicit panel bg + text so links never go dark-on-dark */}
        <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white dark:bg-[#151c2c]">
          {MEGA_MENU.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-black uppercase tracking-wider text-[#F97316] mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={handleClick}
                      className="block group/link"
                    >
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover/link:text-[#F97316] transition-colors">
                        {link.label}
                      </span>
                      <span className="block text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{link.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
