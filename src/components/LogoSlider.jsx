import React from 'react';

import elsevierImg from '../assets/publishers/elsevier.png';
import scopusImg from '../assets/publishers/scopus.png';
import springerImg from '../assets/publishers/springer.png';
import wileyImg from '../assets/publishers/wiley.png';
import taylorFrancisImg from '../assets/publishers/taylor-francis.png';
import natureImg from '../assets/publishers/nature.png';
import ieeeImg from '../assets/publishers/ieee.png';
import sageImg from '../assets/publishers/sage.png';
import mdpiImg from '../assets/publishers/mdpi.png';
import plosImg from '../assets/publishers/plos.png';
import oxfordImg from '../assets/publishers/oxford.png';
import pubmedImg from '../assets/publishers/pubmed.png';
import acmImg from '../assets/publishers/acm.png';
import cambridgeImg from '../assets/publishers/cambridge.png';
import frontiersImg from '../assets/publishers/frontiers.png';

const publisherLogos = [
  { src: elsevierImg, alt: 'Elsevier', name: 'Elsevier' },
  { src: scopusImg, alt: 'Scopus', name: 'Scopus' },
  { src: springerImg, alt: 'Springer', name: 'Springer' },
  { src: wileyImg, alt: 'Wiley', name: 'Wiley' },
  { src: taylorFrancisImg, alt: 'Taylor & Francis', name: 'Taylor & Francis' },
  { src: natureImg, alt: 'Nature', name: 'Nature' },
  { src: ieeeImg, alt: 'IEEE', name: 'IEEE' },
  { src: sageImg, alt: 'SAGE Publications', name: 'SAGE' },
  { src: mdpiImg, alt: 'MDPI', name: 'MDPI' },
  { src: plosImg, alt: 'PLOS', name: 'PLOS' },
  { src: oxfordImg, alt: 'Oxford University Press', name: 'Oxford University Press' },
  { src: pubmedImg, alt: 'PubMed', name: 'PubMed' },
  { src: acmImg, alt: 'ACM', name: 'ACM' },
  { src: cambridgeImg, alt: 'Cambridge University Press', name: 'Cambridge University Press' },
  { src: frontiersImg, alt: 'Frontiers', name: 'Frontiers' },
];

const LogoSlider = () => {
  const trackLogos = [...publisherLogos, ...publisherLogos];

  return (
    <section className="py-16 md:py-20 bg-[#F8FAFC] relative z-20 border-y border-gray-100 overflow-hidden">
      <style>
        {`
          @keyframes infinite-slide {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-infinite-slide {
            animation: infinite-slide 45s linear infinite;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-6 mb-10 md:mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
          Formatted for Leading Academic Publishers
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-sm md:text-base leading-relaxed">
          Manuscripts prepared for Scopus, SCI, and leading publishers including Elsevier, Springer, Wiley, and Nature.
        </p>
        <div className="w-20 h-1.5 bg-[#F97316] mx-auto mt-6 rounded-full shadow-sm" />
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="absolute top-0 left-0 w-24 md:w-40 h-full bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 md:w-40 h-full bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-infinite-slide hover:[animation-play-state:paused] py-2">
          {trackLogos.map((logo, index) => (
            <div
              key={`${logo.alt}-${index}`}
              className="flex-shrink-0 w-60 md:w-72 mx-3 md:mx-4 bg-white border border-gray-100 h-36 md:h-40 flex flex-col items-center justify-center gap-2.5 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.05)] px-4 md:px-5 py-3"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                title={logo.alt}
                loading="lazy"
                className="h-14 md:h-[4.25rem] w-auto max-w-[200px] object-contain transition-transform duration-300 hover:scale-105"
              />
              <p className="text-[11px] md:text-xs font-bold text-[#0F172A] text-center leading-tight line-clamp-2 px-1">
                {logo.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoSlider;
