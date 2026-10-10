/**
 * Single source of truth for search/social metadata. Pure functions only —
 * shared by the Vite build (static HTML per route, sitemap, robots) and by
 * the app at runtime (head updates on client-side navigation).
 *
 * To move to a new domain, change `url` in /site.config.json.
 */
import site from '../../site.config.json';
import portfolio from '../data/portfolio.json';

export type Project = (typeof portfolio.projects)[number];

export const SITE_URL = site.url.replace(/\/+$/, '');

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`);

export const projectSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-');

export const projectPath = (project: { title: string }) => `/work/${projectSlug(project.title)}`;

export const findProject = (slug: string) => portfolio.projects.find((p) => projectSlug(p.title) === slug) ?? null;

/** In-page section routes — same document as "/", so they canonicalise to it */
const HOME_ALIASES = new Set(['/', '/about', '/skills', '/experience', '/projects', '/contact', '/resume']);

/* "AI AGENT" → "AI Agent", "SAAS" → "SaaS", "DESKTOP APP" → "Desktop App" */
const ACRONYMS: Record<string, string> = { AI: 'AI', ML: 'ML', HCI: 'HCI', LLM: 'LLM', SAAS: 'SaaS', API: 'API' };
const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .map((word) => ACRONYMS[word.toUpperCase()] ?? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

/** Trim to a search-snippet-friendly length on a word boundary */
const snippet = (text: string, max = 158) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—-]+$/, '')}…`;
};

const isLink = (value?: string) => Boolean(value && value !== '#');

export interface RouteMeta {
  title: string;
  description: string;
  /** Absolute canonical URL */
  canonical: string;
  robots: string;
  ogType: 'profile' | 'website';
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  project: Project | null;
}

const INDEXABLE = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

const homeMeta = (): RouteMeta => ({
  title: site.title,
  description: site.description,
  canonical: `${SITE_URL}/`,
  robots: INDEXABLE,
  ogType: 'profile',
  image: absoluteUrl(site.ogImage),
  imageAlt: site.ogImageAlt,
  imageWidth: 1200,
  imageHeight: 630,
  project: null,
});

export function workMeta(project: Project): RouteMeta {
  const category = project.category ? titleCase(project.category) : project.tech[0];
  // A dedicated 1200×630 card wins; landscape posters are 960×540; else the site card
  const { ogImage } = project as { ogImage?: string };
  const image = ogImage
    ? { src: ogImage, width: 1200, height: 630 }
    : project.poster
      ? { src: project.poster, width: 960, height: 540 }
      : { src: site.ogImage, width: 1200, height: 630 };
  return {
    title: `${project.title} — ${category} | ${site.name}`,
    description: snippet(project.description),
    canonical: absoluteUrl(projectPath(project)),
    robots: INDEXABLE,
    ogType: 'website',
    image: absoluteUrl(image.src),
    imageAlt: `${project.title} — ${category} project by ${site.name}`,
    imageWidth: image.width,
    imageHeight: image.height,
    project,
  };
}

/**
 * Metadata for any pathname the app can be loaded at. Unknown paths still
 * render the home page (SPA fallback), so they are marked noindex rather
 * than becoming soft-404 duplicates.
 */
export function routeMeta(pathname: string): RouteMeta {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (HOME_ALIASES.has(path)) return homeMeta();

  if (path.startsWith('/work/')) {
    const project = findProject(decodeURIComponent(path.slice('/work/'.length)));
    if (project) return workMeta(project);
  }

  return { ...homeMeta(), robots: 'noindex, follow' };
}

/* ── Structured data (schema.org JSON-LD) ──────────────────────────────── */

const ids = {
  website: `${SITE_URL}/#website`,
  person: `${SITE_URL}/#person`,
  profile: `${SITE_URL}/#profile`,
};

const personNode = () => {
  const current = portfolio.experience[0];
  return {
    '@type': 'Person',
    '@id': ids.person,
    name: site.name,
    alternateName: site.alternateName,
    url: `${SITE_URL}/`,
    image: absoluteUrl(site.image),
    jobTitle: site.jobTitle,
    description: site.description,
    email: `mailto:${portfolio.contact.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: site.location.country,
    },
    alumniOf: { '@type': 'CollegeOrUniversity', name: portfolio.about.education.university },
    ...(current ? { worksFor: { '@type': 'Organization', name: current.company } } : {}),
    knowsAbout: [...new Set(portfolio.skills.flatMap((group) => group.skills))],
    sameAs: [portfolio.hero.social.github, portfolio.hero.social.linkedin].filter(isLink),
  };
};

const websiteNode = () => ({
  '@type': 'WebSite',
  '@id': ids.website,
  url: `${SITE_URL}/`,
  name: site.name,
  alternateName: `${site.name} Portfolio`,
  description: site.description,
  inLanguage: 'en',
  publisher: { '@id': ids.person },
});

export function jsonLd(meta: RouteMeta) {
  const { project } = meta;

  if (!project) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        websiteNode(),
        {
          '@type': 'ProfilePage',
          '@id': ids.profile,
          url: meta.canonical,
          name: meta.title,
          description: meta.description,
          inLanguage: 'en',
          isPartOf: { '@id': ids.website },
          mainEntity: { '@id': ids.person },
          primaryImageOfPage: { '@type': 'ImageObject', url: meta.image },
        },
        personNode(),
      ],
    };
  }

  const workId = `${meta.canonical}#work`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      websiteNode(),
      {
        '@type': 'WebPage',
        '@id': `${meta.canonical}#webpage`,
        url: meta.canonical,
        name: meta.title,
        description: meta.description,
        inLanguage: 'en',
        isPartOf: { '@id': ids.website },
        about: { '@id': workId },
        primaryImageOfPage: { '@type': 'ImageObject', url: meta.image },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: site.name, item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: project.title, item: meta.canonical },
          ],
        },
      },
      {
        '@type': 'CreativeWork',
        '@id': workId,
        name: project.title,
        description: project.description,
        url: meta.canonical,
        image: meta.image,
        genre: project.category ? titleCase(project.category) : undefined,
        keywords: project.tech.join(', '),
        author: { '@id': ids.person },
        creator: { '@id': ids.person },
        sameAs: [project.github, project.live, (project as { msStore?: string }).msStore].filter(isLink),
      },
      { '@type': 'Person', '@id': ids.person, name: site.name, url: `${SITE_URL}/` },
    ],
  };
}

/* ── Crawl files ────────────────────────────────────────────────────────── */

export const indexablePaths = () => ['/', ...portfolio.projects.map(projectPath)];

export const sitemapXml = () =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexablePaths()
  .map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`)
  .join('\n')}
</urlset>
`;

export const robotsTxt = () => `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

export const webManifest = () =>
  JSON.stringify(
    {
      name: site.title,
      short_name: 'DY',
      description: site.description,
      start_url: '/',
      display: 'browser',
      background_color: site.themeColor,
      theme_color: site.themeColor,
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  );

export { site, portfolio };
