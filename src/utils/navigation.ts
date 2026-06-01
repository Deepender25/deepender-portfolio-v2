import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const navigate = (path: string, sectionId?: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));

  const lenis = (window as any).lenis;

  if (sectionId) {
    // Dynamically find the ScrollTrigger associated with this section's DOM element
    // This avoids React Strict Mode ID collisions
    const st = ScrollTrigger.getAll().find(t => t.trigger?.id === sectionId);
    
    if (st) {
      if (lenis) {
        // Force Lenis to instantly jump to the mathematically exact start of the pin
        lenis.scrollTo(st.start, { immediate: true });
      } else {
        window.scrollTo({ top: st.start, behavior: 'auto' });
      }
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        if (lenis) {
          // Force Lenis to instantly jump past the section
          lenis.scrollTo(el, { immediate: true });
        } else {
          el.scrollIntoView({ behavior: 'auto' });
        }
      }
    }
  } else if (path === '/') {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }
};
