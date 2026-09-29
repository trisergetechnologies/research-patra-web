import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useContactForm } from '../context/ContactFormContext';
import MegaMenu from './MegaMenu';
import ThemeToggle from './ThemeToggle';
import { MEGA_MENU } from '../data/servicePages';

const navLink =
  'text-slate-900 dark:text-white hover:text-[#F97316] font-bold transition whitespace-nowrap';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [openColumn, setOpenColumn] = useState(null);
  const { openContactForm } = useContactForm();

  const closeMobile = () => {
    setIsOpen(false);
    setServicesOpen(false);
    setOpenColumn(null);
  };

  const handleQuoteClick = () => {
    closeMobile();
    openContactForm({ source: 'navbar' });
  };

  return (
    <nav className="relative w-full sticky top-0 z-50 bg-white dark:bg-[#151c2c] border-b border-slate-200 dark:border-white/10 shadow-md dark:shadow-sm isolate text-slate-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex justify-between items-center gap-3">
        <Link to="/" className="text-xl sm:text-2xl font-extrabold text-[#F97316] tracking-tight shrink-0">
          Research Patra
        </Link>

        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          <Link to="/" className={navLink}>Home</Link>

          <div className="relative group">
            <button type="button" className={`flex items-center gap-1 ${navLink} py-6`}>
              Our Services <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <MegaMenu />
          </div>

          <Link to="/about" className={navLink}>About Us</Link>

          <ThemeToggle className="shrink-0" />

          <button
            type="button"
            onClick={() => openContactForm({ source: 'navbar' })}
            className="shrink-0 px-5 xl:px-6 py-2.5 bg-[#F97316] text-white rounded-full font-bold shadow-[0_4px_14px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            Send a Message
          </button>
        </div>

        <div className="flex lg:hidden items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden absolute w-full left-0 top-full z-50 max-h-[min(80vh,calc(100dvh-4rem))] overflow-y-auto pb-6 shadow-2xl border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#151c2c] text-slate-900 dark:text-white">
          <div className="flex flex-col px-5 sm:px-6 pt-4 space-y-5">
            <Link to="/" className="text-lg font-bold text-slate-900 dark:text-white" onClick={closeMobile}>Home</Link>
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center justify-between text-lg font-bold text-slate-900 dark:text-white w-full text-left"
              >
                Our Services
                <ChevronDown size={20} className={`transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="pl-2 flex flex-col space-y-4 border-l-2 border-orange-100 dark:border-orange-900/50 mt-2">
                  {MEGA_MENU.map((col) => (
                    <div key={col.title}>
                      <button
                        type="button"
                        onClick={() => setOpenColumn(openColumn === col.title ? null : col.title)}
                        className="flex items-center justify-between w-full text-sm font-bold text-[#F97316] uppercase tracking-wide mb-2"
                      >
                        {col.title}
                        <ChevronDown size={16} className={`transition-transform ${openColumn === col.title ? 'rotate-180' : ''}`} />
                      </button>
                      {openColumn === col.title && (
                        <div className="pl-3 flex flex-col space-y-3 mb-2">
                          {col.links.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to}
                              className="text-slate-600 dark:text-slate-300 font-semibold text-sm"
                              onClick={closeMobile}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link to="/about" className="text-lg font-bold text-slate-900 dark:text-white" onClick={closeMobile}>About Us</Link>
            <button type="button" onClick={handleQuoteClick} className="w-full py-3.5 mt-2 bg-[#F97316] text-white rounded-xl font-bold shadow-lg">
              Send a Message
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
