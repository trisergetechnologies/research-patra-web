import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import ServiceContactLink from '../components/ServiceContactLink';
import { HUB_PAGES } from '../data/servicePages';

const meta = HUB_PAGES['research-areas'];

const areas = [
  { name: 'Engineering & Technology', text: 'Thesis, papers, and data analysis for technical and engineering research programs.', services: ['/thesis-writing', '/statistical-analysis'] },
  { name: 'Management & Commerce', text: 'Research proposals, SLR, and SEM-based analysis for business and management studies.', services: ['/synopsis', '/systematic-review'] },
  { name: 'Medical & Life Sciences', text: 'Proposal writing, systematic reviews, and statistical support for health sciences.', services: ['/synopsis', '/statistical-analysis'] },
  { name: 'Computer Science & IT', text: 'Research papers, IEEE formatting, and data analysis with Python and R.', services: ['/research-papers', '/statistical-analysis'] },
  { name: 'Pharmacy & Nursing', text: 'Thesis chapters, literature reviews, and journal manuscript formatting.', services: ['/thesis-writing', '/scopus-publication'] },
  { name: 'Education & Humanities', text: 'Qualitative and mixed-methods thesis support and proposal development.', services: ['/thesis-writing', '/topic-selection'] },
  { name: 'Law & Social Sciences', text: 'Structured proposals, literature reviews, and academic editing.', services: ['/synopsis', '/editing-proofreading'] },
  { name: 'Agriculture & Environment', text: 'Field research papers, data analysis, and UGC Care manuscript support.', services: ['/research-papers', '/ugc-publication'] },
];

const levels = ['Undergraduate & Masters', 'PhD & Doctoral Scholars', 'Working Professionals', 'Faculty Researchers'];

const ResearchAreas = () => (
  <div className="bg-white overflow-x-hidden">
    <PageMeta title={meta.metaTitle} description={meta.metaDescription} path={meta.path} />
    <section className="py-20 md:py-24 bg-[#0F172A] text-center px-6">
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Research Areas We Support</h1>
      <p className="text-gray-400 max-w-2xl mx-auto text-lg">
        Subject-matter experts across diverse fields for thesis, papers, reviews, and manuscript formatting.
      </p>
    </section>
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2">
        {levels.map((level) => (
          <span key={level} className="text-xs font-semibold px-4 py-2 bg-orange-50 border border-orange-100 rounded-full text-[#0F172A]">
            {level}
          </span>
        ))}
      </div>
    </section>
    <section className="py-8 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-6 pb-16">
      {areas.map((area) => (
        <div key={area.name} className="p-6 rounded-2xl border border-gray-100 bg-slate-50">
          <h2 className="text-lg font-bold text-[#0F172A] mb-2">{area.name}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{area.text}</p>
          <div className="flex flex-wrap gap-2">
            {area.services.map((to) => (
              <Link key={to} to={to} className="text-xs font-bold text-[#F97316] hover:underline">
                {to.replace('/', '').replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
    <ServiceContactLink
      serviceName="research in your field"
      message="I would like to discuss support for my research area."
      source="research-areas"
      linkText="Tell us about your field"
    />
  </div>
);

export default ResearchAreas;
