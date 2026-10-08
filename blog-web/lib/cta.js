// End-of-article call to action, matched to what the reader was just reading. First match on the category wins.
const CTAS = [
  {
    match: /statist|spss|data|analys|regression|quantitat|stata|python/i,
    eyebrow: 'Stuck on the numbers?',
    title: 'Get your analysis checked by a statistician',
    body: 'Share your dataset and research questions. We explain the right tests and help you read the output, so you can defend every result.',
  },
  {
    match: /publish|journal|paper|manuscript|peer|scopus/i,
    eyebrow: 'Ready to submit?',
    title: 'Make your manuscript journal-ready',
    body: 'Get feedback on structure, clarity and journal fit before you submit, and avoid the most common desk-rejection reasons.',
  },
  {
    match: /proposal|synopsis|topic|research design|methodolog/i,
    eyebrow: 'Starting out?',
    title: 'Shape a proposal your supervisor will approve',
    body: 'We help you sharpen the research question, pick a defensible method and plan the chapters, while the ideas stay yours.',
  },
  {
    match: /thesis|dissertation|writing|chapter|literature|apa|citation|referenc/i,
    eyebrow: 'Need a second pair of eyes?',
    title: 'Get expert feedback on your chapter',
    body: 'Book a free consultation. We give ethical, non-substitutive guidance on structure, argument and referencing, so the work stays yours.',
  },
];

const DEFAULT_CTA = {
  eyebrow: 'Need a second pair of eyes?',
  title: 'Stuck on a chapter or a dataset?',
  body: 'Book a free consultation. We give ethical, non-substitutive guidance so the work stays yours.',
};

export function ctaFor(category) {
  const key = `${category?.slug ?? ''} ${category?.name ?? ''}`;
  return CTAS.find((c) => c.match.test(key)) ?? DEFAULT_CTA;
}
