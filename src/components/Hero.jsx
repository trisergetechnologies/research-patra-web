import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SITE } from '../config/site';
import { useContactForm } from '../context/ContactFormContext';

const stats = [
  { value: '100+', label: 'Theses Delivered' },
  { value: '150+', label: 'Combined Expert Years' },
  { value: '100%', label: 'Plagiarism-Free Delivery' },
  { value: '24*7', label: 'Scholar Support' },
];

const Hero = () => {
  const { openContactForm } = useContactForm();

  return (
    <section id="home" className="relative pt-12 pb-12 md:pt-16 md:pb-16 overflow-hidden bg-white">
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#EA580C] rounded-full blur-[140px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#F97316] rounded-full blur-[150px] opacity-15 translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col justify-center text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0F172A] leading-[1.15] mb-4 tracking-tight">
            Expert <span className="text-[#F97316]">Research Writing Support</span> for Your Academic Journey
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            From topic selection to thesis chapters and journal-ready manuscripts. Our PhD experts help you plan, write, and refine your work to meet your university and formatting requirements.
          </p>

          <div className="flex flex-col items-center lg:items-start gap-4 mb-8 w-full">
            <button
              onClick={() => openContactForm({ source: 'hero' })}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F97316] text-white rounded-full font-semibold shadow-[0_8px_20px_rgb(249,115,22,0.35)] hover:-translate-y-1 transition-all"
            >
              Talk to Our Experts
            </button>
            <p className="text-sm text-gray-500 font-medium">
              Or call us at{' '}
              <a href={`tel:${SITE.phone}`} className="text-[#F97316] font-bold hover:underline">
                {SITE.phoneDisplay}
              </a>
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm font-semibold text-gray-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#F97316]" /> Ethical Solutions
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#F97316]" /> Academic Excellence
            </span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto lg:ml-auto relative z-10 lg:mt-0 mt-8">
          <div className="bg-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F97316] rounded-full blur-[60px] opacity-30 pointer-events-none"></div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mb-6 relative z-10">Trusted by Researchers Worldwide</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-[#F97316] mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-medium mt-6 text-center relative z-10 leading-relaxed">
              Manuscripts formatted to IEEE, Springer, Elsevier and Scopus journal guidelines
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
