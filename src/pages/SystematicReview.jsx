import { Database, Filter, FileSpreadsheet, Map } from 'lucide-react';
import { getServicePage } from '../data/servicePages';
import ServicePageLayout from '../components/service/ServicePageLayout';

const page = getServicePage('systematic-review');

const PrismaProcess = () => (
  <section className="py-16 max-w-7xl mx-auto px-6">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-extrabold text-[#0F172A] mb-3">Our Scientific Filtering Process</h2>
      <p className="text-gray-500 max-w-2xl mx-auto">
        A structured protocol for exhaustive, unbiased literature review and gap mapping.
      </p>
    </div>
    <div className="grid md:grid-cols-4 gap-6">
      {[
        { icon: Database, title: 'Identification', desc: 'Boolean searches across Scopus, Web of Science, and IEEE Xplore.' },
        { icon: Filter, title: 'Screening', desc: 'Duplicate removal and inclusion/exclusion filtering.' },
        { icon: FileSpreadsheet, title: 'Extraction', desc: 'Thematic extraction of methodologies and findings.' },
        { icon: Map, title: 'Synthesis', desc: 'Mapping the literature gap your study addresses.' },
      ].map(({ icon: Icon, title, desc }) => (
        <div key={title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto bg-orange-50 text-[#F97316] rounded-xl flex items-center justify-center mb-4">
            <Icon size={26} />
          </div>
          <h3 className="font-bold text-[#0F172A] mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const SystematicReview = () => (
  <ServicePageLayout page={page}>
    <PrismaProcess />
  </ServicePageLayout>
);

export default SystematicReview;
