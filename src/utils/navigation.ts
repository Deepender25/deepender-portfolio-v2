export const navigate = (path: string, sectionId?: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));

  if (sectionId === 'projects') {
    // Signal Projects to snap all cards to card 1 and scroll to section start.
    // The reset handler inside Projects.tsx handles the scroll using the
    // ScrollTrigger instance (stRef.start) which is accurate from any position.
    window.dispatchEvent(new CustomEvent('reset-projects'));
  } else if (sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  } else if (path === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
