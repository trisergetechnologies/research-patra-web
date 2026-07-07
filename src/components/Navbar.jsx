import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useContactForm } from '../context/ContactFormContext';
import MegaMenu from './MegaMenu';
import { MEGA_MENU } from '../data/servicePages';

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
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-[#F97316] tracking-tight">
          Research Patra
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-[#0F172A] hover:text-[#F97316] font-bold transition">Home</Link>

          <div className="relative group static md:static">
            <button type="button" className="flex items-center gap-1 text-[#0F172A] hover:text-[#F97316] font-bold transition py-8">
              Our Services <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <MegaMenu />
          </div>

          <Link to="/about" className="text-[#0F172A] hover:text-[#F97316] font-bold transition">About Us</Link>

          <button
            type="button"
            onClick={() => openContactForm({ source: 'navbar' })}
            className="px-6 py-2.5 bg-[#F97316] text-white rounded-full font-bold shadow-[0_4px_14px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all"
          >
            Send a Message
          </button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-[#0F172A] hover:bg-gray-50 rounded-lg transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-2xl pb-6 max-h-[80vh] overflow-y-auto z-50">
          <div className="flex flex-col px-6 pt-4 space-y-6">
            <Link to="/" className="text-lg font-bold text-[#0F172A]" onClick={closeMobile}>Home</Link>
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center justify-between text-lg font-bold text-[#0F172A] w-full text-left"
              >
                Our Services
                <ChevronDown size={20} className={`transition-transform duration-300 ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="pl-2 flex flex-col space-y-4 border-l-2 border-orange-100 mt-2">
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
                              className="text-gray-600 font-semibold text-sm"
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
            <Link to="/about" className="text-lg font-bold text-[#0F172A]" onClick={closeMobile}>About Us</Link>
            <button type="button" onClick={handleQuoteClick} className="w-full py-3.5 mt-4 bg-[#F97316] text-white rounded-xl font-bold shadow-lg">
              Send a Message
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
