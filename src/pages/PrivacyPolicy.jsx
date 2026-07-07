import PageMeta from '../components/PageMeta';
import { HUB_PAGES } from '../data/servicePages';
import { SITE } from '../config/site';

const meta = HUB_PAGES['privacy-policy'];

const sections = [
  {
    title: 'Introduction',
    body: `Research Patra ("we", "us", or "our") respects your privacy. This Privacy Policy explains how we collect, use, store, and protect personal information when you visit our website, contact us, or use our academic writing and research support services. By using our website or services, you agree to the practices described in this policy.`,
  },
  {
    title: 'Information We Collect',
    body: `We may collect information you provide directly, including your name, email address, phone number, academic program details, project requirements, uploaded documents, and messages sent through our contact form or email correspondence. We may also collect technical information such as browser type, device information, IP address, and pages visited through standard analytics tools to improve our website experience.`,
  },
  {
    title: 'How We Use Your Information',
    body: `We use collected information to respond to inquiries, prepare project quotes, deliver agreed services, communicate about your project, improve our website and service quality, and maintain records related to client engagement. Project materials and correspondence are used solely to fulfill the scope agreed with you and are not shared with third parties except where necessary to deliver the service or as required by applicable law.`,
  },
  {
    title: 'Confidentiality of Academic Materials',
    body: `Documents, research data, drafts, and project details you share with us are treated as confidential. Access is limited to team members involved in your project. We do not publish, resell, or distribute your materials for unrelated purposes. Retention periods may vary based on project completion and operational needs; you may request deletion of personal correspondence subject to legal or contractual record-keeping requirements.`,
  },
  {
    title: 'Cookies & Analytics',
    body: `Our website may use cookies or similar technologies to remember preferences and understand how visitors use the site. You can adjust browser settings to limit cookies. Analytics data is generally aggregated and used to improve navigation, content, and performance rather than to identify individual users for unrelated marketing.`,
  },
  {
    title: 'Data Security',
    body: `We implement reasonable administrative and technical measures to protect personal information against unauthorized access, alteration, or disclosure. No method of transmission over the internet is completely secure, and we cannot guarantee absolute security of data transmitted to or from our systems.`,
  },
  {
    title: 'Your Rights',
    body: `Depending on your location, you may have rights to access, correct, or request deletion of personal information we hold about you, or to object to certain processing. To exercise these rights, contact us using the details below. We will respond within a reasonable timeframe subject to applicable law.`,
  },
  {
    title: 'Third-Party Links',
    body: `Our website may contain links to external sites such as publisher or university resources. We are not responsible for the privacy practices of those third-party websites and encourage you to review their policies separately.`,
  },
  {
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. The revised version will be posted on this page with an updated effective date. Continued use of the website after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: 'Contact',
    body: `For privacy-related questions or requests, contact Research Patra at ${SITE.email} or ${SITE.phoneDisplay}.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-white overflow-x-hidden">
      <PageMeta title={meta.metaTitle} description={meta.metaDescription} path={meta.path} />
      <section className="py-16 md:py-20 bg-[#0F172A] text-center px-6">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Privacy Policy</h1>
        <p className="text-gray-400 text-sm">Effective date: June 2026</p>
      </section>
      <article className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        {sections.map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">{title}</h2>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">{body}</p>
          </section>
        ))}
      </article>
    </div>
  );
}
