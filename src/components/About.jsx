import React from 'react';

const About = () => {
  return (
    <section id="about" className="py-12 md:py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header Text - Tight Margins */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-4 tracking-tight">
            Bringing Your Academic Goals to Life
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-base md:text-lg leading-relaxed font-medium">
            With years of expertise in academic writing and research assistance, Research Patra helps students create impactful dissertations, theses, research papers, and literature reviews. Our dedicated team of writers and analysts works closely with you to deliver personalized, plagiarism-free, and high-quality work tailored to your academic needs.
          </p>
        </div>

        {/* 4-Column Grid System: Dynamically drops to 2 or 1 column depending on screen layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1 */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-100 transition duration-300">
            <h3 className="font-bold text-[#F97316] text-xl mb-2 tracking-tight">Affordable Prices</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              High-quality academic writing and research support at student-friendly, transparent rates.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-100 transition duration-300">
            <h3 className="font-bold text-[#F97316] text-xl mb-2 tracking-tight">Expert Team</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Experienced academic writers and researchers dedicated to crafting exceptional dissertations, theses, and research papers.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-100 transition duration-300">
            <h3 className="font-bold text-[#F97316] text-xl mb-2 tracking-tight">Proven Academic Practices</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ethical solutions that enhance learning and protect academic credibility.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-100 transition duration-300">
            <h3 className="font-bold text-[#F97316] text-xl mb-2 tracking-tight">Customer Focus</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Prioritizing student & researchers success with personalized academic support and one-to-one guidance.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;