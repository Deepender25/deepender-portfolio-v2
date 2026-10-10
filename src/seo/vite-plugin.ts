/**
 * Build-time SEO: writes route-specific <head> tags into the HTML so crawlers
 * and link-preview bots (which often don't run JavaScript) see correct
 * metadata, and emits one static HTML file per case study plus the crawl
 * files. Node-only — imported from vite.config.ts, never from the app.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import {
  jsonLd,
  portfolio,
  projectPath,
  robotsTxt,
  routeMeta,
  site,
  sitemapXml,
  webManifest,
  workMeta,
  type RouteMeta,
} from './meta';

const START = '<!-- seo:start -->';
const END = '<!-- seo:end -->';
const NOSCRIPT_START = '<!-- noscript:start -->';
const NOSCRIPT_END = '<!-- noscript:end -->';

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* "</script>" inside JSON-LD would end the tag early */
const safeJson = (data: unknown) => JSON.stringify(data, null, 2).replace(/</g, '\\u003c');

function headTags(meta: RouteMeta) {
  const [firstName, ...rest] = site.name.split(' ');
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    `<meta name="robots" content="${meta.robots}" />`,
    `<meta name="author" content="${esc(site.name)}" />`,
    '',
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="${esc(site.name)}" />`,
    `<meta property="og:locale" content="${site.locale}" />`,
    `<meta property="og:url" content="${esc(meta.canonical)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${esc(meta.image)}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="${meta.imageWidth}" />`,
    `<meta property="og:image:height" content="${meta.imageHeight}" />`,
    `<meta property="og:image:alt" content="${esc(meta.imageAlt)}" />`,
    ...(meta.ogType === 'profile'
      ? [
          `<meta property="profile:first_name" content="${esc(firstName)}" />`,
          `<meta property="profile:last_name" content="${esc(rest.join(' '))}" />`,
          `<meta property="profile:username" content="${esc(site.alternateName)}" />`,
        ]
      : []),
    '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(meta.image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(meta.imageAlt)}" />`,
    '',
    `<script type="application/ld+json">\n${safeJson(jsonLd(meta))}\n</script>`,
  ];
  // The placeholder's own indentation already precedes the first line
  return [START, ...tags, END].map((line, i) => (line && i > 0 ? `  ${line}` : line)).join('\n');
}

/* Plain-HTML summary for visitors and crawlers without JavaScript. Every case
   study is linked, so all pages stay discoverable even without rendering. */
function noscript(meta: RouteMeta) {
  const project = meta.project;
  const intro = project
    ? `<h1>${esc(project.title)}</h1><p>${esc(project.description)}</p><p>Built with ${esc(project.tech.join(', '))}.</p><p><a href="/">${esc(site.name)} — ${esc(site.jobTitle)}</a></p>`
    : `<h1>${esc(site.name)}</h1><p>${esc(site.jobTitle)} · ${esc(site.location.city)}, India</p><p>${esc(portfolio.hero.description1)}</p>`;
  const work = portfolio.projects
    .map((p) => `<li><a href="${projectPath(p)}">${esc(p.title)}</a> — ${esc(p.description)}</li>`)
    .join('');
  return `${NOSCRIPT_START}<noscript><main style="max-width:44rem;margin:4rem auto;padding:0 1.5rem;font-family:system-ui,sans-serif;line-height:1.6;color:#e5e5e5">${intro}<h2>Selected work</h2><ul>${work}</ul><p><a href="mailto:${esc(portfolio.contact.email)}">${esc(portfolio.contact.email)}</a> · <a href="${esc(portfolio.hero.social.github)}">GitHub</a> · <a href="${esc(portfolio.hero.social.linkedin)}">LinkedIn</a></p></main></noscript>${NOSCRIPT_END}`;
}

const replaceBetween = (html: string, start: string, end: string, value: string) => {
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a < 0 || b < 0) throw new Error(`[seo] markers ${start} … ${end} not found in index.html`);
  return html.slice(0, a) + value.trimStart() + html.slice(b + end.length);
};

export function seo(): Plugin {
  let outDir = 'dist';

  const files: Record<string, () => string> = {
    '/sitemap.xml': sitemapXml,
    '/robots.txt': robotsTxt,
    '/site.webmanifest': webManifest,
  };

  return {
    name: 'portfolio-seo',

    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },

    // Home-page tags in index.html (dev and build); per-route copies are made below
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const meta = routeMeta(ctx.originalUrl?.split('?')[0] ?? '/');
        return html.replace('<!-- seo -->', headTags(meta)).replace('<!-- noscript -->', noscript(meta));
      },
    },

    // Serve the generated crawl files in dev too
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const make = req.url ? files[req.url.split('?')[0]] : undefined;
        if (!make) return next();
        res.setHeader('Content-Type', req.url!.endsWith('.xml') ? 'application/xml' : req.url!.endsWith('.txt') ? 'text/plain' : 'application/manifest+json');
        res.end(make());
      });
    },

    writeBundle() {
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');

      for (const project of portfolio.projects) {
        const meta = workMeta(project);
        let html = replaceBetween(template, START, END, headTags(meta));
        html = replaceBetween(html, NOSCRIPT_START, NOSCRIPT_END, noscript(meta));
        const file = path.join(outDir, projectPath(project), 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, html);
      }

      for (const [name, make] of Object.entries(files)) {
        fs.writeFileSync(path.join(outDir, name), make());
      }
    },
  };
}
