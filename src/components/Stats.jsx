import React from 'react';

const Stats = () => {
  const statsData = [
    { num: "10K+", label: "Academic Papers Assisted", desc: "Across diverse international domains." },
    { num: "99.4%", label: "Plagiarism-Free Rate", desc: "Verified with strict Turnitin compliance." },
    { num: "500+", label: "PhD & Native Scholars", desc: "Subject-matter experts writing your papers." },
    { num: "4.9/5", label: "Client Success Rating", desc: "Trusted by global researchers and students." }
  ];

  return (
    <section className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {statsData.map((item, index) => (
            <div key={index} className="p-4 bg-gray-800/50 rounded-xl border border-gray-800">
              <div className="text-3xl md:text-4xl font-extrabold text-[#F97316] mb-1">
                {item.num}
              </div>
              <div className="text-sm font-semibold text-gray-200 mb-1">
                {item.label}
              </div>
              <div className="text-xs text-gray-400">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;