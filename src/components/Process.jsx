import React from 'react';
import { Search, PenTool, FileSearch, Award } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Affordable Prices",
    desc: "High-quality academic writing and research support at student-friendly, transparent, our team brings in-depth subject knowledge and proven expertise to every project.",
    icon: <Search className="text-[#F97316]" size={28} />
  },
  {
    num: "02",
    title: "Expert Team",
    desc: "Experienced academic writers and researchers dedicated to crafting exceptional dissertations, theses, and research papers.",
    icon: <PenTool className="text-[#F97316]" size={28} />
  },
  {
    num: "03",
    title: "Proven Academic Practices",
    desc: "Ethical solutions that enhance learning and protect academic credibility",
    icon: <FileSearch className="text-[#F97316]" size={28} />
  },
  {
    num: "04",
    title: "Client Focus",
    desc: "Prioritizing student & researchers success with personalized academic support and one-to-one guidance.",
    icon: <Award className="text-[#F97316]" size={28} />
  }
];

const Process = () => {
  return (
    <section id="process" className="py-24 relative bg-white overflow-hidden z-10 border-t border-gray-100">
      
      {/* 1. TEXTURE: The Tech Dot-Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)', 
          backgroundSize: '30px 30px' 
        }}
      ></div>

      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-50/50 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-6 tracking-tight">
            How We Achieve <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#EA580C]">Excellence</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            A proven, four-step methodology designed to take you from a blank page to a polished, submission-ready document with zero stress.
          </p>
        </div>

        {/* The Staggered Interactive Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              // The "Stagger" effect: pushes the even cards down slightly to break the boring straight line
              className={`relative group bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(249,115,22,0.1)] hover:-translate-y-2 transition-all duration-500 ${index % 2 !== 0 ? 'lg:mt-12' : ''}`}
            >
              
              {/* Massive faded background number for depth */}
              <div className="absolute top-4 right-6 text-7xl font-extrabold text-gray-50 group-hover:text-orange-50 transition-colors duration-500 pointer-events-none select-none">
                {step.num}
              </div>

              {/* Icon floating in a glassy circle */}
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-8 group-hover:bg-[#F97316] group-hover:scale-110 transition-all duration-500 relative z-10">
                {/* We clone the icon to change its color on hover without breaking the component */}
                {React.cloneElement(step.icon, { 
                  className: "text-[#F97316] group-hover:text-white transition-colors duration-500" 
                })}
              </div>
              
              <h3 className="text-xl font-bold text-[#0F172A] mb-4 relative z-10 group-hover:text-[#F97316] transition-colors">
                {step.title}
              </h3>
              
              <p className="text-gray-500 leading-relaxed font-medium relative z-10">
                {step.desc}
              </p>

              {/* A tiny green accent line that expands on hover */}
              <div className="absolute bottom-0 left-8 right-8 h-1 bg-[#F97316] rounded-t-full opacity-0 group-hover:opacity-100 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Process;