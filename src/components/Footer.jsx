import React from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-[#F97316] tracking-tight">Research Patra</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
              Reliable dissertation and research writing services. Empowering researchers with transparent, high-quality academic support.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3 text-white tracking-tight">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-[#F97316] transition duration-200">Home</Link></li>
              <li><Link to="/about" className="hover:text-[#F97316] transition duration-200">About Us</Link></li>
              <li><Link to="/services" className="hover:text-[#F97316] transition duration-200">Our Services</Link></li>
              <li><Link to="/how-we-work" className="hover:text-[#F97316] transition duration-200">How We Work</Link></li>
              <li><Link to="/research-areas" className="hover:text-[#F97316] transition duration-200">Research Areas</Link></li>
              <li><Link to="/ethical-approach" className="hover:text-[#F97316] transition duration-200">Ethical Approach</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white tracking-tight">Reach Us</h4>
            <div className="text-gray-400 text-sm space-y-2.5">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-bold text-gray-300">Email:</span>
                <a href={`mailto:${SITE.email}`} className="hover:text-[#F97316] transition">{SITE.email}</a>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-bold text-gray-300">Call:</span>
                <a href={`tel:${SITE.phone}`} className="hover:text-[#F97316] transition">{SITE.phoneDisplay}</a>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-500 space-y-2">
          <p>
            <Link to="/privacy-policy" className="hover:text-[#F97316] transition duration-200">Privacy Policy</Link>
            <span className="mx-2">·</span>
            <Link to="/terms-and-conditions" className="hover:text-[#F97316] transition duration-200">Terms & Conditions</Link>
          </p>
          <p>Copyright © 2026 | Research Patra | All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
