import { PieChart, Activity, TrendingUp, Terminal } from 'lucide-react';
import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';

const page = getServicePage('statistical-analysis');

const SoftwareStack = () => (
  <section className="py-8 bg-[#F97316] border-y-4 border-white">
    <div className="max-w-7xl mx-auto px-6">
      <p className="text-center text-orange-100 font-bold tracking-widest uppercase text-sm mb-4">
        Software & Tools We Use
      </p>
      <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-white font-bold text-lg md:text-xl">
        {['IBM SPSS', 'AMOS', 'SmartPLS', 'Python', 'R Studio', 'MATLAB'].map((tool) => (
          <span key={tool}>{tool}</span>
        ))}
      </div>
    </div>
  </section>
);

const Capabilities = () => (
  <section className="py-16 max-w-7xl mx-auto px-6">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-extrabold text-[#0F172A]">Analytical Capabilities</h2>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { icon: PieChart, title: 'Descriptive Statistics', text: 'Demographics, means, frequency tables, and summary charts.' },
        { icon: Activity, title: 'Inferential Statistics', text: 'ANOVA, t-tests, chi-square, correlation, and regression.' },
        { icon: TrendingUp, title: 'Structural Equation Modeling', text: 'CFA, mediation, and moderation using AMOS or SmartPLS.' },
      ].map(({ icon: Icon, title, text }) => (
        <div key={title} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <Icon className="text-[#F97316] mb-4" size={28} />
          <h3 className="font-bold text-[#0F172A] mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
        </div>
      ))}
      <div className="lg:col-span-3 bg-slate-50 p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row gap-4 items-start">
        <Terminal className="text-[#F97316] shrink-0" size={32} />
        <div>
          <h3 className="font-bold text-[#0F172A] mb-2">Advanced Analysis (R & Python)</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Custom statistical scripts, data cleaning, and advanced modeling for thesis and journal requirements.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const StatisticalAnalysis = () => (
  <ServicePageLayout page={page}>
    <SoftwareStack />
    <Capabilities />
  </ServicePageLayout>
);

export default StatisticalAnalysis;
