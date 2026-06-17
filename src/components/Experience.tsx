import { useRef } from 'react';
import portfolioData from '../data/portfolio.json';

export default function Experience() {
  const container = useRef<HTMLElement>(null);

  return (
    <section id="experience" ref={container} className="px-6 md:px-12 max-w-7xl mx-auto w-full relative z-40">
      <div className="exp-container-wrapper">
        <div className="mb-12">
          <p className="exp-label text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2" aria-hidden="true">03 // Experience</p>
          <h2 className="exp-heading text-4xl font-display font-medium tracking-tight text-gradient">Professional Journey</h2>
        </div>
        
        <div className="space-y-6">
          {portfolioData.experience.map((exp, index) => (
            <div key={index}>
              <div className="experience-card glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden group">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-display font-medium tracking-tight text-white group-hover:text-gradient transition-all">
                      {exp.role}
                    </h3>
                    <p className="text-sm font-mono text-white/50 mt-2">{exp.company}</p>
                  </div>
                  <span className="glass-pill px-4 py-2 rounded-full text-xs font-mono text-white/60 shrink-0">
                    {exp.period}
                  </span>
                </div>
                
                <ul className="space-y-4">
                  {exp.description.map((item, i) => (
                    <li key={i} className="text-white/70 font-light text-sm md:text-base flex gap-4">
                      <span className="text-white/20 mt-1.5 text-[10px]">◆</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
