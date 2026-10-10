import { useEffect } from 'react';
import { routeMeta } from './meta';

/* Find-or-create a <meta>/<link> by its identifying attribute */
function upsert(tag: 'meta' | 'link', key: 'name' | 'property' | 'rel', id: string, attr: 'content' | 'href', value: string) {
  let el = document.head.querySelector<HTMLElement>(`${tag}[${key}="${id}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(key, id);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Keeps <head> in sync with client-side navigation. The first load already
 * has correct tags from the build; this covers in-app route changes and
 * marks unknown paths noindex (they render the home page as a fallback).
 */
export function useRouteMeta(pathname: string) {
  useEffect(() => {
    const meta = routeMeta(pathname);

    document.title = meta.title;
    upsert('meta', 'name', 'description', 'content', meta.description);
    upsert('meta', 'name', 'robots', 'content', meta.robots);
    upsert('link', 'rel', 'canonical', 'href', meta.canonical);

    upsert('meta', 'property', 'og:type', 'content', meta.ogType);
    upsert('meta', 'property', 'og:url', 'content', meta.canonical);
    upsert('meta', 'property', 'og:title', 'content', meta.title);
    upsert('meta', 'property', 'og:description', 'content', meta.description);
    upsert('meta', 'property', 'og:image', 'content', meta.image);
    upsert('meta', 'property', 'og:image:width', 'content', String(meta.imageWidth));
    upsert('meta', 'property', 'og:image:height', 'content', String(meta.imageHeight));
    upsert('meta', 'property', 'og:image:alt', 'content', meta.imageAlt);

    upsert('meta', 'name', 'twitter:title', 'content', meta.title);
    upsert('meta', 'name', 'twitter:description', 'content', meta.description);
    upsert('meta', 'name', 'twitter:image', 'content', meta.image);
    upsert('meta', 'name', 'twitter:image:alt', 'content', meta.imageAlt);
  }, [pathname]);
}
