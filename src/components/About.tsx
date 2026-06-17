import { useRef } from 'react';
import portfolioData from '../data/portfolio.json';
import { GraduationCap, Award, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function About() {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Header text animation
    gsap.fromTo(".about-header", 
      { y: 40, opacity: 0 },
      {
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      }
    );

    // Cards animation
    gsap.fromTo(".about-card",
      { y: 40, opacity: 0 },
      {
        scrollTrigger: {
          trigger: ".about-grid",
          start: "top 85%",
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      }
    );
  }, { scope: container });

  return (
    <section id="about" ref={container} className="px-6 md:px-12 max-w-7xl mx-auto w-full relative z-20">
      
      {/* ── Standard Section Header ───────────────────────────────────── */}
      <div className="mb-10 md:mb-12 about-header">
        <p className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2" aria-hidden="true">
          01 // About
        </p>
        <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-gradient">
          Bridging AI &amp; UX
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 about-grid">
        
        {/* ── Top Left: Bio ──────────────────────────────────────── */}
        <div className="lg:col-span-7 glass-panel p-8 md:p-10 rounded-3xl about-card flex flex-col justify-center">
          <div className="space-y-8 text-white/80 font-light leading-[1.8] text-lg md:text-xl lg:text-[22px]">
            {portfolioData.about.paragraphs.map((para, i) => (
              <p key={i} className="about-para">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* ── Top Right: Certifications ───────────────────────────── */}
        <div className="lg:col-span-5 glass-panel p-8 md:p-10 rounded-3xl flex flex-col about-card">
          <div className="mb-8">
            <h4 className="text-sm font-mono text-white/40 uppercase tracking-widest">Certifications</h4>
          </div>
          
          <div className="flex flex-col gap-4">
            {portfolioData.about.certifications.map((cert, i) => (
              <a 
                key={i} 
                href={cert.link !== "#" ? cert.link : undefined}
                target={cert.link !== "#" ? "_blank" : undefined}
                rel="noreferrer"
                className={`flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-2xl transition-all duration-300 ${cert.link !== "#" ? 'cursor-pointer hover:bg-white/[0.06] hover:-translate-y-0.5' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <h5 className="text-white/90 font-medium text-[15px] leading-snug">
                      {cert.name}
                    </h5>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
                      {cert.link !== "#" ? "Verify Credential" : "Verification Pending"}
                    </span>
                  </div>
                </div>
                {cert.link !== "#" && (
                  <ExternalLink size={16} className="text-white/30 shrink-0" />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* ── Bottom: Education (Full Width Rectangle) ────────────── */}
        <div className="lg:col-span-12 glass-panel p-8 md:p-10 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-8 about-card group">
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div>
              <h4 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-1">Education</h4>
              <h5 className="text-2xl font-display text-white font-medium">
                {portfolioData.about.education.degree}
              </h5>
            </div>
          </div>
          
          <div className="relative z-10 md:text-right flex flex-col md:items-end">
            <p className="text-white/70 leading-relaxed text-lg mb-2">
              {portfolioData.about.education.university}
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-white/50 tracking-wider">
              {portfolioData.about.education.duration}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
