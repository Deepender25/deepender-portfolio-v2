import { useRef } from 'react';
import portfolioData from '../data/portfolio.json';

/* simple-icons slugs for skills that have a brand mark.
   Anything unmapped falls back to the text-only pill. */
const ICONS: Record<string, string> = {
  Python: 'python',
  TypeScript: 'typescript',
  JavaScript: 'javascript',
  LangChain: 'langchain',
  'Hugging Face': 'huggingface',
  PyTorch: 'pytorch',
  'Scikit-learn': 'scikitlearn',
  'Computer Vision': 'opencv',
  'Next.js': 'nextdotjs',
  'React.js': 'react',
  FastAPI: 'fastapi',
  Flask: 'flask',
  'Tailwind CSS': 'tailwindcss',
  PostgreSQL: 'postgresql',
  Supabase: 'supabase',
  Vercel: 'vercel',
  Git: 'git',
  Docker: 'docker',
  Linux: 'linux',
  Electron: 'electron',
};

export default function Skills() {
  const container = useRef<HTMLElement>(null);

  return (
    <section id="skills" ref={container} className="px-6 md:px-12 max-w-7xl mx-auto w-full relative z-30">
      <div className="skills-container-wrapper">
        <div className="mb-12">
          <p className="skills-label text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2" aria-hidden="true">02 // Skills</p>
          <h2 className="skills-heading text-4xl font-display font-medium tracking-tight text-gradient">Technical Arsenal</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {portfolioData.skills.map((category, index) => (
            <div key={index} className={category.className}>
              <div className="skill-card glass-panel p-8 rounded-3xl h-full">
                <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
                  {category.title}
                </h4>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {category.skills.map((skill) => {
                    const slug = ICONS[skill];
                    return (
                      <span
                        key={skill}
                        className="group flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-sm font-light text-white/80 hover:border-white/30 hover:text-white transition-colors"
                      >
                        {slug && (
                          <img
                            src={`https://cdn.simpleicons.org/${slug}/ffffff`}
                            alt=""
                            loading="lazy"
                            width={14}
                            height={14}
                            aria-hidden
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                            className="h-3.5 w-3.5 opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                          />
                        )}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
