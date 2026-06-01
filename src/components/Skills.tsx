import { useRef } from 'react';
import portfolioData from '../data/portfolio.json';

export default function Skills() {
  const container = useRef<HTMLElement>(null);

  return (
    <section id="skills" ref={container} className="px-6 md:px-12 max-w-7xl mx-auto w-full mt-12 md:mt-16 relative z-30">
      <div className="skills-container-wrapper">
        <div className="mb-12">
          <h2 className="skills-label text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2">02 // Skills</h2>
          <h3 className="skills-heading text-4xl font-display font-medium tracking-tight text-gradient">Technical Arsenal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {portfolioData.skills.map((category, index) => (
            <div key={index} className={category.className}>
              <div className="skill-card glass-panel p-8 rounded-3xl hover:bg-white/[0.04] transition-colors h-full">
                <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
                  {category.title}
                </h4>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {category.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-sm font-light text-white/80 hover:border-white/30 hover:text-white transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
