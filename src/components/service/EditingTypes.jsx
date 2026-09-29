import { useContactForm } from '../../context/ContactFormContext';

export default function EditingTypes({ types = [], source }) {
  const { openContactForm } = useContactForm();

  return (
    <section className="py-16 md:py-20 max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-body tracking-tight mb-3">
          Types of Editing Support We Provide
        </h2>
        <p className="text-muted max-w-2xl mx-auto">
          Choose the support type that fits your manuscript. Contact us for a quote based on your document scope.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {types.map((type, i) => (
          <div
            key={type.id}
            className={`p-8 rounded-3xl border flex flex-col h-full ${
              i === 1
                ? 'bg-[#0F172A] border-slate-800 text-white shadow-xl md:-translate-y-2'
                : 'bg-surface border-theme shadow-sm'
            }`}
          >
            <h3 className={`text-xl font-bold mb-2 ${i === 1 ? 'text-white' : 'text-body'}`}>{type.title}</h3>
            <p className={`text-sm mb-5 flex-grow ${i === 1 ? 'text-gray-400' : 'text-muted'}`}>{type.desc}</p>
            <ul className="space-y-2 mb-6">
              {type.items.map((item) => (
                <li key={item} className={`text-sm font-medium ${i === 1 ? 'text-slate-200' : 'text-body'}`}>
                  • {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                openContactForm({
                  message: type.message,
                  source: `${source}-${type.id}`,
                })
              }
              className={`w-full py-3 font-bold rounded-xl transition-colors ${
                i === 1
                  ? 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                  : 'bg-badge text-orange-700 dark:text-[#F97316] hover:bg-orange-100 dark:hover:bg-orange-950/40'
              }`}
            >
              Discuss {type.title.toLowerCase()}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
