import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ServiceFAQ({ title = 'Frequently Asked Questions', faqs = [] }) {
  const [open, setOpen] = useState(0);

  if (!faqs.length) return null;

  return (
    <section className="py-16 md:py-20 max-w-3xl mx-auto px-6">
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-8 text-center">{title}</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={faq.q} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-[#0F172A] hover:bg-orange-50/50 transition-colors"
            >
              {faq.q}
              <ChevronDown
                size={18}
                className={`shrink-0 text-[#F97316] transition-transform ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
