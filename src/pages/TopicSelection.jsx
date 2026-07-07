import { Search, TrendingUp, BookOpen, Filter, Award, FileCheck, Users, CheckCircle2, Settings } from 'lucide-react';
import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';

const page = getServicePage('topic-selection');

const TopicProcess = () => (
  <section className="py-16 bg-slate-50 border-y border-gray-100">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-[#0F172A]">Our 6-Step Topic Selection Process</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Search, title: 'Keyword Selection', desc: 'Core academic keywords aligned with your domain.' },
          { icon: TrendingUp, title: 'Explore Trending Areas', desc: 'Map current trends and future scope in your field.' },
          { icon: BookOpen, title: 'Scientific Relevance', desc: 'Ensure the idea addresses a genuine literature gap.' },
          { icon: Filter, title: 'Identify 8–10 Topics', desc: 'Generate a broad list of potential research titles.' },
          { icon: Award, title: 'Suitability Check', desc: 'Validate topics against university guidelines.' },
          { icon: FileCheck, title: 'Finalize 2–3 Topics', desc: 'Narrow to the best options for your proposal.' },
        ].map(({ icon: Icon, title, desc }) => (
        <div key={title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm !hover:bg-white !hover:border-gray-100 !hover:shadow-sm !transition-none"> 
  {/* The !opacity-100 and !block ensure it stays visible */}
  <Icon className="text-[#F97316] group-hover:text-white mb-4 transition-colors duration-300" size={28} />
  <h3 className="font-bold text-[#0F12A] mb-2">{title}</h3>
  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
</div>
        ))}
      </div>
    </div>
  </section>
);

const TopicPillars = () => (
  <section className="py-12 max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8">
    {[
      { icon: Users, title: 'Customized Support', text: 'Assistance crafted around your research goals and program requirements.' },
      { icon: CheckCircle2, title: 'Expert Guidance', text: 'PhD professionals offer actionable insights to strengthen your concept.' },
      { icon: Settings, title: 'Strategic Refinement', text: 'Scoping and editing to improve feasibility and clarity of your topic.' },
    ].map(({ icon: Icon, title, text }) => (
      <div key={title} className="text-center p-4">
        <Icon className="text-[#F97316] mx-auto mb-3" size={32} />
        <h3 className="font-bold text-[#0F172A] mb-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
      </div>
    ))}
  </section>
);

const TopicSelection = () => (
  <ServicePageLayout page={page}>
    <TopicProcess />
    <TopicPillars />
  </ServicePageLayout>
);

export default TopicSelection;
