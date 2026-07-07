import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function RelatedServices({ links = [] }) {
  if (!links.length) return null;

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-lg font-bold text-[#0F172A] mb-5 text-center">Related Services</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#0F172A] hover:border-[#F97316] hover:text-[#F97316] transition-colors shadow-sm"
            >
              {link.label}
              <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
