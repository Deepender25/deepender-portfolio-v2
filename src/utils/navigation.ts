export const navigate = (path: string, sectionId?: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('popstate'));
  
  if (sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  } else if (path === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
