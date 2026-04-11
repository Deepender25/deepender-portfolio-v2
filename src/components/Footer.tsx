export default function Footer() {
  return (
    <footer className="py-8 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 mt-12">
      <p className="text-white/40 text-xs font-mono uppercase tracking-widest">
        © {new Date().getFullYear()} Deepender Yadav.
      </p>
      <div className="flex items-center gap-6">
        <a href="https://github.com/Deepender25" className="text-white/40 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest">GitHub</a>
        <a href="https://www.linkedin.com/in/deepender25/" className="text-white/40 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest">LinkedIn</a>
      </div>
    </footer>
  );
}
