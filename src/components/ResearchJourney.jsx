import React from 'react';
import { Link } from 'react-router-dom';
import {
  Lightbulb,
  BookOpen,
  PenLine,
  BarChart2,
  FileCheck,
  ArrowRight,
  GraduationCap,
  FlaskConical,
  Briefcase,
  HeartPulse,
  Scale,
} from 'lucide-react';
import { useContactForm } from '../context/ContactFormContext';

const journeySteps = [
  {
    step: '01',
    icon: Lightbulb,
    title: 'Topic & Proposal',
    text: 'Define your research gap, finalize your topic, and draft a committee-ready proposal or synopsis.',
    link: '/topic-selection',
    linkLabel: 'Topic selection',
  },
  {
    step: '02',
    icon: BookOpen,
    title: 'Literature Review',
    text: 'Build a systematic review that maps existing studies, identifies gaps, and strengthens your argument.',
    link: '/systematic-review',
    linkLabel: 'Literature review',
  },
  {
    step: '03',
    icon: PenLine,
    title: 'Writing & Chapters',
    text: 'Develop thesis chapters or research papers with logical flow, academic tone, and university formatting.',
    link: '/thesis-writing',
    linkLabel: 'Thesis writing',
  },
  {
    step: '04',
    icon: BarChart2,
    title: 'Data & Analysis',
    text: 'Run statistical tests, interpret results, and prepare charts using SPSS, R, Python, or MATLAB.',
    link: '/statistical-analysis',
    linkLabel: 'Data analysis',
  },
  {
    step: '05',
    icon: FileCheck,
    title: 'Edit & Format',
    text: 'Polish grammar, citations, and layout. Format manuscripts for Scopus, SCI, UGC Care, or conference submission.',
    link: '/editing-proofreading',
    linkLabel: 'Editing support',
  },
];

const academicLevels = [
  { icon: GraduationCap, label: 'Undergraduate and Postgraduate Students' },
  { icon: FlaskConical, label: 'Doctoral Candidates (Research Scholars)' },
  { icon: Briefcase, label: 'Working Professionals' },
  { icon: HeartPulse, label: 'Medical & Life Sciences' },
  { icon: Scale, label: 'Law & Social Sciences' },
];

const disciplines = [
  'Engineering & Technology',
  'Management & Commerce',
  'Medical Sciences',
  'Pharmacy & Nursing',
  'Computer Science & IT',
  'Education & Humanities',
  'Law & Public Policy',
  'Agriculture & Environment',
];

const ResearchJourney = () => {
  const { openContactForm } = useContactForm();

  return (
    <section className="py-16 md:py-24 bg-slate-100 dark:bg-[rgb(17,24,39)] border-t border-slate-200 dark:border-theme relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.45] dark:opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-orange-700 dark:text-[#F97316] text-xs font-bold uppercase tracking-widest bg-orange-50 dark:bg-orange-500/15 px-3 py-1.5 rounded-full inline-block mb-3">
            End-to-End Support
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Your Research Journey, Step by Step
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-base leading-relaxed">
            Whether you are starting from scratch or need help with a single chapter, we support every milestone from idea to submission-ready document.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5 mb-14">
          {journeySteps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-none hover:border-orange-300 dark:hover:border-orange-400/40 hover:shadow-md transition-all duration-300 group"
              >
                {index < journeySteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-orange-200 dark:bg-orange-500/40 z-10" />
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/15 flex items-center justify-center group-hover:bg-[#F97316] transition-colors">
                    <Icon className="h-5 w-5 text-[#F97316] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 dark:text-white/20 group-hover:text-orange-300 dark:group-hover:text-orange-500/30 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#F97316] transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{item.text}</p>
                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#F97316] hover:gap-2 transition-all"
                >
                  {item.linkLabel} <ArrowRight size={12} />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-10">
          <div className="bg-[#0F172A] rounded-3xl p-7 md:p-8 text-white">
            <h3 className="text-xl md:text-2xl font-extrabold mb-3">Who We Work With</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Our team supports scholars across academic levels and research backgrounds, with writers matched to your subject area and university format.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {academicLevels.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3"
                >
                  <Icon className="h-4 w-4 text-[#F97316] shrink-0" />
                  <span className="text-sm font-semibold text-gray-200">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-[#1e293b] border border-orange-200 dark:border-orange-700/50 rounded-3xl p-7 md:p-8">
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Disciplines We Cover</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
              Subject-matter experts across diverse fields help ensure your content reads authentically and meets field-specific academic standards.
            </p>
            <div className="flex flex-wrap gap-2">
              {disciplines.map((discipline) => (
                <span
                  key={discipline}
                  className="text-xs font-semibold px-3 py-2 rounded-full
                    bg-white text-slate-800 border border-orange-200
                    dark:bg-[#0F172A] dark:text-slate-100 dark:border-orange-700/60"
                >
                  {discipline}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              Not sure where your project fits?{' '}
              <button
                type="button"
                onClick={() => openContactForm({ message: 'I would like to discuss my research project requirements.', source: 'research-journey' })}
                className="text-[#EA580C] dark:text-[#F97316] font-bold hover:underline"
              >
                Tell us about your work
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchJourney;
