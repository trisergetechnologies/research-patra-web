import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Zap, Lightbulb, HeartHandshake } from 'lucide-react';
import { useContactForm } from '../context/ContactFormContext';
import PageMeta from '../components/PageMeta';
import { HUB_PAGES } from '../data/servicePages';

const About = () => {
  const { openContactForm } = useContactForm();
  const meta = HUB_PAGES.about;

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-[#f97316] selection:text-white">
      <PageMeta title={meta.metaTitle} description={meta.metaDescription} path={meta.path} />
      <section className="relative pt-8 pb-24 lg:py-32 overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#EA580C] rounded-full blur-[140px] opacity-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-8 tracking-tight leading-tight">
            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#EA580C]">Research.</span>{' '}
            Supporting Success.
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
            From students to professionals, Research Patra is your trusted partner in academic and applied research writing.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 md:gap-16 items-start">
          <div>
            <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-4 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#F97316]"></span> OUR STORY
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-8 leading-[1.2]">
              Why Does Research Often Feel So Overwhelming and Intimidating?
            </h2>
          </div>

          <div className="space-y-6 text-base sm:text-lg text-gray-600 font-medium leading-relaxed mt-2 lg:mt-14">
            <p>
              We noticed that students often struggled to navigate the complexities of academic projects, and professionals faced similar challenges in writing, analysis, and documentation.
            </p>
            <p>
              What started as a small academic support team quickly grew into a complete research assistance platform that serves clients from universities, institutes, and industries worldwide.
            </p>
            <p className="pt-4 border-t border-gray-100">
              Today, our team includes academic writers, statisticians, editors, and subject experts who share a single goal:{' '}
              <strong className="text-[#0F172A]">to make research smarter, faster, and more meaningful.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#F8FAFC] relative border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="bg-[#0F172A] p-8 sm:p-12 md:p-16 rounded-[2rem] md:rounded-[3rem] relative shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F97316] rounded-full blur-[60px] opacity-30 pointer-events-none"></div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
              Turning Ideas Into Impact Together
            </h3>
            <p className="text-gray-400 font-medium leading-relaxed border-l-4 border-[#F97316] pl-6">
              We strive to bridge the gap between knowledge and implementation by providing tailored guidance, expert assistance, and exceptional documentation.
            </p>
          </div>

          <div className="space-y-12 md:space-y-16">
            <div>
              <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-3 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#F97316]"></span> THE GOAL
              </p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-6">Our Mission</h3>
              <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4">
                Our mission is simple: <strong className="text-[#0F172A]">to make complex research and writing accessible to everyone.</strong>
              </p>
              <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4">
                We aim to bridge the gap between knowledge and execution by offering personalized guidance, expert support, and high-quality documentation.
              </p>
              <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
                For students, this means assistance in crafting dissertations, theses, and research papers that reflect academic integrity and depth. For professionals, it means reliable help with analytical reports, data interpretation, and technical documentation.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-3 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-[#F97316]"></span> THE OUTLOOK
              </p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-6">Our Vision</h3>
              <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4">
                We envision a future where research and innovation are accessible to all, not limited by time, stress, or lack of guidance.
              </p>
              <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed mb-4">
                Research Patra seeks to become a trusted platform for research excellence, empowering learners, scholars, and organizations to produce meaningful, evidence-based work.
              </p>
              <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
                Our goal is to simplify the research process, transforming confusion into clarity and turning effort into excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 md:gap-16 items-stretch">
          <div>
            <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-3 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#F97316]"></span> CUSTOMER COMMITMENT
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-8 md:mb-10 leading-tight">
              What We Stand For Daily
            </h2>
            <ul className="space-y-6">
              {[
                { Icon: ShieldCheck, title: 'Integrity', text: 'Every project is 100% plagiarism-free and follows academic ethics.' },
                { Icon: Award, title: 'Quality', text: 'We focus on depth, structure, and precision in every document.' },
                { Icon: Zap, title: 'Transparency', text: 'Clear communication, honest pricing, and regular progress updates.' },
                { Icon: Lightbulb, title: 'Innovation', text: 'Continuous improvement through modern tools, data analytics, and digital research methods.' },
                { Icon: HeartHandshake, title: 'Empathy', text: 'We understand your challenges and provide support that fits your pace and goals.' },
              ].map(({ Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <div className="mt-1 shrink-0"><Icon className="text-[#F97316]" size={24} /></div>
                  <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
                    <strong className="text-[#0F172A]">{title}:</strong> {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="w-full max-w-md min-h-[280px] md:min-h-[320px] bg-[#0F172A] rounded-[2rem] md:rounded-[3rem] p-8 sm:p-10 md:p-12 flex flex-col justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316] rounded-full blur-[50px] opacity-40 pointer-events-none"></div>
              <div className="text-[#F97316] mb-4 md:mb-6 relative z-10">
                <ShieldCheck className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight relative z-10">
                Ethical Authenticity
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-[#F8FAFC] text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-6 flex items-center justify-center gap-2">
            <span className="w-4 h-[2px] bg-[#F97316]"></span> FINAL NOTE
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] mb-6 md:mb-8 leading-tight tracking-tight">
            Your research matters. Let's make it exceptional, together.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-8 max-w-3xl mx-auto">
            At Research Patra, we support academic and professional research with empathy, expertise, and excellence. We are here to build confidence, clarity, and credibility in your research journey.
          </p>
          <p className="text-gray-500">
            Have a question?{' '}
            <button
              type="button"
              onClick={() => openContactForm({ source: 'about' })}
              className="text-[#F97316] font-bold hover:underline"
            >
              Send us a message
            </button>
            {' '}or read our{' '}
            <Link to="/ethical-approach" className="text-[#F97316] font-bold hover:underline">
              ethical approach
            </Link>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
