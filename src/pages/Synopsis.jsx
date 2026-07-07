import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';
import { CheckCircle2 } from 'lucide-react';

const page = getServicePage('synopsis');

const StrongProposal = () => (
  <section className="py-16 max-w-5xl mx-auto px-6">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-extrabold text-[#0F172A]">What Makes a Strong Research Proposal</h2>
      <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
        University committees look for clarity, feasibility, and alignment with academic standards. We help you build each element.
      </p>
    </div>
    <div className="grid md:grid-cols-2 gap-6">
      {[
        { title: 'Clear problem statement', text: 'A focused research problem with defined scope and significance.' },
        { title: 'Realistic objectives', text: 'Specific, measurable aims that match your timeline and resources.' },
        { title: 'Evidence-based literature', text: 'A review that maps existing work and identifies your research gap.' },
        { title: 'Sound methodology', text: 'A feasible design with appropriate data collection and analysis methods.' },
      ].map((item) => (
        <div key={item.title} className="flex gap-4 bg-slate-50 p-6 rounded-2xl border border-gray-100">
          <CheckCircle2 className="text-[#F97316] shrink-0 mt-1" size={22} />
          <div>
            <h3 className="font-bold text-[#0F172A] mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Synopsis = () => (
  <ServicePageLayout page={page}>
    <StrongProposal />
  </ServicePageLayout>
);

export default Synopsis;
