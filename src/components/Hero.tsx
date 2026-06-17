import { useRef } from 'react';
import portfolioData from '../data/portfolio.json';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
import { ScrambleText } from './ui/ScrambleText';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Hero() {
  const container = useRef<HTMLElement>(null);

  /* ── Entrance animation ───────────────────────────────────────────────── */
  useGSAP(() => {
    const tl = gsap.timeline();

    // Reset initial states for elements to prevent FOUC
    gsap.set('.hero-badge', { autoAlpha: 0, y: 30 });
    gsap.set('.hero-title-1', { autoAlpha: 0, y: 30 });
    gsap.set('.hero-title-2', { autoAlpha: 0, y: 30 });
    gsap.set('.hero-buttons', { autoAlpha: 0, x: -20 });
    gsap.set('.hero-panel', { autoAlpha: 0, y: 30 });

    tl.to('.hero-badge', {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: 'power4.out',
    })
      .to('.hero-title-1', {
        autoAlpha: 1,
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
      }, '-=0.8')
      .to('.hero-title-2', {
        autoAlpha: 1,
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
      }, '-=1.0')
      .to('.hero-buttons', {
        autoAlpha: 1,
        x: 0,
        duration: 1,
        ease: 'power4.out',
      }, '-=0.9')
      .to('.hero-panel', {
        autoAlpha: 1,
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
      }, '-=0.8');

    // Gentle idle float on the badge (like clouds drifting in the reference scene)
    // Starts after the entrance completes, loops forever
    tl.to('.hero-badge', {
      y: -6,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    }, '+=0.2');

  }, { scope: container });

  /* ── Scroll-driven parallax (mirrors the mountain-layer reference) ──────
   *  All tweens at position 0 in the timeline — they all start together as
   *  the user scrolls. Different y displacements create the depth illusion:
   *    badge (background)  → slow
   *    titles              → medium
   *    panel (foreground)  → fast + scale + fade
   *
   *  immediateRender: false is required on the fromVars so the start values
   *  are NOT applied the instant the ScrollTrigger is created — which would
   *  fight the entrance animation above (GSAP best practice for stacked fromTo).
   * ───────────────────────────────────────────────────────────────────────── */
  useGSAP(() => {
    let mm = gsap.matchMedia();

    // Only apply heavy parallax on tablet/desktop to avoid mobile lag
    mm.add('(min-width: 768px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top top',
          end: '+=680',
          scrub: 1.2,   // 1.2s lag for silky smooth parallax catch-up
        },
      });

      // ── Layer 1 — Badge (furthest back, slowest) ──────────────────────────
      tl.fromTo('.hero-badge-wrapper',
        { y: 0, autoAlpha: 1, scale: 1, immediateRender: false },
        { y: -45, autoAlpha: 0.15, scale: 0.92, ease: 'none', force3D: true },
        0
      );

      // ── Layer 2 — Name line 1 "Deepender" (mid-ground) ───────────────────
      tl.fromTo('.hero-title-1-wrapper',
        { y: 0, xPercent: 0, immediateRender: false },
        { y: -85, xPercent: -1.5, ease: 'none', force3D: true },
        0
      );

      // ── Layer 3 — Name line 2 "Yadav." (slightly faster, drifts right) ───
      tl.fromTo('.hero-title-2-wrapper',
        { y: 0, xPercent: 0, immediateRender: false },
        { y: -120, xPercent: 1.5, ease: 'none', force3D: true },
        0
      );

      // ── Layer 4 — Buttons (mid-foreground, fades out quickly) ─────────────
      tl.fromTo('.hero-buttons-wrapper',
        { y: 0, autoAlpha: 1, immediateRender: false },
        { y: -75, autoAlpha: 0, ease: 'none', force3D: true },
        0
      );

      // ── Layer 5 — Glass panel (foreground, fastest + shrinks away) ────────
      tl.fromTo('.hero-panel-wrapper',
        { y: 0, autoAlpha: 1, scale: 1, immediateRender: false },
        { y: -210, autoAlpha: 0, scale: 0.95, ease: 'none', force3D: true },
        0
      );
    });

  }, { scope: container });

  return (
    <section ref={container} className="min-h-screen flex items-center pt-32 px-6 md:px-12 max-w-7xl mx-auto relative">
      <div className="w-full relative z-10 flex flex-col gap-12">

        {/* Top Section: Heading & Buttons (Left) */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">

          {/* Left Side */}
          <div>
            <div className="hero-badge-wrapper will-change-transform">
              <div className="hero-badge inline-flex items-center gap-3 glass-pill px-4 py-2 rounded-full mb-8 will-change-transform">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="font-mono text-xs text-white/80 uppercase tracking-widest">
                  {portfolioData.hero.badgeText}
                </p>
              </div>
            </div>

            <div>
              <div className="hero-title-1-wrapper will-change-transform">
                <h1 className="hero-title-1 text-5xl md:text-7xl lg:text-[7rem] font-display font-medium tracking-tighter leading-[1.05] will-change-transform">
                  <ScrambleText text={portfolioData.hero.titleLine1} delay={300} className="text-gradient" />
                </h1>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mt-2">
                <div className="hero-title-2-wrapper will-change-transform">
                  <span className="block hero-title-2 text-5xl md:text-7xl lg:text-[7rem] font-display font-medium tracking-tighter leading-[1.05] italic font-light text-white/60 will-change-transform">
                    <ScrambleText text={portfolioData.hero.titleLine2} delay={1500} />
                  </span>
                </div>

                <div className="hero-buttons-wrapper will-change-transform">
                  <div className="hero-buttons flex flex-wrap items-center gap-4 mt-4 md:mt-0 will-change-transform">
                    <a
                      href="#projects"
                      className="group flex items-center gap-3 bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-full text-sm md:text-base font-medium hover:bg-white/90 transition-all hover:scale-105 active:scale-95 tracking-normal font-sans"
                    >
                      View Projects
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                    <div className="flex items-center gap-3 md:gap-4">
                      {[
                        { icon: Github, href: portfolioData.hero.social.github },
                        { icon: Linkedin, href: portfolioData.hero.social.linkedin },
                        { icon: Mail, href: portfolioData.hero.social.email }
                      ].map((social, i) => (
                        <a
                          key={i}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          className="glass-pill p-3 md:p-4 rounded-full text-white/60 hover:text-white hover:scale-110 transition-all"
                        >
                          <social.icon size={20} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Wide Text Panel */}
        <div className="hero-panel-wrapper w-full will-change-transform">
          <div className="hero-panel w-full glass-panel p-8 md:p-12 rounded-[2rem] relative overflow-hidden will-change-transform">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed">
                {portfolioData.hero.description1}
              </p>
              <p className="text-base md:text-lg text-white/50 font-light leading-relaxed">
                {portfolioData.hero.description2}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
