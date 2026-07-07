import { Link } from 'react-router-dom';
import { MessageSquare, FileCheck, RefreshCw, Shield } from 'lucide-react';
import PageMeta from '../components/PageMeta';
import ServiceContactLink from '../components/ServiceContactLink';
import { HUB_PAGES, SERVICE_PAGES } from '../data/servicePages';

const meta = HUB_PAGES['how-we-work'];

const steps = [
  { icon: MessageSquare, title: 'Share your requirements', text: 'Tell us your program, deadline, university format, and what you need help with via our contact form.' },
  { icon: FileCheck, title: 'Scope & quote', text: 'We confirm deliverables, timeline, and provide a transparent quote based on your project.' },
  { icon: RefreshCw, title: 'Phased delivery', text: 'Work is delivered in agreed phases so you can review and share with your supervisor.' },
  { icon: Shield, title: 'Revision within scope', text: 'Feedback-based revisions are included per the agreed scope for each phase.' },
];

const HowWeWork = () => (
  <div className="bg-white overflow-x-hidden">
    <PageMeta title={meta.metaTitle} description={meta.metaDescription} path={meta.path} />
    <section className="py-20 md:py-24 bg-[#0F172A] text-center px-6">
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4">How We Work</h1>
      <p className="text-gray-400 max-w-2xl mx-auto text-lg">
        A clear, ethical process from first message to final delivery.
      </p>
    </section>
    <section className="py-16 max-w-5xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-6">
        {steps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="p-6 rounded-2xl border border-gray-100 bg-slate-50">
            <Icon className="text-[#F97316] mb-3" size={28} />
            <h2 className="font-bold text-[#0F172A] mb-2">{title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
    <section className="py-16 bg-slate-50 border-y border-gray-100 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-4">Confidentiality & communication</h2>
        <p className="text-gray-600 leading-relaxed">
          Your project details, documents, and correspondence are handled with care. We keep you updated at each
          phase and welcome supervisor feedback as part of the agreed revision process.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Learn more about our standards on the{' '}
          <Link to="/ethical-approach" className="text-[#F97316] font-bold hover:underline">
            Ethical Approach
          </Link>{' '}
          page.
        </p>
      </div>
    </section>
    <section className="py-16 max-w-5xl mx-auto px-6">
      <h2 className="text-2xl font-extrabold text-[#0F172A] mb-6 text-center">Our Services</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.values(SERVICE_PAGES).map((s) => (
          <Link
            key={s.path}
            to={s.path}
            className="text-sm font-semibold px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-[#F97316] hover:text-[#F97316] transition-colors"
          >
            {s.title}
          </Link>
        ))}
      </div>
    </section>
    <ServiceContactLink
      serviceName="your research project"
      message="I would like to discuss how your process works for my project."
      source="how-we-work"
      linkText="Start a conversation"
    />
  </div>
);

export default HowWeWork;
