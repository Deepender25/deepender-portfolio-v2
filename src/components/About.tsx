import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function About() {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      // 1. Initial states for Entrance (Consistent Y-axis for all sections)
      gsap.set('.about-label',      { autoAlpha: 0, y: 40 });
      gsap.set('.about-heading',    { autoAlpha: 0, y: 40 });
      gsap.set('.about-para',       { autoAlpha: 0, y: 40 });
      gsap.set('.about-mini-card',  { autoAlpha: 0, y: 40 });

      // 2. Entrance Timeline (Matches Hero snappy feel + resets on scroll up)
      const tlIn = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 95%',
          toggleActions: 'play none none reverse', // Resets cleanly when scrolling way up
        },
      });

      tlIn.to('.about-label', { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power4.out' })
          .to('.about-heading', { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power4.out' }, '-=0.8')
          .to('.about-para', { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power4.out', stagger: 0.15 }, '-=1.0')
          .to('.about-mini-card', { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power4.out', stagger: 0.15 }, '-=0.9');

      // 3. Parallax Exit Timeline (Whole Container moving to prevent text clipping)
      const tlOut = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 10%', 
          end: 'bottom top',
          scrub: 1.2, // Silky smooth parallax
        },
      });

      tlOut.fromTo('.about-card-wrapper',
        { y: 0, autoAlpha: 1, scale: 1, immediateRender: false },
        { y: 100, autoAlpha: 0, scale: 0.9, ease: 'none' }, 0);
    });
  }, { scope: container });

  return (
    <section id="about" ref={container} className="px-6 md:px-12 max-w-7xl mx-auto w-full relative z-20">
      <div className="about-card-wrapper">
        <div className="about-card glass-panel-strong rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
            <div className="md:col-span-4">
              <h2 className="about-label text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-4">
                01 // About
              </h2>
              <h3 className="about-heading text-4xl font-display font-medium tracking-tight text-gradient">
                Bridging AI &amp; UX
              </h3>
            </div>
            
            <div className="md:col-span-8 space-y-6 text-white/70 font-light leading-relaxed text-lg">
              <p className="about-para">
                Currently pursuing my B.Tech in Computer Science &amp; Engineering (AI/ML) at Gurugram University (CGPA: 8.5/10). My focus lies at the intersection of machine learning and full-stack development.
              </p>
              <p className="about-para">
                I specialize in building agentic LLM pipelines, RAG systems, and robust web applications. Whether it's optimizing multi-step reasoning tasks or engineering hands-free HCI systems, I thrive on solving complex technical challenges.
              </p>
              
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-white/10">
                <div className="about-mini-card glass-panel p-6 rounded-2xl">
                  <h4 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-3">Education</h4>
                  <p className="text-white/90 font-medium">B.Tech CS &amp; Eng (AI/ML)</p>
                  <p className="text-white/60 text-sm mt-1">Gurugram University<br/>2023 – 2027</p>
                </div>
                <div className="about-mini-card glass-panel p-6 rounded-2xl">
                  <h4 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-3">Certifications</h4>
                  <ul className="text-white/80 text-sm space-y-2 font-medium">
                    <li>Claude Code in Action</li>
                    <li>Oracle Cloud Infrastructure</li>
                    <li>AWS Solutions Architecture</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
