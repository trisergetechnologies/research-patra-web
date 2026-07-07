import { CheckCircle2 } from 'lucide-react';

export default function DeliverablesList({ title = 'What You Receive', items = [] }) {
  return (
    <section className="py-16 bg-slate-50 border-y border-gray-100">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] mb-8 text-center">{title}</h2>
        <ul className="grid sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <CheckCircle2 className="text-[#F97316] shrink-0 mt-0.5" size={20} />
              <span className="text-sm font-semibold text-gray-800">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
