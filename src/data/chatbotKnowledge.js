import { SITE } from '../config/site';

export const BOT_NAME = 'PatraAI';

export const FAQ_CHIPS = [
  'What services do you offer?',
  'Do you help with PhD thesis writing?',
  'Can you help with data analysis?',
  'Do you write research proposals?',
  'Can you format journal manuscripts?',
  'How do I get started?',
  'What are your contact details?',
];

export const FAQ_VISIBLE_COUNT = 3;

export const KNOWLEDGE_BASE = [
  {
    keywords: ['services', 'offer', 'what do you do', 'help with'],
    answer: 'We offer topic selection, research proposals, thesis and dissertation writing, research papers, systematic literature reviews, statistical data analysis (SPSS, R, Python), bibliometric analysis (VOSviewer, Biblioshiny), patent support, editing and proofreading, and manuscript formatting for Scopus, SCI, and UGC Care journal guidelines.',
  },
  {
    keywords: ['thesis', 'dissertation', 'phd', 'doctoral'],
    answer: 'Yes. We provide chapter-by-chapter thesis and dissertation writing support from subject-matter experts. This includes introduction, literature review, methodology, results, discussion, and formatting to your university guidelines.',
  },
  {
    keywords: ['data analysis', 'statistics', 'spss', 'amos', 'python', 'matlab'],
    answer: 'Our statisticians work with SPSS, AMOS, R, Python, and MATLAB. We help with hypothesis testing, regression, SEM, and journal-ready charts tailored to your thesis or paper requirements.',
  },
  {
    keywords: ['topic', 'topic selection', 'research topic'],
    answer: 'We help you identify relevant research gaps, generate 8-10 potential topics, and narrow down to 2-3 options aligned with your university and field requirements.',
  },
  {
    keywords: ['synopsis', 'proposal', 'research proposal'],
    answer: 'We craft structured research proposals and synopses with clear problem statements, objectives, methodology, and literature review aligned to your university format.',
  },
  {
    keywords: ['paper', 'research paper', 'manuscript', 'journal'],
    answer: 'We write and format research and review papers to match your target journal guidelines (IEEE, Springer, Elsevier, APA, and more). We prepare journal-ready manuscripts based on your requirements.',
  },
  {
    keywords: ['scopus', 'sci', 'ugc', 'formatting', 'publication'],
    answer: 'We provide manuscript writing and formatting aligned to Scopus, SCI, and UGC Care journal guidelines, tailored to your target journal requirements.',
  },
  {
    keywords: ['price', 'cost', 'quote', 'affordable', 'how much'],
    answer: 'Pricing depends on your project scope, deadline, and subject area. Send us a message with your requirements and we will share a transparent quote.',
  },
  {
    keywords: ['contact', 'email', 'phone', 'call', 'reach'],
    answer: `You can reach us at ${SITE.email} or call ${SITE.phoneDisplay}. Or tap "Send a message" and we will get back to you soon.`,
  },
  {
    keywords: ['plagiarism', 'original', 'ethical'],
    answer: 'Every document we deliver is written from scratch with 100% plagiarism-free delivery and checked against academic standards. We follow strict academic ethics and your university guidelines.',
  },
  {
    keywords: ['started', 'begin', 'how to', 'get started'],
    answer: 'OPEN_FORM',
  },
  {
    keywords: ['message', 'send', 'contact us', 'talk', 'help me'],
    answer: 'OPEN_FORM',
  },
];

const STOP_WORDS = new Set(['a', 'an', 'the', 'do', 'you', 'can', 'with', 'i', 'my', 'me', 'we', 'is', 'are', 'what', 'how', 'to', 'for', 'of', 'in', 'on', 'at', 'and', 'or', 'it', 'be', 'get', 'help']);

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function phoneticKey(text) {
  return normalize(text)
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/[aeiouy]/g, '')
    .replace(/(.)\1+/g, '$1');
}

function jaccardSimilarity(aTokens, bTokens) {
  if (aTokens.length === 0 || bTokens.length === 0) return 0;
  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  let intersection = 0;
  for (const t of aSet) {
    if (bSet.has(t)) intersection++;
  }
  const union = new Set([...aSet, ...bSet]).size;
  return union === 0 ? 0 : intersection / union;
}

function scoreAgainstQuestion(input, question) {
  const inputNorm = normalize(input);
  const questionNorm = normalize(question);
  const inputTokens = tokenize(input);
  const questionTokens = tokenize(question);

  if (inputNorm === questionNorm) return 1;
  if (questionNorm.includes(inputNorm) && inputNorm.length >= 4) return 0.95;
  if (inputNorm.includes(questionNorm)) return 0.9;

  const tokenScore = jaccardSimilarity(inputTokens, questionTokens);

  let partialTokenScore = 0;
  for (const it of inputTokens) {
    for (const qt of questionTokens) {
      partialTokenScore = Math.max(partialTokenScore, stringSimilarity(it, qt));
      partialTokenScore = Math.max(partialTokenScore, stringSimilarity(phoneticKey(it), phoneticKey(qt)));
    }
  }

  const fullStringScore = stringSimilarity(inputNorm, questionNorm);
  const phoneticScore = stringSimilarity(phoneticKey(inputNorm), phoneticKey(questionNorm));

  let keywordBoost = 0;
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => inputNorm.includes(kw))) {
      const chipAnswer = findAnswer(question);
      if (chipAnswer === entry.answer) keywordBoost = 0.25;
    }
  }

  const score = Math.max(
    tokenScore * 0.45 + partialTokenScore * 0.35 + fullStringScore * 0.1 + phoneticScore * 0.1,
    tokenScore,
    partialTokenScore * 0.85,
    phoneticScore * 0.8,
  ) + keywordBoost;

  return Math.min(score, 1);
}

export function findAnswer(input) {
  const lower = input.toLowerCase().trim();
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.answer;
    }
  }
  return null;
}

export function getAnswerForQuestion(question) {
  if (question === 'How do I get started?') return 'OPEN_FORM';
  if (question === 'What are your contact details?') {
    return `You can reach us at ${SITE.email} or call ${SITE.phoneDisplay}. Or tap "Send a message" and we will get back to you soon.`;
  }
  return findAnswer(question);
}

export function matchUserInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return { type: 'empty' };

  const directAnswer = findAnswer(trimmed);
  if (directAnswer) {
    return { type: 'direct', answer: directAnswer };
  }

  const scored = FAQ_CHIPS.map((question) => ({
    question,
    score: scoreAgainstQuestion(trimmed, question),
  }))
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score >= 0.38);

  if (scored.length === 0) {
    return { type: 'none' };
  }

  const best = scored[0];
  if (best.score >= 0.72) {
    return { type: 'direct', answer: getAnswerForQuestion(best.question), matchedQuestion: best.question };
  }

  return {
    type: 'suggest',
    options: scored.slice(0, 2).map((item) => item.question),
  };
}
