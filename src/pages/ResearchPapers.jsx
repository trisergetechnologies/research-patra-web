import { FileText, CheckCircle2, BookOpen, PenTool, Globe } from 'lucide-react';
import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';

const page = getServicePage('research-papers');

const ManuscriptTracks = () => (
  <section className="py-16 max-w-7xl mx-auto px-6">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-extrabold text-[#0F172A]">What Type of Manuscript Do You Need?</h2>
    </div>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <FileText size={40} className="text-[#F97316] mb-4" />
        <h3 className="text-2xl font-bold text-[#0F172A] mb-3">Empirical Research Paper</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          Based on primary data, experiments, or simulations. We help structure the complete scientific narrative.
        </p>
        <ul className="space-y-2 text-sm font-semibold text-slate-700">
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#F97316] shrink-0 mt-0.5" /> Introduction & literature gap</li>
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#F97316] shrink-0 mt-0.5" /> Methodology & setup</li>
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#F97316] shrink-0 mt-0.5" /> Results, graphs & discussion</li>
        </ul>
      </div>
      <div className="bg-[#0F172A] p-8 rounded-3xl shadow-lg">
        <BookOpen size={40} className="text-white mb-4" />
        <h3 className="text-2xl font-bold text-white mb-3">Systematic Review Paper</h3>
        <p className="text-gray-400 mb-4 text-sm leading-relaxed">
          Secondary research synthesis with structured review methodology and gap identification.
        </p>
        <ul className="space-y-2 text-sm font-semibold text-gray-300">
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#F97316] shrink-0 mt-0.5" /> PRISMA-aligned structure</li>
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#F97316] shrink-0 mt-0.5" /> Thematic synthesis</li>
          <li className="flex gap-2"><CheckCircle2 size={16} className="text-[#F97316] shrink-0 mt-0.5" /> Future research directions</li>
        </ul>
      </div>
    </div>
  </section>
);

const QualityFeatures = () => (
  <section className="py-16 bg-gray-50 border-y border-gray-100">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-[#0F172A]">Manuscript Quality Standards</h2>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          We focus on clarity, structure, and formatting so your manuscript meets target journal requirements.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: PenTool, title: 'Target Journal Formatting', text: 'Margins, citations, and headings aligned to APA, IEEE, Springer, or Elsevier styles.' },
          { icon: CheckCircle2, title: 'Original Writing', text: 'Human-written content with plagiarism review where agreed in scope.' },
          { icon: Globe, title: 'Academic English', text: 'Logical flow, objective tone, and grammatical clarity throughout.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <Icon className="text-[#F97316] mb-4" size={28} />
            <h3 className="font-bold text-[#0F172A] mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ResearchPapers = () => (
  <ServicePageLayout page={page}>
    <ManuscriptTracks />
    <QualityFeatures />
  </ServicePageLayout>
);

export default ResearchPapers;
