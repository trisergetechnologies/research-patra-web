import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

const RejectionSection = () => {
  // Stagger animation rules for the right-side cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 } // Delays each card slightly
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="max-w-6xl mx-auto p-4 my-12">
      <div className="bg-[#F8FAFC] rounded-3xl p-8 md:p-12 shadow-sm border border-gray-50">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          
          {/* Left Column: Text */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-6 leading-tight">
              Why Do Most Research Proposals Get Rejected?
            </h2>
            
            <p className="text-[#4B5563] mb-6 leading-relaxed">
              A research proposal isn't just an essay; it is a rigid academic blueprint. 
              University committees reject proposals that lack a clear problem statement, 
              feature outdated literature, or propose an unrealistic methodology.
            </p>
            
            <p className="font-bold text-[#1F2937] leading-relaxed">
              At Research Patra, we map your synopsis exactly to your university's 
              guidelines, ensuring every technical requirement is met flawlessly.
            </p>
          </motion.div>

          {/* Right Column: Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {/* Red X Card 1 */}
            <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
              <div className="bg-red-50 text-red-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                <X size={16} strokeWidth={3} />
              </div>
              <span className="font-semibold text-[#1F2937]">Vague Research Objectives</span>
            </motion.div>

            {/* Red X Card 2 */}
            <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-100">
              <div className="bg-red-50 text-red-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                <X size={16} strokeWidth={3} />
              </div>
              <span className="font-semibold text-[#1F2937]">Flawed Research Methodology</span>
            </motion.div>

            {/* Orange Success Card */}
            <motion.div variants={itemVariants} className="bg-[#F97316] p-5 rounded-2xl flex items-center gap-4 shadow-md shadow-orange-200 mt-2">
              <div className="text-white">
                <CheckCircle size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-white text-lg">Research Patra: Structured to meet university committee guidelines</span>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default RejectionSection;