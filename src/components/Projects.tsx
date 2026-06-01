import React, { useState, useEffect, useRef } from 'react';
import portfolioData from '../data/portfolio.json';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Github, ExternalLink, ArrowLeft, ArrowRight,
  Bot, Newspaper, FileText, MonitorPlay, CalendarCheck,
  Subtitles, Scissors, MessageSquare, MousePointer2,
} from 'lucide-react';
import * as Icons from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─────────────────────────── Data ─────────────────────────────────────── */
const featuredProjects = portfolioData.projects;

/* ─────────── Word-split title renderer ───────────────────────────────── */
function Title({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block max-md:overflow-visible overflow-hidden mr-[0.35em] last:mr-0 align-bottom">
          <span className="word-inner inline-block">{word}</span>
        </span>
      ))}
    </>
  );
}

/* ═══════════════════════════ Component ══════════════════════════════════ */
export default function Projects() {
  const container = useRef<HTMLElement>(null);
  const scrollWrapper = useRef<HTMLDivElement>(null);
  const [mobileVideo, setMobileVideo] = useState<string | null>(null);

  // Mobile detection for JSX layout updates
  const [isMobileLayout, setIsMobileLayout] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  /* ── Mobile breakpoint tracker ───────────────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = (matches: boolean) => {
      setIsMobileLayout(matches);
    };
    const handler = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ── Horizontal Scroll Effect ─────────────────────────── */
  useGSAP(() => {
    if (!scrollWrapper.current || !container.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        pin: true,
        scrub: true, // Use true for 1:1 responsiveness with Lenis
        end: () => `+=${scrollWrapper.current!.scrollWidth}`, // Scroll exactly the width of the content
        invalidateOnRefresh: true,
      }
    });

    // 1. Initial Pause: Give the user time to read the very first project card
    tl.to({}, { duration: 0.05 });

    // 2. Horizontal Scroll: Move the wrapper to the left with GPU acceleration
    tl.to(scrollWrapper.current, {
      x: () => -(scrollWrapper.current!.scrollWidth - window.innerWidth),
      ease: "none",
      duration: 0.9,
      force3D: true, // Force GPU acceleration to prevent layout thrashing and jitter
    });

    // 3. Final Pause: Give the user time to read the very last project card
    tl.to({}, { duration: 0.05 });

  }, { scope: container });

  /* ══════════════════════════ Render ════════════════════════════════════ */
  return (
    <div className="w-full block mt-12 md:mt-16 mb-20">
      <style>{`
        .dynamic-pad {
          padding-left: max(1.5rem, calc(50vw - 42.5vw));
          padding-right: max(1.5rem, calc(50vw - 42.5vw));
        }
        @media (min-width: 768px) {
          .dynamic-pad {
            padding-left: max(3rem, calc(50vw - 450px));
            padding-right: max(3rem, calc(50vw - 450px));
          }
        }
        @media (min-width: 1024px) {
          .dynamic-pad {
            padding-left: max(3rem, calc(50vw - 562.5px));
            padding-right: max(3rem, calc(50vw - 562.5px));
          }
        }
      `}</style>
      <section
        id="projects"
        ref={container}
        className="w-full relative z-50 overflow-hidden h-fit"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="w-full px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-3 pt-16 md:pt-24 pb-8 md:pb-12 shrink-0">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2">
            04 // Projects
          </h2>
          <h3 className="text-4xl font-display font-medium tracking-tight text-gradient">
            Selected Works
          </h3>
        </div>
        <a
          href="https://github.com/Deepender25"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm font-mono text-white/60 hover:text-white transition-colors shrink-0"
        >
          View all on GitHub <ArrowRight size={14} />
        </a>
      </div>

      {/* ── Project List ────────────────────────────────────────────── */}
      <div 
        ref={scrollWrapper}
        className="flex flex-row gap-6 md:gap-12 pb-20 w-max dynamic-pad will-change-transform"
      >
        {featuredProjects.map((project, idx) => {
          const Icon = (Icons as any)[project.icon];

          return (
            <div
              key={project.title}
              className="pcard w-[85vw] md:w-[900px] lg:w-[1125px] flex-shrink-0
                rounded-[32px] p-5 md:p-8 glass-panel flex flex-col md:h-[550px]"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full w-full">

                {/* LEFT: details */}
                <div className="md:col-span-5 flex flex-col justify-between h-full">

                  {/* Icon + links row */}
                  <div className="flex justify-between items-start mb-6 md:mb-0">
                    <div className="w-[55px] h-[55px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shrink-0">
                      <Icon size={25} className="text-white/70" />
                    </div>
                    <div className="flex gap-1.5">
                      {project.github !== '#' && (
                        <a href={project.github} target="_blank" rel="noreferrer"
                          className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                          <Github size={20} />
                        </a>
                      )}
                      {project.live !== '#' && (
                        <a href={project.live} target="_blank" rel="noreferrer"
                          className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Title + description */}
                  <div className="flex-grow flex flex-col justify-center my-3 md:my-4">
                    <h3 className="text-2xl md:text-[2.3rem] font-display font-semibold tracking-tight leading-tight text-white mb-2 md:mb-4">
                      <Title text={project.title} />
                    </h3>
                    <p className="text-white/65 font-light leading-relaxed text-sm md:text-[17px] line-clamp-3 md:line-clamp-none">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech tags — limit to 5 on mobile */}
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mt-4 md:mt-auto">
                    {project.tech.slice(0, isMobileLayout ? 5 : project.tech.length).map((t, i) => (
                      <span key={i}
                        className="text-[10px] md:text-[11px] font-mono text-white/45 bg-white/5 border border-white/5 px-2.5 md:px-3 py-1.5 md:py-2 rounded-full uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Mobile Demo Video Button */}
                  {isMobileLayout && project.video && (
                    <button
                      onClick={() => setMobileVideo(project.video)}
                      className="mt-5 w-full py-3 rounded-[14px] bg-white/10 text-white font-medium text-[13px] tracking-wide flex items-center justify-center gap-2 border border-white/20 active:scale-[0.98] transition-all uppercase hover:bg-white/15"
                    >
                      <MonitorPlay size={16} /> Watch Demo Video
                    </button>
                  )}
                </div>

                {/* RIGHT: YouTube player — hidden on mobile */}
                <div
                  className="md:col-span-7 relative rounded-2xl overflow-hidden border border-white/10 bg-black hidden md:block"
                  style={{ minHeight: 0 }}
                >
                  {project.video ? (
                    <iframe
                      src={`${project.video}?autoplay=0&mute=1&rel=0&controls=1&modestbranding=1&vq=hd1080&hd=1`}
                      title={`${project.title} Demo`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                      <span className="text-white/40 font-mono text-sm">No Video Available</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mobile Fullscreen Video Overlay ────────────────────────────── */}
      {mobileVideo && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setMobileVideo(null)}
        >
          <div 
            className="w-full max-w-md flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setMobileVideo(null)}
              className="self-start flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white active:scale-90 transition-transform shadow-lg text-sm font-medium"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
              <iframe
                src={`${mobileVideo}?autoplay=1&mute=0&rel=0&controls=1&modestbranding=1&vq=hd1080&hd=1&iv_load_policy=3&fs=1`}
                title="Mobile Demo Video"
                className="absolute inset-0 w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
    </div>
  );
}
