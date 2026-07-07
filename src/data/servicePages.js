export const WHO_ITS_FOR = [
  'PhD & doctoral scholars',
  'Masters & postgraduate students',
  'Working professionals',
  'Faculty researchers',
];

export const MEGA_MENU = [
  {
    title: 'Research Writing',
    links: [
      { label: 'Topic Selection', to: '/topic-selection', desc: 'Find research gaps and finalize topics' },
      { label: 'Research Proposal', to: '/synopsis', desc: 'Synopsis and proposal writing' },
      { label: 'Thesis & Dissertation', to: '/thesis-writing', desc: 'Chapter-by-chapter thesis support' },
      { label: 'Research Papers', to: '/research-papers', desc: 'Journal-ready manuscript writing' },
    ],
  },
  {
    title: 'Review & Analysis',
    links: [
      { label: 'Systematic Literature Review', to: '/systematic-review', desc: 'PRISMA-aligned SLR support' },
      { label: 'Statistical Data Analysis', to: '/statistical-analysis', desc: 'SPSS, R, Python, MATLAB' },
      { label: 'Bibliometric Analysis', to: '/bibliometric-analysis', desc: 'VOSviewer, Biblioshiny, citation mapping' },
      { label: 'Patent Support', to: '/patent-support', desc: 'Patent drafting and documentation' },
    ],
  },
  {
    title: 'Manuscript Formatting',
    links: [
      { label: 'Editing & Proofreading', to: '/editing-proofreading', desc: 'Grammar, flow, and citations' },
      { label: 'Scopus Manuscript Support', to: '/scopus-publication', desc: 'Scopus guideline formatting' },
      { label: 'SCI / WoS Manuscript Support', to: '/sci-journal-publication', desc: 'SCI journal formatting' },
      { label: 'UGC Care & Conference Papers', to: '/ugc-publication', desc: 'UGC Care and conference papers' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'All Services', to: '/services', desc: 'Full services overview' },
      { label: 'How We Work', to: '/how-we-work', desc: 'Our engagement process' },
      { label: 'Research Areas', to: '/research-areas', desc: 'Disciplines we support' },
      { label: 'Ethical Approach', to: '/ethical-approach', desc: 'Our academic ethics policy' },
      { label: 'About Us', to: '/about', desc: 'Who we are' },
    ],
  },
];

export const HUB_PAGES = {
  'how-we-work': {
    path: '/how-we-work',
    title: 'How We Work',
    metaTitle: 'How We Work | Research Patra',
    metaDescription:
      'Learn how Research Patra supports your academic project from first contact to final delivery with phased, ethical research writing support.',
  },
  'research-areas': {
    path: '/research-areas',
    title: 'Research Areas',
    metaTitle: 'Research Areas We Support | Research Patra',
    metaDescription:
      'Subject-matter experts across engineering, management, medical sciences, law, and more for thesis, papers, and manuscript support.',
  },
  'ethical-approach': {
    path: '/ethical-approach',
    title: 'Ethical Approach',
    metaTitle: 'Ethical Approach | Research Patra',
    metaDescription:
      'Research Patra ethical standards: original writing, plagiarism checks, transparent support, and university-aligned academic assistance.',
  },
  home: {
    path: '/',
    title: 'Home',
    metaTitle: 'Research Patra | Academic Research Writing Support',
    metaDescription:
      'Ethical thesis writing, research proposals, data analysis, and manuscript formatting for scholars worldwide.',
  },
  services: {
    path: '/services',
    title: 'All Services',
    metaTitle: 'Academic Services | Research Patra',
    metaDescription:
      'Comprehensive research writing, literature review, statistical analysis, and manuscript formatting services.',
  },
  about: {
    path: '/about',
    title: 'About Us',
    metaTitle: 'About Us | Research Patra',
    metaDescription: 'Meet Research Patra: ethical academic writing support for researchers and scholars.',
  },
  'privacy-policy': {
    path: '/privacy-policy',
    title: 'Privacy Policy',
    metaTitle: 'Privacy Policy | Research Patra',
    metaDescription: 'How Research Patra collects, uses, and protects your personal information.',
  },
  'terms-and-conditions': {
    path: '/terms-and-conditions',
    title: 'Terms & Conditions',
    metaTitle: 'Terms & Conditions | Research Patra',
    metaDescription: 'Terms of use for Research Patra academic writing and research support services.',
  },
};

export const SERVICE_PAGES = {
  'topic-selection': {
    path: '/topic-selection',
    id: 'topic-selection',
    title: 'Topic Selection',
    metaTitle: 'Research Topic Selection | Research Patra',
    metaDescription:
      'Expert help identifying research gaps, generating topic options, and narrowing to university-aligned research topics.',
    hero: {
      badge: 'Start Your Research Right',
      title: 'Research Topic Selection',
      subtitle:
        'Identify compelling research gaps and finalize 2–3 topic options aligned with your university, field, and career goals.',
    },
    process: [
      { title: 'Share your field & constraints', text: 'Tell us your program, area of interest, and university requirements.' },
      { title: 'Gap & trend analysis', text: 'We review recent literature and map viable research directions.' },
      { title: 'Topic shortlist', text: 'You receive 8–10 options narrowed to 2–3 strong recommendations.' },
      { title: 'Finalize with your guide', text: 'We refine the chosen topic based on your supervisor feedback.' },
    ],
    deliverables: [
      'Research gap summary',
      '8–10 potential topic options',
      '2–3 recommended topics with rationale',
      'Alignment notes for your university format',
    ],
    faqs: [
      {
        q: 'How many topic options will I receive?',
        a: 'We typically provide 8–10 initial options and help you narrow to 2–3 strong choices with clear rationale.',
      },
      {
        q: 'Can you help if I already have a broad idea?',
        a: 'Yes. We refine broad ideas into focused, feasible research questions aligned with your program requirements.',
      },
      {
        q: 'Do you select topics for PhD and Masters both?',
        a: 'Yes. We support undergraduate, Masters, and doctoral scholars across disciplines.',
      },
      {
        q: 'What do you need from me to start?',
        a: 'Your field of study, program level, university guidelines (if any), and any areas you want to explore or avoid.',
      },
    ],
    related: [
      { label: 'Research Proposal', to: '/synopsis' },
      { label: 'Systematic Literature Review', to: '/systematic-review' },
      { label: 'Thesis Writing', to: '/thesis-writing' },
    ],
    contact: {
      serviceName: 'topic selection',
      message: 'I need help with research topic selection.',
      source: 'topic-selection',
      linkText: 'Ask about topic selection',
    },
  },
  synopsis: {
    path: '/synopsis',
    id: 'synopsis',
    title: 'Research Proposal & Synopsis',
    metaTitle: 'Research Proposal & Synopsis Writing | Research Patra',
    metaDescription:
      'Structured research proposals and synopses with problem statements, objectives, methodology, and literature review.',
    hero: {
      badge: 'Proposal & Synopsis',
      title: 'Research Proposal & Synopsis Writing',
      subtitle:
        'Well-structured proposals with clear objectives, methodology, and literature review aligned to your university format.',
    },
    process: [
      { title: 'Requirements review', text: 'We study your university synopsis template and committee expectations.' },
      { title: 'Outline & structure', text: 'A detailed chapter outline is agreed before drafting begins.' },
      { title: 'Drafting & alignment', text: 'Each section is written to match your format and research design.' },
      { title: 'Revision & delivery', text: 'Supervisor feedback is incorporated within the agreed scope.' },
    ],
    deliverables: [
      'Introduction and background',
      'Problem statement and objectives',
      'Literature review section',
      'Research methodology chapter',
      'References in your required citation style',
    ],
    faqs: [
      {
        q: 'What sections are included in a synopsis?',
        a: 'Typically introduction, literature review, methodology, objectives, and references — tailored to your university template.',
      },
      {
        q: 'Can you match my university format?',
        a: 'Yes. Share your official synopsis or proposal guidelines and we align structure, word limits, and citation style.',
      },
      {
        q: 'Do you help after supervisor comments?',
        a: 'Yes. Revisions based on supervisor feedback can be included within the agreed project scope.',
      },
      {
        q: 'Is this the same as a full thesis?',
        a: 'No. A synopsis or proposal is the planning document. We also offer full thesis writing as a separate service.',
      },
    ],
    related: [
      { label: 'Topic Selection', to: '/topic-selection' },
      { label: 'Thesis Writing', to: '/thesis-writing' },
      { label: 'Systematic Literature Review', to: '/systematic-review' },
    ],
    contact: {
      serviceName: 'research proposal and synopsis writing',
      message: 'I need help with my research proposal or synopsis.',
      source: 'synopsis',
      linkText: 'Discuss your proposal',
    },
  },
  'thesis-writing': {
    path: '/thesis-writing',
    id: 'thesis-writing',
    title: 'Thesis & Dissertation Writing',
    metaTitle: 'Thesis & Dissertation Writing | Research Patra',
    metaDescription:
      'Chapter-by-chapter thesis and dissertation writing support formatted to your university guidelines.',
    hero: {
      badge: 'PhD & Masters Theses',
      title: 'Thesis & Dissertation Writing',
      subtitle:
        'End-to-end chapter support from introduction through discussion, with phased delivery aligned to your supervisor feedback.',
    },
    process: [
      { title: 'Scope & chapter plan', text: 'We agree on chapters, timeline, and university formatting requirements.' },
      { title: 'Phased chapter delivery', text: 'Chapters are delivered incrementally for supervisor review.' },
      { title: 'Revision within scope', text: 'Supervisor feedback is incorporated per agreed revision rounds.' },
      { title: 'Final formatting', text: 'Complete document formatting, references, and annexures.' },
    ],
    deliverables: [
      'Chapter-wise thesis drafts',
      'University-format compliance',
      'Citation and bibliography',
      'Plagiarism check report (where agreed)',
      'Revisions within agreed scope',
    ],
    faqs: [
      {
        q: 'Do you write the full thesis or individual chapters?',
        a: 'Both. You can engage us for specific chapters or end-to-end thesis support based on your needs.',
      },
      {
        q: 'How does phased delivery work?',
        a: 'We deliver chapters one at a time so you can share them with your supervisor and request revisions within scope.',
      },
      {
        q: 'What revision policy do you follow?',
        a: 'Revisions related to supervisor feedback are included within the agreed scope and revision rounds for each chapter.',
      },
      {
        q: 'How is thesis quality ensured?',
        a: 'We align to your university format, supervisor feedback, and agreed scope through phased chapter delivery and revision support.',
      },
    ],
    related: [
      { label: 'Statistical Analysis', to: '/statistical-analysis' },
      { label: 'Editing & Proofreading', to: '/editing-proofreading' },
      { label: 'Research Proposal', to: '/synopsis' },
    ],
    contact: {
      serviceName: 'thesis and dissertation writing',
      message: 'I need help with thesis and dissertation writing.',
      source: 'thesis-writing',
      linkText: 'Discuss your thesis',
    },
  },
  'research-papers': {
    path: '/research-papers',
    id: 'research-papers',
    title: 'Research & Review Papers',
    metaTitle: 'Research Paper Writing | Research Patra',
    metaDescription:
      'Journal-ready research and review papers tailored to your subject, styling guide, and target journal requirements.',
    hero: {
      badge: 'Journal-Ready Manuscripts',
      title: 'Research & Review Paper Writing',
      subtitle:
        'Empirical research papers and systematic review manuscripts prepared for clarity, structure, and target journal formatting.',
    },
    process: [
      { title: 'Scope & journal target', text: 'We confirm paper type, journal guidelines, and your research data or review scope.' },
      { title: 'Structure & drafting', text: 'Introduction through conclusion drafted with academic tone and logical flow.' },
      { title: 'Formatting & citations', text: 'References, figures, and layout aligned to IEEE, APA, Springer, Elsevier, or your guide.' },
      { title: 'Review & handoff', text: 'Final manuscript delivered with agreed revision support.' },
    ],
    deliverables: [
      'Complete manuscript draft',
      'Abstract and keywords',
      'Formatted references and citations',
      'Figure/table placement per journal style',
      'Revision support within agreed scope',
    ],
    faqs: [
      {
        q: 'Do you write empirical and review papers?',
        a: 'Yes. We support original research papers and systematic or narrative review manuscripts.',
      },
      {
        q: 'Which citation styles do you support?',
        a: 'APA, MLA, Harvard, IEEE, Vancouver, and journal-specific styles on request.',
      },
      {
        q: 'What do I receive at delivery?',
        a: 'A complete, formatted manuscript with abstract, references, and figures or tables placed per your journal style, plus revision support within agreed scope.',
      },
      {
        q: 'Can you format for a specific journal?',
        a: 'Yes. Share the target journal author guidelines and we align structure and formatting accordingly.',
      },
    ],
    related: [
      { label: 'Scopus Manuscript Support', to: '/scopus-publication' },
      { label: 'Editing & Proofreading', to: '/editing-proofreading' },
      { label: 'Systematic Literature Review', to: '/systematic-review' },
    ],
    contact: {
      serviceName: 'research paper writing',
      message: 'I need help with research paper writing.',
      source: 'research-papers',
      linkText: 'Discuss your research paper',
    },
  },
  'systematic-review': {
    path: '/systematic-review',
    id: 'systematic-review',
    title: 'Systematic Literature Review',
    metaTitle: 'Systematic Literature Review | Research Patra',
    metaDescription:
      'PRISMA-aligned systematic literature reviews with gap mapping, screening, and synthesis support.',
    hero: {
      badge: 'SLR & Gap Mapping',
      title: 'Systematic Literature Review',
      subtitle:
        'Structured literature reviews with database search strategy, screening, extraction, and critical synthesis.',
    },
    process: [
      { title: 'Protocol & search strategy', text: 'Research question, inclusion criteria, and database search plan defined.' },
      { title: 'Screening & extraction', text: 'Title/abstract and full-text screening with data extraction tables.' },
      { title: 'Synthesis & gap analysis', text: 'Thematic or narrative synthesis with explicit research gap mapping.' },
      { title: 'PRISMA documentation', text: 'Flow diagram and review documentation for your thesis or paper.' },
    ],
    deliverables: [
      'Search strategy documentation',
      'Screening and extraction tables',
      'Gap matrix or synthesis summary',
      'PRISMA flowchart (where applicable)',
      'Formatted review chapter or manuscript',
    ],
    faqs: [
      {
        q: 'Is this a PRISMA systematic review?',
        a: 'We follow PRISMA principles where appropriate. Scope depends on your program requirements and review type.',
      },
      {
        q: 'Which databases do you search?',
        a: 'Commonly Scopus, Web of Science, IEEE Xplore, PubMed, and Google Scholar — based on your field and access.',
      },
      {
        q: 'Do you provide the source PDFs?',
        a: 'We cite and reference papers per your access. Full PDF delivery depends on availability and copyright.',
      },
      {
        q: 'Can this feed into my thesis proposal?',
        a: 'Yes. SLR output is often used in proposal literature review chapters and research gap justification.',
      },
    ],
    related: [
      { label: 'Research Proposal', to: '/synopsis' },
      { label: 'Research Papers', to: '/research-papers' },
      { label: 'Topic Selection', to: '/topic-selection' },
    ],
    contact: {
      serviceName: 'systematic literature review',
      message: 'I need help with a systematic literature review.',
      source: 'systematic-review',
      linkText: 'Discuss your literature review',
    },
  },
  'statistical-analysis': {
    path: '/statistical-analysis',
    id: 'statistical-analysis',
    title: 'Statistical Data Analysis',
    metaTitle: 'Statistical Data Analysis | Research Patra',
    metaDescription:
      'Thesis and paper data analysis using SPSS, AMOS, R, Python, and MATLAB with interpretable outputs and charts.',
    hero: {
      badge: 'SPSS · R · Python · MATLAB',
      title: 'Statistical Data Analysis',
      subtitle:
        'Hypothesis testing, regression, SEM, and data visualization with outputs you can use in your thesis or journal manuscript.',
    },
    process: [
      { title: 'Data & hypothesis review', text: 'We confirm variables, sample size, and appropriate statistical tests.' },
      { title: 'Analysis execution', text: 'Tests run in SPSS, AMOS, R, Python, or MATLAB as agreed.' },
      { title: 'Results interpretation', text: 'Tables, charts, and plain-language interpretation of findings.' },
      { title: 'Chapter integration', text: 'Results write-up formatted for your thesis Chapter 4 or paper.' },
    ],
    deliverables: [
      'Analysis output files (SPSS/R/Python etc.)',
      'Results tables and charts',
      'Statistical interpretation notes',
      'Chapter 4 results write-up (where agreed)',
    ],
    faqs: [
      {
        q: 'Which software tools do you use?',
        a: 'SPSS, AMOS, SmartPLS, R, Python, and MATLAB depending on your analysis requirements.',
      },
      {
        q: 'What data formats do you accept?',
        a: 'Excel, CSV, SPSS .sav, and other common formats. Share your dataset and codebook if available.',
      },
      {
        q: 'Do you write the results chapter?',
        a: 'Yes. We can provide a results write-up aligned to your thesis or paper within the agreed scope.',
      },
      {
        q: 'Can you help if my sample size is small?',
        a: 'We advise on appropriate tests for your sample and flag limitations transparently in the interpretation.',
      },
    ],
    related: [
      { label: 'Thesis Writing', to: '/thesis-writing' },
      { label: 'Research Papers', to: '/research-papers' },
      { label: 'Systematic Literature Review', to: '/systematic-review' },
    ],
    contact: {
      serviceName: 'statistical data analysis',
      message: 'I need help with statistical data analysis.',
      source: 'statistical-analysis',
      linkText: 'Discuss your data analysis',
    },
  },
  'editing-proofreading': {
    path: '/editing-proofreading',
    id: 'editing-proofreading',
    title: 'Editing & Proofreading',
    metaTitle: 'Editing & Proofreading | Research Patra',
    metaDescription:
      'Academic editing for clarity, grammar, citations, and journal or university formatting compliance.',
    hero: {
      badge: 'Human Academic Editors',
      title: 'Editing & Proofreading',
      subtitle:
        'Improve manuscript clarity, academic tone, grammar, and formatting for theses, papers, and journal submissions.',
    },
    process: [
      { title: 'Document review', text: 'We assess your manuscript type, length, and editing needs.' },
      { title: 'Editing pass', text: 'Proofreading, substantive editing, or citation formatting as agreed.' },
      { title: 'Quality check', text: 'Consistency, reference accuracy, and layout verification.' },
      { title: 'Delivery & revisions', text: 'Edited document returned with agreed revision support.' },
    ],
    deliverables: [
      'Edited manuscript document',
      'Grammar and clarity improvements',
      'Citation and reference corrections',
      'Formatting per APA, MLA, Harvard, or IEEE',
    ],
    editingTypes: [
      {
        id: 'proofreading',
        title: 'Proofreading',
        desc: 'Final sweep for spelling, punctuation, and minor formatting issues.',
        items: ['Spelling & typos', 'Basic punctuation', 'Formatting consistency'],
        message: 'I need proofreading support for my manuscript.',
      },
      {
        id: 'substantive',
        title: 'Substantive Editing',
        desc: 'Deeper editing for academic tone, sentence structure, and logical flow.',
        items: ['Everything in proofreading', 'Sentence restructuring', 'Academic tone & flow', 'Vocabulary refinement'],
        message: 'I need substantive editing for my manuscript.',
      },
      {
        id: 'formatting',
        title: 'Citation & Formatting',
        desc: 'Strict compliance with university or journal citation and layout guidelines.',
        items: ['APA, MLA, Harvard, IEEE', 'Reference cross-checking', 'Layout & margin adjustment'],
        message: 'I need citation and formatting support for my manuscript.',
      },
    ],
    faqs: [
      {
        q: 'What types of editing do you offer?',
        a: 'Proofreading, substantive editing, and citation/formatting support. Tell us your needs and we recommend the right level.',
      },
      {
        q: 'Are edits done by humans?',
        a: 'Yes. Our academic editors review manuscripts manually for quality and context.',
      },
      {
        q: 'How do I get a quote?',
        a: 'Send us your document details via the contact form and we share a transparent quote based on scope and length.',
      },
      {
        q: 'Do you edit non-English manuscripts?',
        a: 'We specialize in English academic editing. Share your document and we confirm if we can support it.',
      },
    ],
    related: [
      { label: 'Research Papers', to: '/research-papers' },
      { label: 'Thesis Writing', to: '/thesis-writing' },
      { label: 'Scopus Manuscript Support', to: '/scopus-publication' },
    ],
    contact: {
      serviceName: 'editing and proofreading',
      message: 'I need help with editing and proofreading.',
      source: 'editing-proofreading',
      linkText: 'Discuss editing support',
    },
  },
  'scopus-publication': {
    path: '/scopus-publication',
    id: 'scopus-publication',
    title: 'Scopus Manuscript Support',
    metaTitle: 'Scopus Manuscript Writing & Formatting | Research Patra',
    metaDescription:
      'Manuscript writing and formatting aligned to Scopus-indexed journal guidelines for your target journal.',
    hero: {
      badge: 'Scopus Guidelines',
      title: 'Scopus Manuscript Writing & Formatting',
      subtitle:
        'Manuscript construction, editing, and formatting aligned to Scopus journal guidelines and your target journal requirements.',
    },
    process: [
      { title: 'Guideline review', text: 'We study your target journal author guidelines and Scopus formatting expectations.' },
      { title: 'Manuscript drafting', text: 'Original manuscript writing or restructuring per your research and scope.' },
      { title: 'Editing & formatting', text: 'Language, structure, references, and layout aligned to journal criteria.' },
      { title: 'Final review', text: 'Quality checklist and delivery of your formatted manuscript.' },
    ],
    deliverables: [
      'Manuscript draft or formatted document',
      'Journal guideline compliance check',
      'Reference and citation formatting',
      'Abstract and keyword optimization',
    ],
    faqs: [
      {
        q: 'What does Scopus manuscript support include?',
        a: 'Manuscript drafting or editing, journal guideline alignment, reference formatting, and a final compliance review for your target Scopus journal.',
      },
      {
        q: 'How is my manuscript prepared?',
        a: 'We draft or refine your manuscript to match your target journal guidelines, with editing, formatting, and a final review before delivery.',
      },
      {
        q: 'Can you help select a Scopus journal?',
        a: 'We can discuss journal guideline fit based on your field. Final journal choice remains yours.',
      },
      {
        q: 'What if I already have a draft?',
        a: 'We can edit and format existing manuscripts to align with your target Scopus journal guidelines.',
      },
    ],
    related: [
      { label: 'SCI Manuscript Support', to: '/sci-journal-publication' },
      { label: 'Research Papers', to: '/research-papers' },
      { label: 'Editing & Proofreading', to: '/editing-proofreading' },
    ],
    contact: {
      serviceName: 'Scopus manuscript writing and formatting',
      message: 'I need help with Scopus journal manuscript writing and formatting.',
      source: 'scopus-publication',
      linkText: 'Discuss Scopus manuscript support',
    },
  },
  'sci-journal-publication': {
    path: '/sci-journal-publication',
    id: 'sci-journal-publication',
    title: 'SCI / WoS Manuscript Support',
    metaTitle: 'SCI Journal Manuscript Support | Research Patra',
    metaDescription:
      'Manuscript writing and formatting aligned to SCI and Web of Science journal guidelines.',
    hero: {
      badge: 'Web of Science Guidelines',
      title: 'SCI Journal Manuscript Support',
      subtitle:
        'Expert manuscript writing and formatting aligned to SCI and Web of Science journal guidelines for your target journal.',
    },
    process: [
      { title: 'Journal requirements', text: 'We review SCI/WoS journal author guidelines for your target publication.' },
      { title: 'Manuscript preparation', text: 'Writing or restructuring to meet language and structure standards.' },
      { title: 'Formatting pass', text: 'References, figures, and layout per journal specifications.' },
      { title: 'Pre-submission review', text: 'Final quality review and manuscript delivery.' },
    ],
    deliverables: [
      'SCI-formatted manuscript',
      'Guideline compliance review',
      'Citation and reference formatting',
      'Abstract and structure review',
    ],
    faqs: [
      {
        q: 'What is the difference from Scopus support?',
        a: 'SCI/WoS journals have specific indexing and formatting requirements. We tailor support to your target journal guidelines.',
      },
      {
        q: 'What does SCI manuscript support include?',
        a: 'Manuscript preparation, SCI/WoS journal guideline alignment, citation formatting, and a structured final review before delivery.',
      },
      {
        q: 'Can you format an existing paper?',
        a: 'Yes. Share your draft and target journal guidelines for formatting and editing support.',
      },
    ],
    related: [
      { label: 'Scopus Manuscript Support', to: '/scopus-publication' },
      { label: 'Research Papers', to: '/research-papers' },
      { label: 'Editing & Proofreading', to: '/editing-proofreading' },
    ],
    contact: {
      serviceName: 'SCI journal manuscript support',
      message: 'I need help with SCI journal manuscript writing and formatting.',
      source: 'sci-journal-publication',
      linkText: 'Discuss SCI manuscript support',
    },
  },
  'ugc-publication': {
    path: '/ugc-publication',
    id: 'ugc-publication',
    title: 'UGC Care & Conference Papers',
    metaTitle: 'UGC Care & Conference Papers | Research Patra',
    metaDescription:
      'UGC Care journal manuscript formatting and conference paper writing for academic milestones.',
    hero: {
      badge: 'UGC Care · Conference Papers',
      title: 'UGC Care & Conference Papers',
      subtitle:
        'Manuscript formatting for UGC Care listed journals and conference-ready papers for academic milestones.',
    },
    process: [
      { title: 'Requirement check', text: 'We confirm UGC Care journal guidelines or conference formatting rules.' },
      { title: 'Drafting or formatting', text: 'Full paper writing or formatting of your existing draft.' },
      { title: 'Citation & layout', text: 'References, margins, and structure per event or journal specs.' },
      { title: 'Final delivery', text: 'Ready-to-submit document for your review.' },
    ],
    deliverables: [
      'UGC Care formatted manuscript',
      'Conference abstract and full paper',
      'IEEE or ACM formatting (where required)',
      'Citation and plagiarism check (where agreed)',
    ],
    faqs: [
      {
        q: 'Do you verify UGC Care journal listings?',
        a: 'We format to UGC Care guidelines you provide. Verifying current journal listing status is your responsibility.',
      },
      {
        q: 'What conference formats do you support?',
        a: 'IEEE, ACM, and custom conference templates. Share the event author guidelines when you contact us.',
      },
      {
        q: 'Do you write presentation slides?',
        a: 'Our primary focus is paper writing and formatting. Discuss any presentation needs when you contact us.',
      },
      {
        q: 'Can you help with both journal and conference papers?',
        a: 'Yes. We support UGC Care manuscript formatting and conference paper writing as separate or combined engagements.',
      },
    ],
    related: [
      { label: 'Research Papers', to: '/research-papers' },
      { label: 'Editing & Proofreading', to: '/editing-proofreading' },
      { label: 'Scopus Manuscript Support', to: '/scopus-publication' },
    ],
    contact: {
      serviceName: 'UGC Care and conference papers',
      message: 'I need help with UGC Care or conference paper writing.',
      source: 'ugc-publication',
      linkText: 'Discuss UGC or conference paper support',
    },
  },
  'bibliometric-analysis': {
    path: '/bibliometric-analysis',
    id: 'bibliometric-analysis',
    title: 'Bibliometric Analysis',
    metaTitle: 'Bibliometric Analysis | Research Patra',
    metaDescription:
      'Bibliometric and scientometric analysis with VOSviewer, Biblioshiny, and R for citation mapping, co-authorship networks, and research trends.',
    hero: {
      badge: 'VOSviewer · Biblioshiny · R',
      title: 'Bibliometric Analysis',
      subtitle:
        'Citation analysis, co-authorship networks, keyword co-occurrence maps, and research trend reports for thesis chapters and journal papers.',
    },
    process: [
      { title: 'Scope & data export', text: 'We confirm your research question, databases (Scopus, WoS), and export search results.' },
      { title: 'Data cleaning', text: 'Deduplication, author affiliation standardization, and metadata preparation.' },
      { title: 'Analysis & visualization', text: 'Co-citation, bibliographic coupling, keyword maps, and trend analysis in VOSviewer or Biblioshiny.' },
      { title: 'Interpretation & report', text: 'Charts, network maps, and a written interpretation for your thesis or manuscript.' },
    ],
    deliverables: [
      'Cleaned bibliometric dataset',
      'Network and density visualization maps',
      'Trend and citation analysis tables',
      'Written interpretation chapter or section',
      'Tool output files (VOSviewer, Biblioshiny, R where used)',
    ],
    faqs: [
      {
        q: 'Which tools do you use for bibliometrics?',
        a: 'VOSviewer, Biblioshiny, and R are our primary tools. The choice depends on your dataset size and analysis goals.',
      },
      {
        q: 'Which databases can you work with?',
        a: 'Scopus and Web of Science exports are most common. Share your database access and search string when you contact us.',
      },
      {
        q: 'Is bibliometric analysis suitable for a thesis chapter?',
        a: 'Yes. Many PhD and Masters students use bibliometric chapters for literature mapping, trend analysis, and gap identification.',
      },
      {
        q: 'What do I need to provide?',
        a: 'Your research focus, preferred databases, and any existing search exports or inclusion criteria you have already defined.',
      },
    ],
    related: [
      { label: 'Systematic Literature Review', to: '/systematic-review' },
      { label: 'Statistical Data Analysis', to: '/statistical-analysis' },
      { label: 'Research Papers', to: '/research-papers' },
    ],
    contact: {
      serviceName: 'bibliometric analysis',
      message: 'I need help with bibliometric analysis for my research.',
      source: 'bibliometric-analysis',
      linkText: 'Discuss bibliometric analysis',
    },
  },
  'patent-support': {
    path: '/patent-support',
    id: 'patent-support',
    title: 'Patent Support',
    metaTitle: 'Patent Support & Documentation | Research Patra',
    metaDescription:
      'Patent search, prior art review, and technical documentation support for invention disclosure, claims drafting, and IP research.',
    hero: {
      badge: 'IP Research · Documentation',
      title: 'Patent Support',
      subtitle:
        'Prior art search, invention documentation, claims structuring, and technical write-ups to support your patent filing preparation.',
    },
    process: [
      { title: 'Invention briefing', text: 'You share your invention concept, technical field, and any existing notes or prototypes.' },
      { title: 'Prior art search', text: 'We search patent and literature databases for relevant existing disclosures and citations.' },
      { title: 'Documentation drafting', text: 'Technical description, claims outline, and supporting narrative prepared per your filing framework.' },
      { title: 'Review & refinement', text: 'Revisions based on your feedback and alignment with your patent attorney or filing requirements.' },
    ],
    deliverables: [
      'Prior art search summary with references',
      'Technical invention description draft',
      'Claims structure or outline (where agreed)',
      'Supporting diagrams or figure descriptions (where agreed)',
      'Revision support within agreed scope',
    ],
    faqs: [
      {
        q: 'Do you file patents on my behalf?',
        a: 'We provide research, documentation, and drafting support. Formal filing is typically handled by you or your registered patent attorney.',
      },
      {
        q: 'What types of inventions do you support?',
        a: 'Engineering, software, mechanical, chemical, biotechnology, and other technical fields. Share your domain when you contact us.',
      },
      {
        q: 'Can you help with prior art search only?',
        a: 'Yes. Prior art search and landscape review can be scoped as a standalone engagement.',
      },
      {
        q: 'What information should I share to start?',
        a: 'A clear description of your invention, technical field, target markets or applications, and any existing drawings or lab notes.',
      },
    ],
    related: [
      { label: 'Research Papers', to: '/research-papers' },
      { label: 'Bibliometric Analysis', to: '/bibliometric-analysis' },
      { label: 'Topic Selection', to: '/topic-selection' },
    ],
    contact: {
      serviceName: 'patent support',
      message: 'I need help with patent documentation and prior art research.',
      source: 'patent-support',
      linkText: 'Discuss patent support',
    },
  },
};

export function getServicePage(id) {
  return SERVICE_PAGES[id] || null;
}
