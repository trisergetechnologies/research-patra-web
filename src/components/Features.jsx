import React from 'react';
import { IndianRupee, Users, Award, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "Affordable Prices",
    desc: "High-quality academic writing and research support at student-friendly, transparent rates.",
    icon: <IndianRupee size={32} className="text-white" />,
    gradient: "from-green-400 to-green-600"
  },
  {
    title: "Expert Team",
    desc: "Experienced academic writers and researchers dedicated to crafting exceptional dissertations and theses.",
    icon: <Users size={32} className="text-white" />,
    gradient: "from-blue-400 to-blue-600"
  },
  {
    title: "Proven Academic Practices",
    desc: "Ethical solutions that enhance learning and protect academic credibility.",
    icon: <Award size={32} className="text-white" />,
    gradient: "from-purple-400 to-purple-600"
  },
  {
    title: "Customer Focus",
    desc: "Prioritizing student & researchers success with personalized academic support and one-to-one guidance.",
    icon: <HeartHandshake size={32} className="text-white" />,
    gradient: "from-orange-400 to-orange-600"
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-bgDark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Building Future Scholars For Success <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              With Ethical Guidance
            </span>
          </h2>
          <div className="w-24 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group text-center"
            >
              <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;