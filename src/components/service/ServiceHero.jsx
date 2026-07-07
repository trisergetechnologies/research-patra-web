export default function ServiceHero({ badge, title, subtitle, dark = true }) {
  if (dark) {
    return (
      <section className="relative py-20 md:py-24 bg-[#0F172A] overflow-hidden border-b-4 border-[#F97316]">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {badge && (
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#F97316] bg-orange-500/10 px-3 py-1.5 rounded-full mb-4">
              {badge}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-slate-50 border-b border-gray-200 text-center">
      <div className="max-w-4xl mx-auto px-6">
        {badge && (
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#F97316] bg-orange-50 px-3 py-1.5 rounded-full mb-4">
            {badge}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] mb-6 tracking-tight">{title}</h1>
        <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}
