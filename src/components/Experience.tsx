import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const experiences = [
  {
    role: "AI/ML Intern",
    company: "RationalGo AI",
    period: "Jun 2025 – Aug 2025",
    description: [
      "Shipped 3+ internal tools and product features — including workflow automation utilities and marketing efficiency tools.",
      "Built and optimized agentic LLM pipelines using prompt engineering and LLM evaluation, improving output quality.",
      "Contributed to product testing, bug fixing, and performance optimization, collaborating on backend AI logic."
    ]
  },
  {
    role: "Head of Data Collection",
    company: "Training & Placement Office, Gurugram University",
    period: "Feb 2026 – Present",
    description: [
      "Led a team of 4–5 members to scrape, clean, and maintain a structured database of 300+ company profiles.",
      "Built automated data pipelines cutting manual data entry time by ~40%, supporting placement drive coordination."
    ]
  }
];

export default function Experience() {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      // 1. Initial states (Changed to y: 40 for perfect consistency with all other sections)
      gsap.set('.exp-label',      { autoAlpha: 0, y: 40 });
      gsap.set('.exp-heading',    { autoAlpha: 0, y: 40 });
      gsap.set('.experience-card',{ autoAlpha: 0, y: 40 }); // Changed from x: -20 to y: 40

      // 2. Entrance Animation (Snappy, resets on scroll up)
      const tlIn = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 95%',
          toggleActions: 'play none none reverse',
        },
      });

      tlIn.to('.exp-label', { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power4.out' })
          .to('.exp-heading', { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power4.out' }, '-=0.8')
          .to('.experience-card', { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power4.out', stagger: 0.15 }, '-=0.9');

      // 3. Parallax Exit (Whole Container)
      const tlOut = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 15%',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      tlOut.fromTo('.exp-container-wrapper',
        { y: 0, autoAlpha: 1, scale: 1, immediateRender: false },
        { y: 100, autoAlpha: 0, scale: 0.9, ease: 'none' }, 0);
    });
  }, { scope: container });

  return (
    <section id="experience" ref={container} className="px-6 md:px-12 max-w-7xl mx-auto w-full mt-12 md:mt-16 relative z-40">
      <div className="exp-container-wrapper">
        <div className="mb-12">
          <h2 className="exp-label text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2">03 // Experience</h2>
          <h3 className="exp-heading text-4xl font-display font-medium tracking-tight text-gradient">Professional Journey</h3>
        </div>
        
        <div className="space-y-6">
          {experiences.map((exp, index) => (
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
