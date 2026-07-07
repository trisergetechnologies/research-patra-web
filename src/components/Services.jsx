import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  FileText,
  Search,
  BarChart3,
  Target,
  FileSignature,
  PenTool,
  Globe,
  Award,
  ArrowRight,
  LineChart,
  Lightbulb,
  Presentation,
} from 'lucide-react';

const serviceList = [
  {
    icon: Target,
    title: 'Topic Selection',
    description: 'Identify research gaps and finalize compelling topics aligned with your university and field requirements.',
    link: '/topic-selection',
  },
  {
    icon: FileSignature,
    title: 'Research Proposal & Synopsis',
    description: 'Structured proposals with clear problem statements, objectives, methodology, and literature review.',
    link: '/synopsis',
  },
  {
    icon: GraduationCap,
    title: 'Thesis & Dissertation Writing',
    description: 'Chapter-by-chapter thesis support from introduction through discussion, formatted to your university guidelines.',
    link: '/thesis-writing',
  },
  {
    icon: FileText,
    title: 'Research & Review Papers',
    description: 'Journal-ready academic papers tailored to your subject, styling guide, and target journal requirements.',
    link: '/research-papers',
  },
  {
    icon: Search,
    title: 'Systematic Literature Review',
    description: 'Thorough, organized reviews with critical mapping of existing studies and research gaps.',
    link: '/systematic-review',
  },
  {
    icon: BarChart3,
    title: 'Statistical Data Analysis',
    description: 'Expert analysis with SPSS, AMOS, R, Python, and MATLAB. Hypothesis testing, regression, and charts.',
    link: '/statistical-analysis',
  },
  {
    icon: LineChart,
    title: 'Bibliometric Analysis',
    description: 'Citation mapping, co-authorship networks, and research trend analysis with VOSviewer and Biblioshiny.',
    link: '/bibliometric-analysis',
  },
  {
    icon: Lightbulb,
    title: 'Patent Support',
    description: 'Prior art search, invention documentation, and technical write-ups for patent filing preparation.',
    link: '/patent-support',
  },
  {
    icon: PenTool,
    title: 'Editing & Proofreading',
    description: 'Rigorous review for academic flow, grammar, citation accuracy, and formatting (APA, MLA, Harvard).',
    link: '/editing-proofreading',
  },
  {
    icon: Globe,
    title: 'Scopus Manuscript Support',
    description: 'Manuscript writing and formatting aligned to Scopus journal guidelines for your target journal.',
    link: '/scopus-publication',
  },
  {
    icon: Award,
    title: 'SCI / WoS Manuscript Support',
    description: 'Manuscript writing and formatting aligned to SCI and Web of Science journal guidelines.',
    link: '/sci-journal-publication',
  },
  {
    icon: Presentation,
    title: 'UGC Care & Conference Papers',
    description: 'Conference paper writing and UGC Care journal manuscript formatting for your academic milestones.',
    link: '/ugc-publication',
  },
];

const Services = () => {
  return (
    <section id="services" className="bg-gray-50 py-12 md:py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[#F97316] text-xs font-bold uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-full inline-block mb-3">
            What We Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3 tracking-tight">
            Comprehensive Academic Writing & Research Solutions
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
            From your first research idea to a polished, submission-ready manuscript. Every stage of your academic journey, covered by subject-matter experts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {serviceList.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.link}
                to={service.link}
                className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition duration-300 flex flex-col gap-4 group h-full"
              >
                <div className="p-3 bg-orange-50 rounded-xl w-fit group-hover:bg-orange-100 transition-colors">
                  <Icon className="h-6 w-6 text-[#F97316]" group-hover:text-white/>
                </div>
                <div className="space-y-2 flex-grow">
                  <h3 className="text-lg font-bold text-gray-950 tracking-tight group-hover:text-[#F97316] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[#F97316] font-bold text-sm group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-[#0F172A] font-bold text-sm hover:text-[#F97316] transition-colors"
          >
            View full services overview <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
