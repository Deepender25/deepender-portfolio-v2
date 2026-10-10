import type Lenis from 'lenis';

/** The app-wide Lenis instance (set in App), if smooth scrolling is running. */
export const getLenis = () => (window as unknown as { lenis?: Lenis }).lenis;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* One easing for every programmatic scroll so jumps feel like the wheel scroll */
const SCROLL_DURATION = 1.1;
const easeOutExpo = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * Scrolls to a section (by id) or to the top (`0`). Uses Lenis when it is
 * running; otherwise falls back to native scrolling, instant for users who
 * prefer reduced motion. Honors each section's `scroll-margin-top`.
 */
export const scrollToTarget = (target: string | 0) => {
  const lenis = getLenis();
  const el = target === 0 ? null : document.getElementById(target);
  if (target !== 0 && !el) return;

  if (lenis) {
    lenis.scrollTo(el ?? 0, { duration: SCROLL_DURATION, easing: easeOutExpo });
    return;
  }

  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (el) el.scrollIntoView({ behavior });
  else window.scrollTo({ top: 0, behavior });
};

interface NavigateOptions {
  /** Set false when only the URL should change, e.g. closing an overlay. */
  scroll?: boolean;
}

export const navigate = (path: string, sectionId?: string, { scroll = true }: NavigateOptions = {}) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));

  if (!scroll) return;
  if (sectionId) scrollToTarget(sectionId);
  else if (path === '/') scrollToTarget(0);
};
