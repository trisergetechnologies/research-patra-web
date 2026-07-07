import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileCheck, RefreshCw, CheckCircle } from 'lucide-react';
import { useContactForm } from '../context/ContactFormContext';

const steps = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Share Requirements',
    text: 'Tell us your program, deadline, university format, and what you need help with via our contact form.',
    points: ['Clear scope', 'Your timeline'],
  },
  {
    icon: FileCheck,
    number: '02',
    title: 'Plan & Quote',
    text: 'We confirm deliverables, timeline, and provide a transparent quote based on your project scope.',
    points: ['Phased delivery', 'Agreed scope'],
  },
  {
    icon: RefreshCw,
    number: '03',
    title: 'Draft & Review',
    text: 'Work is delivered in agreed phases so you can review and share with your supervisor.',
    points: ['Supervisor feedback', 'Revision support'],
  },
  {
    icon: CheckCircle ,
    number: '04',
    title: 'Final Delivery',
    text: 'You receive polished chapters, reports, or formatted manuscripts ready for your next academic step.',
    points: ['Quality check', 'Format alignment'],
  },
];

const Methodology = () => {
  const { openContactForm } = useContactForm();

  return (
    <section className="py-24 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F97316] rounded-full blur-[160px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-slate-700 pb-12">
          <div>
            <p className="text-sm font-bold text-[#F97316] tracking-wider uppercase mb-3">Our approach</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-2xl">
              How We Work With You
            </h2>
            <p className="text-gray-400 text-lg mt-4 font-medium">
              A clear, ethical process from first message to final delivery.
            </p>
          </div>
          <Link
            to="/how-we-work"
            className="px-6 py-2.5 rounded-full bg-[#F97316] text-white font-semibold text-sm hover:bg-[#EA580C] transition-colors w-fit"
          >
            See full process
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-slate-800/40 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:border-[#F97316]/60 hover:shadow-[0_10px_40px_rgba(249,115,22,0.15)] transition-all duration-300 group flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-8">
               <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center border border-slate-600 group-hover:bg-[#F97316] transition-colors duration-300">
    <step.icon className="text-[#F97316] group-hover:text-white" size={32} />
</div>
                <span className="text-5xl font-black text-slate-700 group-hover:text-[#F97316]/20 transition-colors">{step.number}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#F97316] transition-colors">{step.title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed mb-6 flex-grow">{step.text}</p>
              <div className="space-y-3 pt-6 border-t border-slate-700">
                {step.points.map((point) => (
                  <div key={point} className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle className="text-[#F97316]" size={16} /> {point}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-12 border-t border-slate-700">
          <h4 className="text-xl font-bold text-gray-300 mb-4 max-w-xl mx-auto">
            Ready to discuss your research project?
          </h4>
          <p className="text-gray-400 text-sm">
            Questions about our approach?{' '}
            <button
              type="button"
              onClick={() => openContactForm({ message: 'I have a question about your research methodology.', source: 'methodology' })}
              className="text-[#F97316] font-bold hover:underline"
            >
              Send us a message
            </button>
            {' '}or read our{' '}
            <Link to="/ethical-approach" className="text-[#F97316] font-bold hover:underline">
              ethical approach
            </Link>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
