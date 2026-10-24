import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { estimatedReadingMinutes, postContentDate, sortPostsNewestFirst } from '../src/lib/posts.ts';
import { blogLastModified } from '../src/lib/sitemap.mjs';

test('post order uses publication date, stable ID ties, and does not mutate input', () => {
 const posts = [
  { id: 'b', data: { pubDate: new Date('2026-10-23'), updatedDate: new Date('2026-11-01') } },
  { id: 'a', data: { pubDate: new Date('2026-10-23') } },
  { id: 'newest', data: { pubDate: new Date('2026-10-24') } },
 ];
 assert.deepEqual(sortPostsNewestFirst(posts).map(p => p.id), ['newest', 'a', 'b']);
 assert.deepEqual(posts.map(p => p.id), ['b', 'a', 'newest']);
 assert.deepEqual(sortPostsNewestFirst([]), []);
});

test('content date prefers an explicit update, otherwise publication', () => {
 const pubDate = new Date('2026-10-23');
 const updatedDate = new Date('2026-10-24');
 assert.equal(postContentDate({ data: { pubDate } }), pubDate);
 assert.equal(postContentDate({ data: { pubDate, updatedDate } }), updatedDate);
});

test('reading estimate handles CJK, Latin text, mixed prose, and Markdown markup', () => {
 assert.equal(estimatedReadingMinutes(''), 1);
 assert.equal(estimatedReadingMinutes('汉'.repeat(300)), 1);
 assert.equal(estimatedReadingMinutes('汉'.repeat(301)), 2);
 assert.equal(estimatedReadingMinutes('word '.repeat(200)), 1);
 assert.equal(estimatedReadingMinutes('word '.repeat(201)), 2);
 assert.equal(estimatedReadingMinutes('汉'.repeat(300) + 'word '.repeat(200)), 2);
 assert.equal(estimatedReadingMinutes(`[word](https://example.com/${'path/'.repeat(600)})`), 1);
 assert.equal(estimatedReadingMinutes(`\`\`\`js\n${'const value = 1; '.repeat(1000)}\n\`\`\``), 1);
});

test('sitemap metadata matches glob IDs and real dates, including nested and explicit slugs', async () => {
 const folder = await mkdtemp(path.join(tmpdir(), 'blog-sitemap-'));
 try {
  await mkdir(path.join(folder, 'Mixed Folder'));
  await writeFile(path.join(folder, 'fallback.md'), '---\npubDate: 2026-10-10\n---\nBody');
  await writeFile(path.join(folder, 'Mixed Folder', 'index.md'), '---\npubDate: "2026-10-11"\nupdatedDate: "2026-10-12T12:30:00+08:00"\n---\nBody');
  await writeFile(path.join(folder, 'ignored-filename.mdx'), '---\nslug: "自定路径/child"\npubDate: 2026-10-13\n---\nBody');
  const dates = await blogLastModified(pathToFileURL(folder + '/'), 'https://putl.online');
  assert.equal(dates.size, 3);
  assert.equal(dates.get('/blog/fallback/'), '2026-10-10T00:00:00.000Z');
  assert.equal(dates.get('/blog/mixed-folder/'), '2026-10-12T04:30:00.000Z');
  assert.equal(dates.get(new URL('/blog/自定路径/child/', 'https://putl.online').pathname), '2026-10-13T00:00:00.000Z');
  assert.equal(dates.has('/about/'), false);
  await writeFile(path.join(folder, 'bad.md'), '---\npubDate: not-a-date\n---\nBody');
  await assert.rejects(blogLastModified(pathToFileURL(folder + '/'), 'https://putl.online'), /Invalid content date in bad.md/);
 } finally {
  await rm(folder, { recursive: true, force: true });
 }
});
