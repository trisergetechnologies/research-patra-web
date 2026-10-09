/**
 * Seeds starter categories, tags and posts written by the seeded admin and staff accounts.
 * Idempotent: existing categories, tags and posts (matched by slug) are left as they are.
 *   npm run seed:blog             add whatever is missing
 *   npm run seed:blog -- --fresh  delete all posts, categories, tags and activity first
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { Post, POST_STATUS } from '../models/Post.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthorProfile } from '../models/AuthorProfile.js';
import { publishExistingProfile, publicSnapshot } from '../services/author.service.js';
import { slugify } from '../utils/slug.js';
import { readingTime, sanitizePostHtml } from '../utils/html.js';
import { ensureSeedAccounts } from './lib/seedAccounts.js';
import { AUTHORS, CATEGORIES, POSTS } from './data/samplePosts.js';

const CATEGORY_DESCRIPTIONS = {
  thesis: 'Structure, argument and chapter-by-chapter advice for theses and dissertations.',
  proposal: 'How to scope, justify and schedule a research proposal that committees approve.',
  review: 'Search, synthesise and argue with the literature instead of summarising it.',
  data: 'Choosing, running and reporting quantitative and qualitative analyses honestly.',
  publishing: 'Preparing manuscripts, choosing journals and handling peer review.',
  citations: 'Referencing styles, formatting rules and the details examiners notice.',
  integrity: 'Originality, AI policy and the ethics of getting help with research.',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function blocksToHtml(body) {
  return body
    .map((b) => {
      switch (b[0]) {
        case 'h': return `<h2>${esc(b[1])}</h2>`;
        case 'p': return `<p>${esc(b[1])}</p>`;
        case 'ul': return `<ul>${b[1].map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
        case 'quote': return `<blockquote><p>${esc(b[1])}</p><cite>${esc(b[2])}</cite></blockquote>`;
        case 'note': return `<aside class="j-note"><strong>${esc(b[1])}</strong><span>${esc(b[2])}</span></aside>`;
        case 'table': {
          const [head, ...rows] = b[1];
          return `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows
            .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`;
        }
        default: return '';
      }
    })
    .join('\n');
}

async function upsertBy(Model, filter, doc) {
  return (await Model.findOne(filter)) || Model.create({ ...filter, ...doc });
}

async function run() {
  await connectDB();

  if (process.argv.includes('--fresh')) {
    await Promise.all([Post.deleteMany({}), Category.deleteMany({}), Tag.deleteMany({}), AuditLog.deleteMany({})]);
    console.log('Removed existing posts, categories, tags and activity');
  }

  const accounts = await ensureSeedAccounts();
  const authors = {};
  for (const [key, user] of Object.entries(accounts)) {
    const profile = await AuthorProfile.findOne({ user: user._id });
    if (!profile.roleTitle && !profile.bio) {
      profile.roleTitle = AUTHORS[key].role;
      profile.bio = AUTHORS[key].bio;
      if (!profile.published?.bio) {
        profile.published = publicSnapshot(profile);
        profile.status = 'approved';
        profile.eligible = true;
      }
      await profile.save();
    } else {
      await publishExistingProfile(profile);
    }
    authors[key] = { user, profile };
  }

  const categoryIds = {};
  for (const [key, c] of Object.entries(CATEGORIES)) {
    const cat = await upsertBy(Category, { slug: slugify(c.name) }, {
      name: c.name,
      description: CATEGORY_DESCRIPTIONS[key] ?? '',
      color: { from: c.c1, to: c.c2 },
    });
    categoryIds[key] = cat._id;
  }

  const tagIds = {};
  for (const name of new Set(POSTS.flatMap((p) => p.tags))) {
    tagIds[name] = (await upsertBy(Tag, { slug: slugify(name) }, { name }))._id;
  }

  let created = 0;
  for (const p of POSTS) {
    if (await Post.exists({ slug: p.slug })) continue;
    const html = sanitizePostHtml(blocksToHtml(p.body));
    const when = new Date(`${p.date}T09:00:00+05:30`);
    const status = p.status || POST_STATUS.PUBLISHED;
    const { user, profile } = authors[p.author];
    await Post.create({
      title: p.title,
      slug: p.slug,
      excerpt: p.dek,
      contentHtml: html,
      keyTakeaways: p.key,
      category: categoryIds[p.cat],
      tags: p.tags.map((t) => tagIds[t]),
      author: profile._id,
      createdBy: user._id,
      updatedBy: user._id,
      status,
      publishedAt: status === POST_STATUS.PUBLISHED ? when : null,
      submittedAt: status === POST_STATUS.IN_REVIEW ? new Date() : null,
      createdAt: when,
      featured: status === POST_STATUS.PUBLISHED && !!p.featured,
      views: p.views || 0,
      readingTime: p.read || readingTime(html),
    });
    created += 1;
  }

  // Keep a single featured post.
  const featured = await Post.find({ featured: true, deletedAt: null }).sort({ publishedAt: -1 }).select('_id');
  if (featured.length > 1) await Post.updateMany({ _id: { $in: featured.slice(1).map((f) => f._id) } }, { $set: { featured: false } });

  console.log(
    `Blog seed done: ${Object.keys(categoryIds).length} categories, ${Object.keys(tagIds).length} tags, ${created} new posts`
  );
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
