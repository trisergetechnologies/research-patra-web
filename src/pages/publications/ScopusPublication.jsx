import { getServicePage } from '../../data/servicePages';
import ServicePageLayout from '../../components/service/ServicePageLayout';
import { CheckCircle2 } from 'lucide-react';

const page = getServicePage('scopus-publication');

const ManuscriptChecklist = () => (
  <section className="py-16 max-w-4xl mx-auto px-6">
    <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-black text-[#0F172A] mb-6">Our Manuscript Support Checklist</h2>
      <ul className="space-y-4">
        {[
          'Original manuscript construction or restructuring',
          'Rigorous academic editing',
          'Scopus journal formatting criteria',
          'Plagiarism review (where agreed)',
          'Pre-submission guideline review',
        ].map((item) => (
          <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
            <CheckCircle2 className="text-[#F97316] shrink-0" size={20} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const ScopusPublication = () => (
  <ServicePageLayout page={page}>
    <ManuscriptChecklist />
  </ServicePageLayout>
);

export default ScopusPublication;
