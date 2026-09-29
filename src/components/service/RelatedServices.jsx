import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function RelatedServices({ links = [] }) {
  if (!links.length) return null;

  return (
    <section className="py-12 bg-soft border-t border-theme">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-lg font-bold text-body mb-5 text-center">Related Services</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between gap-2 bg-surface border border-theme rounded-xl px-4 py-3 text-sm font-semibold text-body hover:border-[#F97316] hover:text-[#F97316] transition-colors shadow-sm"
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
