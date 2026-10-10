import { useEffect, useState } from 'react';

/**
 * Returns the id of the section closest to an anchor line drawn at
 * `anchorRatio` of the viewport height (0 = top, 1 = bottom). A section
 * that contains the anchor wins outright. Shared by every scroll-spy so
 * the navbar and the minimap always agree on what is "active".
 */
export function findActiveSection(ids: readonly string[], anchorRatio = 0.4): string | undefined {
  const anchorY = window.innerHeight * anchorRatio;
  let activeId: string | undefined;
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const id of ids) {
    const element = document.getElementById(id);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    const distance =
      rect.top <= anchorY && rect.bottom >= anchorY
        ? 0
        : Math.min(Math.abs(rect.top - anchorY), Math.abs(rect.bottom - anchorY));

    if (distance < shortestDistance) {
      shortestDistance = distance;
      activeId = id;
    }
  }

  return activeId;
}

/** Tracks `findActiveSection` on scroll and resize (rAF-throttled). */
export function useActiveSection(ids: readonly string[], anchorRatio = 0.4) {
  const [activeId, setActiveId] = useState<string | undefined>();
  const key = ids.join('|');

  useEffect(() => {
    const sectionIds = key.split('|');
    let frame = 0;

    const update = () => {
      frame = 0;
      setActiveId(findActiveSection(sectionIds, anchorRatio));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [key, anchorRatio]);

  return activeId;
}
