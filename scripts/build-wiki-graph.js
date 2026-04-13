#!/usr/bin/env node
/**
 * Parses wiki markdown files and extracts [[wikilink]] connections.
 * Outputs public/wiki-graph.json for the /wiki/graph visualization page.
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

const WIKI_DIR = new URL('../src/content/wiki/', import.meta.url).pathname;
const OUT_DIR = new URL('../public/', import.meta.url).pathname;
const OUT_FILE = join(OUT_DIR, 'wiki-graph.json');

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/;
const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]/g;

function parseFrontmatter(content) {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();
    if (key === 'tags') {
      fm.tags = val
        .replace(/[\[\]]/g, '')
        .split(',')
        .map(t => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (key === 'draft') {
      fm.draft = val === 'true';
    } else {
      fm[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

function pageResolver(name) {
  return name.toLowerCase().replace(/ /g, '-');
}

async function main() {
  const files = (await readdir(WIKI_DIR)).filter(f => f.endsWith('.md'));

  const nodes = [];
  const linkMap = {}; // slug -> [target slugs]

  for (const file of files) {
    const slug = basename(file, '.md');
    const content = await readFile(join(WIKI_DIR, file), 'utf-8');
    const fm = parseFrontmatter(content);

    if (fm.draft) continue;

    nodes.push({
      id: slug,
      title: fm.title || slug,
      tags: fm.tags || [],
    });

    const body = content.replace(FRONTMATTER_RE, '');
    const targets = [];
    let m;
    while ((m = WIKILINK_RE.exec(body)) !== null) {
      targets.push(pageResolver(m[1]));
    }
    linkMap[slug] = targets;
  }

  const nodeIds = new Set(nodes.map(n => n.id));

  // Add orphan nodes for broken links (targets that don't exist as pages)
  const orphanIds = new Set();
  for (const targets of Object.values(linkMap)) {
    for (const t of targets) {
      if (!nodeIds.has(t) && !orphanIds.has(t)) {
        orphanIds.add(t);
        nodes.push({ id: t, title: t, tags: [], orphan: true });
      }
    }
  }

  const links = [];
  for (const [source, targets] of Object.entries(linkMap)) {
    for (const target of targets) {
      links.push({ source, target });
    }
  }

  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  await writeFile(OUT_FILE, JSON.stringify({ nodes, links }, null, 2));
  console.log(`[wiki-graph] ${nodes.length} nodes, ${links.length} links → ${OUT_FILE}`);
}

main().catch(err => {
  console.error('[wiki-graph] Error:', err);
  process.exit(1);
});
