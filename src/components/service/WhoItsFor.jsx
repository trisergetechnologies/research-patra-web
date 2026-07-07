import { WHO_ITS_FOR } from '../../data/servicePages';

export default function WhoItsFor({ items = WHO_ITS_FOR }) {
  return (
    <section className="py-12 max-w-4xl mx-auto px-6">
      <h2 className="text-xl font-bold text-[#0F172A] mb-4 text-center">Who This Is For</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="text-xs font-semibold px-4 py-2 bg-orange-50 border border-orange-100 text-[#0F172A] rounded-full"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
