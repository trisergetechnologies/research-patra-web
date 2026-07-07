import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';
import { FileText, Layers, CheckSquare, BarChart, Award } from 'lucide-react';

const page = getServicePage('thesis-writing');

const ChapterBreakdown = () => (
  <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 bg-slate-50 border-y border-gray-100">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">
        Chapter-by-Chapter Support
      </h2>
      <p className="text-gray-500 max-w-2xl mx-auto">
        A structured framework aligned to typical university thesis formats.
      </p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { num: '01', icon: FileText, title: 'Introduction', text: 'Background, problem statement, objectives, and scope.' },
        { num: '02', icon: Layers, title: 'Literature Review', text: 'Critical analysis of existing research and gap identification.' },
        { num: '03', icon: CheckSquare, title: 'Methodology', text: 'Study design, sampling, instruments, and analysis plan.' },
        { num: '04', icon: BarChart, title: 'Results & Analysis', text: 'Data presentation, statistical tests, and interpretation.' },
        { num: '05', icon: Award, title: 'Discussion & Conclusion', text: 'Findings synthesis, limitations, formatting, and references.' },
      ].map(({ num, icon: Icon, title, text }) => (
        <div key={num} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-[#F97316] font-black text-sm">{num}</span>
          <Icon className="text-gray-300 w-10 h-10 mt-3 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const ThesisWriting = () => (
  <ServicePageLayout page={page}>
    <ChapterBreakdown />
  </ServicePageLayout>
);

export default ThesisWriting;
