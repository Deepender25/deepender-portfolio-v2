import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const skillCategories = [
  { title: "Languages",        skills: ["Python", "TypeScript", "JavaScript", "SQL"],                                                                                          className: "md:col-span-4"  },
  { title: "AI / ML",          skills: ["Machine Learning", "LLMs", "RAG", "Prompt Engineering", "LangChain", "Hugging Face", "PyTorch", "Scikit-learn", "Computer Vision"], className: "md:col-span-8"  },
  { title: "Web & Backend",    skills: ["Next.js", "React.js", "FastAPI", "Flask", "REST API", "Tailwind CSS", "Serverless"],                                                 className: "md:col-span-7"  },
  { title: "Databases & Cloud",skills: ["PostgreSQL", "ChromaDB", "Supabase", "Vercel"],                                                                                      className: "md:col-span-5"  },
  { title: "Tools & Practices",skills: ["Git", "Docker", "CI/CD", "JWT", "OAuth 2.0", "Web Scraping", "Linux"],                                                               className: "md:col-span-12" },
];

export default function Skills() {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      // 1. Initial states for Entrance
      gsap.set('.skills-label',   { autoAlpha: 0, y: 40 });
      gsap.set('.skills-heading', { autoAlpha: 0, y: 40 });
      gsap.set('.skill-card',     { autoAlpha: 0, y: 40 });

      // 2. Entrance Timeline (Consistent with Hero & About)
      const tlIn = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      tlIn.to('.skills-label', { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power4.out' })
          .to('.skills-heading', { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power4.out' }, '-=0.8')
          .to('.skill-card', { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power4.out', stagger: 0.1 }, '-=0.9');

      // 3. Parallax Exit Timeline (Whole Container)
      const tlOut = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 15%',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      tlOut.fromTo('.skills-container-wrapper',
        { y: 0, autoAlpha: 1, scale: 1, immediateRender: false },
        { y: -150, autoAlpha: 0, scale: 0.95, ease: 'none' }, 0);
    });
  }, { scope: container });

  return (
    <section id="skills" ref={container} className="px-6 md:px-12 max-w-7xl mx-auto w-full pb-20 pt-20">
      <div className="skills-container-wrapper">
        <div className="mb-12">
          <h2 className="skills-label text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2">02 // Skills</h2>
          <h3 className="skills-heading text-4xl font-display font-medium tracking-tight text-gradient">Technical Arsenal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {skillCategories.map((category, index) => (
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
