import { env } from '../../config/env.js';
import { PlagBudget, PlagPage, PlagScan } from '../../models/Plagiarism.js';
import { LIMITS } from './limits.js';
import { compareAgainst, withoutSelf } from './match.js';
import { searchOpenAlex } from './openalex.js';
import { consumeMonthCheck, getMonthQuota, releaseMonthCheck } from './quota.js';
import { decideEnqueue, staleAction } from './status.js';
import { searchTavily, tavilyConfigured } from './tavily.js';
import { prepareArticle, scanSource } from './text.js';
import { decideVerdict } from './verdict.js';
import { fetchHtmlPage, runWebStage } from './web.js';
import { loadCorpus } from './fingerprint.js';
import { logger } from '../../utils/logger.js';

const INTERRUPTED = 'The scan was interrupted and could not be finished.';
const ERRORED = 'The scan stopped because of an error.';

export function ownHosts() {
  const hosts = new Set(['researchpatra.com', 'www.researchpatra.com']);
  for (const raw of [env.siteUrl, env.adminUrl]) {
    try {
      hosts.add(new URL(raw).host);
    } catch {
      // Ignore an unset or relative origin.
    }
  }
  return hosts;
}

export async function enqueueScan(post, { userId } = {}) {
  const source = scanSource(post);
  const article = prepareArticle(source);
  const existing = await PlagScan.find({
    postId: post._id,
    contentHash: article.hash,
    status: { $in: ['queued', 'running', 'complete'] },
  })
    .sort({ createdAt: -1 })
    .lean();
  const decision = decideEnqueue(existing);
  const quota = userId ? await getMonthQuota(userId) : null;
  if (decision.action === 'keep') return { scan: decision.scan, created: false, quota };

  if (userId) {
    const spent = await consumeMonthCheck(userId);
    if (!spent) {
      const current = await getMonthQuota(userId);
      return { scan: null, created: false, quota: current, quotaExceeded: true };
    }
  }

  try {
    const scan = await PlagScan.create({
      postId: post._id,
      target: source.target,
      contentHash: article.hash,
      status: 'queued',
      snapshot: {
        title: source.title,
        contentHtml: source.contentHtml,
        keyTakeaways: source.keyTakeaways,
      },
    });
    return { scan: scan.toObject(), created: true, quota: userId ? await getMonthQuota(userId) : quota };
  } catch (err) {
    if (userId) await releaseMonthCheck(userId);
    throw err;
  }
}

export async function latestScan(postId) {
  return PlagScan.findOne({ postId }).sort({ createdAt: -1 }).lean();
}

async function consumeFetch() {
  const day = new Date().toISOString().slice(0, 10);
  try {
    await PlagBudget.updateOne({ day }, { $setOnInsert: { fetchCount: 0 } }, { upsert: true });
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
  const doc = await PlagBudget.findOneAndUpdate(
    { day, fetchCount: { $lt: LIMITS.dailyCap } },
    { $inc: { fetchCount: 1 } }
  );
  return Boolean(doc);
}

async function takeCached(url) {
  const doc = await PlagPage.findOne({ url }).lean();
  if (!doc?.fetchedAt) return null;
  if (Date.now() - new Date(doc.fetchedAt).getTime() > LIMITS.pageTtlMs) return null;
  return { text: doc.text, title: doc.title || '' };
}

async function savePage(item, page) {
  await PlagPage.findOneAndUpdate(
    { url: item.url },
    { $set: { host: item.host, title: (page.title || '').slice(0, 180), text: page.text.slice(0, 200_000), fetchedAt: new Date() } },
    { upsert: true }
  );
}

function webSources(pages) {
  return pages.map((page) => {
    const article = prepareArticle({ title: '', contentHtml: page.text, keyTakeaways: [] });
    return {
      kind: 'web',
      title: page.title || page.host,
      url: page.url,
      host: page.host,
      hash: article.hash,
      sh5: article.sh5,
      sh8: article.sh8,
    };
  });
}

export async function processScan(scan) {
  const article = prepareArticle(scan.snapshot || {});
  const corpus = await loadCorpus(scan.postId);
  const internal = compareAgainst(article, withoutSelf(corpus, scan.postId));
  const hosts = ownHosts();
  const skipAcademic = internal.overlap >= LIMITS.strongOverlap;
  const web = await runWebStage({
    words: article.words,
    title: scan.snapshot?.title || '',
    search: (query) => searchTavily(query),
    academicSearch: skipAcademic ? null : (args) => searchOpenAlex(args),
    takeCached,
    consume: consumeFetch,
    fetchPage: (url) => fetchHtmlPage(url, globalThis.fetch, hosts),
    savePage,
    ownHosts: hosts,
    skipAcademic,
    limits: LIMITS,
  });
  const external = compareAgainst(article, webSources(web.pages));
  const longestRun = Math.max(internal.longest, external.longest);
  const verdict = decideVerdict({
    webComplete: web.complete,
    internalOverlap: internal.overlap,
    webOverlap: external.overlap,
    longestRun,
  });
  const report = {
    internal: { overlap: internal.overlap, compared: corpus.length },
    web: {
      overlap: external.overlap,
      queries: web.queries,
      tavilyCredits: web.tavilyCredits || 0,
      openAlexHits: web.openAlexHits || 0,
      fetched: web.fetched,
      cached: web.cached,
      snippets: web.snippets || 0,
      failed: web.failed,
      complete: web.complete,
    },
    longestRun,
    sources: [...internal.sources, ...external.sources].sort((a, b) => b.overlap - a.overlap).slice(0, LIMITS.maxSources),
  };

  await PlagScan.updateOne(
    { _id: scan._id, status: 'running' },
    {
      $set: {
        status: web.complete ? 'complete' : 'incomplete',
        verdict,
        failureReason: web.complete ? '' : web.reason,
        report,
        finishedAt: new Date(),
      },
    }
  );
}

async function recoverStale() {
  const running = await PlagScan.find({ status: 'running' }).select('startedAt requeues').lean();
  for (const scan of running) {
    const action = staleAction(scan, Date.now(), LIMITS.staleMs);
    if (action === 'requeue') {
      await PlagScan.updateOne({ _id: scan._id, status: 'running' }, { $set: { status: 'queued' }, $inc: { requeues: 1 } });
    } else if (action === 'incomplete') {
      await PlagScan.updateOne(
        { _id: scan._id, status: 'running' },
        { $set: { status: 'incomplete', verdict: 'incomplete', failureReason: INTERRUPTED, finishedAt: new Date() } }
      );
    }
  }
}

export function startPlagiarismWorker() {
  let stopped = false;
  let timer;

  const tick = async () => {
    if (stopped) return;
    let delay = 4000;
    try {
      await recoverStale();
      const scan = await PlagScan.findOneAndUpdate(
        { status: 'queued' },
        { $set: { status: 'running', startedAt: new Date() } },
        { sort: { createdAt: 1 }, returnDocument: 'after' }
      );
      if (scan) {
        delay = 250;
        try {
          await processScan(scan);
        } catch (err) {
          logger.error('plagiarism', 'scan failed', err);
          await PlagScan.updateOne(
            { _id: scan._id, status: 'running' },
            { $set: { status: 'failed', verdict: 'incomplete', failureReason: ERRORED, finishedAt: new Date() } }
          );
        }
      }
    } catch (err) {
      logger.error('plagiarism', 'worker failed', err);
    } finally {
      if (!stopped) timer = setTimeout(tick, delay);
    }
  };

  timer = setTimeout(tick, 1000);
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
