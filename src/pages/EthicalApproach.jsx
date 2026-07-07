import { ShieldCheck, FileText, Users, BookOpen } from 'lucide-react';
import PageMeta from '../components/PageMeta';
import ServiceContactLink from '../components/ServiceContactLink';
import { HUB_PAGES } from '../data/servicePages';

const meta = HUB_PAGES['ethical-approach'];

const principles = [
  { icon: FileText, title: 'Original writing', text: 'Documents are written from scratch based on your requirements and checked for plagiarism where agreed.' },
  { icon: Users, title: 'Transparent support', text: 'We provide writing and formatting assistance tailored to your academic goals and program requirements.' },
  { icon: ShieldCheck, title: 'University alignment', text: 'We follow your university format, citation style, and supervisor feedback within agreed scope.' },
  { icon: BookOpen, title: 'Scholar-led decisions', text: 'You remain the author and decision-maker for how you use, present, and advance your research work.' },
];

const EthicalApproach = () => (
  <div className="bg-white overflow-x-hidden">
    <PageMeta title={meta.metaTitle} description={meta.metaDescription} path={meta.path} />
    <section className="py-20 md:py-24 bg-[#0F172A] text-center px-6">
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Our Ethical Approach</h1>
      <p className="text-gray-400 max-w-2xl mx-auto text-lg">
        Academic integrity guides every project we take on.
      </p>
    </section>
    <section className="py-16 max-w-4xl mx-auto px-6 space-y-6">
      {principles.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 bg-slate-50">
          <Icon className="text-[#F97316] shrink-0" size={28} />
          <div>
            <h2 className="font-bold text-[#0F172A] mb-1">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
          </div>
        </div>
      ))}
    </section>
    <section className="py-12 px-6 bg-orange-50 border-y border-orange-100">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-gray-700 leading-relaxed font-medium">
          Research Patra provides ethical academic writing, analysis, and formatting support. We help scholars
          plan, write, and refine their work with clarity, structure, and respect for academic standards.
        </p>
      </div>
    </section>
    <ServiceContactLink
      serviceName="ethical research support"
      message="I have a question about your ethical approach and how you can help with my project."
      source="ethical-approach"
      linkText="Ask about our approach"
    />
  </div>
);

export default EthicalApproach;
