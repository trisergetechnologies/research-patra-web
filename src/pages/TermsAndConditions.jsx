import PageMeta from '../components/PageMeta';
import { HUB_PAGES } from '../data/servicePages';
import { SITE } from '../config/site';

const meta = HUB_PAGES['terms-and-conditions'];

const sections = [
  {
    title: 'Agreement to Terms',
    body: `These Terms & Conditions ("Terms") govern your use of the Research Patra website and any academic writing, analysis, editing, or formatting support services we provide. By accessing our website, submitting an inquiry, or engaging our services, you agree to these Terms. If you do not agree, please do not use our website or services.`,
  },
  {
    title: 'Services Description',
    body: `Research Patra provides academic writing, research support, statistical analysis, literature review assistance, and manuscript formatting aligned to client requirements and institutional guidelines. Services are delivered based on the scope, timeline, and deliverables agreed in writing or confirmed via email before work begins. Additional work outside the agreed scope may require a revised quote.`,
  },
  {
    title: 'Client Responsibilities',
    body: `You agree to provide accurate project information, university or journal guidelines, supervisor feedback, and research materials needed to complete the work. You are responsible for reviewing deliverables, ensuring they meet your program requirements, and deciding how to use the completed work in your academic or professional context. You confirm that you have the right to share any materials you provide to us for the purpose of completing the agreed service.`,
  },
  {
    title: 'Academic Use & Authorship',
    body: `Deliverables are intended to support your research and writing process. You retain responsibility for authorship decisions, citations, disclosures, and compliance with your university, employer, or publisher policies. Research Patra provides assistance in planning, drafting, analyzing, and formatting academic work; clients should use delivered materials in accordance with their institution's academic integrity policies and any applicable disclosure requirements.`,
  },
  {
    title: 'Outcomes & Third-Party Decisions',
    body: `Research Patra focuses on quality writing, analysis, and formatting support within the agreed project scope. Outcomes such as journal acceptance, indexing status, conference selection, thesis committee approval, or degree conferral depend on many factors outside our control, including institutional policies, supervisor review, peer review, and editorial decisions. Our services are designed to help you present clear, well-structured work; final decisions by universities, journals, or other third parties remain with those parties and with you as the author or student.`,
  },
  {
    title: 'Submission & Publication',
    body: `Unless explicitly agreed otherwise in writing for a specific administrative task, Research Patra's standard services cover preparation and delivery of documents rather than acting as your representative with external publishers or institutions. Clients generally retain responsibility for submission steps, account creation on journal portals, correspondence with editors, and any declarations required by publishers or universities. Where manuscript formatting or pre-submission review is included, this refers to document quality and guideline alignment prior to handoff.`,
  },
  {
    title: 'Payment & Revisions',
    body: `Fees, payment schedules, and revision terms are confirmed before work begins. Revisions related to supervisor or client feedback are included within the agreed scope and revision rounds for each deliverable. Requests materially changing scope, adding new chapters, or requiring substantial new analysis may be quoted separately. Late payment may delay delivery of subsequent phases.`,
  },
  {
    title: 'Intellectual Property',
    body: `Upon full payment for a completed deliverable, clients receive rights to use the delivered work for their agreed academic or professional purpose, subject to these Terms and applicable law. Research Patra retains the right to use anonymized, non-identifiable examples internally for quality training unless you request otherwise in writing. We do not claim authorship credit on client work.`,
  },
  {
    title: 'Original Work & Plagiarism',
    body: `We prepare original work based on client instructions and agreed sources. Where plagiarism checking is included, it is performed using agreed tools and within the scope of the project. Clients should verify final submissions against their institution's requirements and maintain proper citation of all sources used in the completed work.`,
  },
  {
    title: 'Limitation of Liability',
    body: `To the fullest extent permitted by law, Research Patra shall not be liable for indirect, incidental, or consequential damages arising from use of our website or services, including but not limited to academic penalties, lost opportunities, or third-party editorial decisions. Our total liability for any claim relating to a specific project shall not exceed the amount paid by you for that project.`,
  },
  {
    title: 'Cancellation',
    body: `Either party may cancel an ongoing project according to terms confirmed at engagement. Work completed up to the cancellation date remains billable. Deposits or advance payments for undelivered work may be handled as agreed in your project confirmation.`,
  },
  {
    title: 'Governing Law & Contact',
    body: `These Terms are governed by applicable laws of India unless otherwise agreed. For questions about these Terms, contact Research Patra at ${SITE.email} or ${SITE.phoneDisplay}. We may update these Terms from time to time; continued use of the website after updates constitutes acceptance of the revised Terms.`,
  },
];

export default function TermsAndConditions() {
  return (
    <div className="bg-white overflow-x-hidden">
      <PageMeta title={meta.metaTitle} description={meta.metaDescription} path={meta.path} />
      <section className="py-16 md:py-20 bg-[#0F172A] text-center px-6">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Terms & Conditions</h1>
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
