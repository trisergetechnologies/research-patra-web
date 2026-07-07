export default function ProcessSteps({ title = 'How We Work on Your Project', steps = [] }) {
  return (
    <section className="py-16 md:py-20 max-w-6xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-3">{title}</h2>
        <div className="w-16 h-1.5 bg-[#F97316] mx-auto rounded-full" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:border-orange-200 transition-colors"
          >
            <span className="text-xs font-black text-[#F97316] uppercase tracking-wider">Step {i + 1}</span>
            <h3 className="text-lg font-bold text-[#0F172A] mt-2 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
