import { useEffect } from 'react';
import { getLenis } from '../utils/navigation';

let locks = 0;

/**
 * Freezes page scrolling while `active` is true. Setting `overflow: hidden`
 * alone is not enough with Lenis — it scrolls the window programmatically —
 * so Lenis is stopped as well. Ref-counted so stacked overlays don't unlock
 * each other early.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (locks++ === 0) {
      document.body.style.overflow = 'hidden';
      getLenis()?.stop();
    }

    return () => {
      if (--locks === 0) {
        document.body.style.overflow = '';
        // Re-read: Lenis may have been recreated while the overlay was open
        getLenis()?.start();
      }
    };
  }, [active]);
}
