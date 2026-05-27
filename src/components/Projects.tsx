import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Github, ExternalLink, ArrowLeft, ArrowRight,
  Bot, Newspaper, FileText, MonitorPlay, CalendarCheck,
  Subtitles, Scissors, MessageSquare, MousePointer2,
} from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ─────────────────────────── Data ─────────────────────────────────────── */
const featuredProjects = [
  {
    title: 'Readme Architect AI',
    description: 'SaaS app generating professional GitHub READMEs with Google Gemini AI. Shipped GitHub OAuth, private repo support, JWT auth, dynamic sitemap, and Google Analytics.',
    tech: ['Next.js', 'TypeScript', 'Gemini API', 'PostgreSQL', 'Tailwind'],
    github: 'https://github.com/Deepender25/Readme-Architect-AI',
    live: 'https://readmearchitect.vercel.app',
    video: 'https://www.youtube.com/embed/7Xc5ZwdG3RM',
    icon: FileText,
  },
  {
    title: 'Campus Chatbot',
    description: 'AI-powered multilingual chatbot for campus information. Features Gemini LLM, dynamic knowledge base, Telegram/web interfaces, and a secure admin dashboard.',
    tech: ['Next.js', 'React', 'Flask', 'Python', 'Supabase', 'ChromaDB', 'Gemini API', 'LangChain'],
    github: 'https://github.com/Deepender25/Campus_Chatbot',
    live: '#',
    video: 'https://www.youtube.com/embed/MzEFeIRJ0eQ',
    icon: MessageSquare,
  },
  {
    title: 'CursorViaCam',
    description: 'AI-powered head tracking mouse control system for hands-free computer interaction — designed to assist users with motor impairments.',
    tech: ['Python', 'PyQt6', 'OpenCV', 'Mediapipe', 'PyAutoGUI', 'NumPy', 'Pywin32'],
    github: 'https://github.com/Deepender25/CursorViaCam',
    live: '#',
    video: 'https://www.youtube.com/embed/MzEFeIRJ0eQ',
    icon: MousePointer2,
  },
  {
    title: 'Buddy',
    description: 'AI text assistant for Android — type /fix, /formal, /reply or any custom trigger at the end of text in any app, and Buddy rewrites it instantly using Gemini.',
    tech: ['Kotlin', 'Python', 'Jetpack Compose', 'Coroutines', 'AES-256-GCM'],
    github: 'https://github.com/Deepender25/Buddy',
    live: '#',
    video: 'https://www.youtube.com/embed/MzEFeIRJ0eQ',
    icon: Bot,
  },
  {
    title: 'AI-Attendance',
    description: 'An AI-powered attendance tracker that turns uploaded schedules into a beautiful, interactive dashboard for managing your classes.',
    tech: ['React 19', 'TypeScript', 'Tailwind', 'Express.js', 'Gemini API', 'Python'],
    github: 'https://github.com/Deepender25/AI-Attendance',
    live: 'https://attendsight.vercel.app/login',
    video: 'https://www.youtube.com/embed/MzEFeIRJ0eQ',
    icon: CalendarCheck,
  },
  {
    title: 'Presenta',
    description: 'Create stunning video mockups and screenshots with professional device frames and smooth scrolling animations directly in your browser.',
    tech: ['Python', 'FastAPI', 'Vanilla JS', 'HTML5 Canvas', 'Vercel'],
    github: 'https://github.com/Deepender25/Presenta',
    live: 'https://presenta-studio.vercel.app',
    video: 'https://www.youtube.com/embed/MzEFeIRJ0eQ',
    icon: MonitorPlay,
  },
  {
    title: 'AI-news-Automation',
    description: 'Automated AI news aggregator that fetches, summarizes, and emails daily tech briefings using Google Gemini AI and Vercel serverless functions.',
    tech: ['Python', 'Gemini API', 'RSS', 'Web Scraping', 'Vercel'],
    github: 'https://github.com/Deepender25/AI-news-Automation',
    live: '#',
    video: 'https://www.youtube.com/embed/MzEFeIRJ0eQ',
    icon: Newspaper,
  },
  {
    title: 'Video-to-Shorts',
    description: 'Converts long-form videos into short-form content with AI-generated subtitles. Powered by Gemini API for intelligent content analysis and subtitle generation.',
    tech: ['React', 'TypeScript', 'Python', 'Flask', 'Whisper', 'FFmpeg', 'Gemini API'],
    github: 'https://github.com/Deepender25/Video-to-Shorts',
    live: '#',
    video: 'https://www.youtube.com/embed/MzEFeIRJ0eQ',
    icon: Scissors,
  },
  {
    title: 'Sub-Gen',
    description: 'AI-powered video subtitle generation tool that automatically transcribes and generates subtitles using speech-to-text. Supports Hindi and Hinglish.',
    tech: ['React', 'TypeScript', 'Python', 'Flask', 'Whisper', 'FFmpeg', 'Gemini API'],
    github: 'https://github.com/Deepender25/Sub-Gen',
    live: '#',
    video: 'https://www.youtube.com/embed/MzEFeIRJ0eQ',
    icon: Subtitles,
  },
];

const TOTAL = featuredProjects.length;
const SCROLL_PER_CARD = 500; // pixels of scroll per card

/* ─────────── 3-D stack position calculator ───────────────────────────── */
const VISIBLE = 4;          // how many back-cards show
const Z_STEP = -130;
const Y_STEP = -22;
const SC_STEP = 0.055;
const OP_STEP = 0.22;

function pos(stackPos: number) {
  if (stackPos === 0)
    return { z: 0, y: 0, scale: 1, opacity: 1, zIndex: TOTAL, rotationX: 0, rotationY: 0 };
  if (stackPos <= VISIBLE)
    return {
      z: stackPos * Z_STEP, y: stackPos * Y_STEP,
      scale: 1 - stackPos * SC_STEP,
      opacity: Math.max(0, 1 - stackPos * OP_STEP),
      zIndex: TOTAL - stackPos, rotationX: 0, rotationY: 0,
    };
  return {
    z: VISIBLE * Z_STEP, y: VISIBLE * Y_STEP,
    scale: 1 - VISIBLE * SC_STEP, opacity: 0,
    zIndex: 0, rotationX: 0, rotationY: 0,
  };
}

/* ─────────── Word-split title renderer ───────────────────────────────── */
function Title({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.35em] last:mr-0 align-bottom">
          <span className="word-inner inline-block will-change-transform">{word}</span>
        </span>
      ))}
    </>
  );
}

/* ═══════════════════════════ Component ══════════════════════════════════ */
export default function Projects() {
  const container = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  const isAnim = useRef(false);
  const isResetting = useRef(false);  // blocks onUpdate during navbar reset
  const activeRef = useRef(0);      // ground-truth current card index
  const pendingTarget = useRef(0);      // latest desired target from scroll

  const [displayIdx, setDisplayIdx] = useState(0);  // drives pagination + video
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ── Track fullscreen to prevent 3D transform conflicts on exit ─────── */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (active) {
        setIsFullscreen(true);
        document.body.classList.add('video-fullscreen-active');
      } else {
        // Delay restoring 3D transforms to let the browser complete its
        // fullscreen exit layout/animation without iframe reload or jitter.
        setTimeout(() => {
          setIsFullscreen(false);
          document.body.classList.remove('video-fullscreen-active');
        }, 150);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.body.classList.remove('video-fullscreen-active');
    };
  }, []);

  /* ── Load video immediately (next paint) — no spinner wait ──────────── */
  useEffect(() => {
    setVideoUrl(null);
    const { video } = featuredProjects[displayIdx];
    // requestAnimationFrame lets the null render flush (clearing the old iframe)
    // then instantly mounts the new iframe on the very next paint
    const raf = requestAnimationFrame(() => setVideoUrl(video));
    return () => cancelAnimationFrame(raf);
  }, [displayIdx]);

  /* ── Instant reset to card 0 on navbar "Projects" click ─────────────── */
  useEffect(() => {
    const handleReset = () => {
      // Silence ScrollTrigger onUpdate so it can't re-trigger card animations
      // while we scroll the page back to the section top.
      isResetting.current = true;

      // Kill any in-flight GSAP animations on cards
      const c = Array.from(
        deckRef.current?.querySelectorAll<HTMLElement>('.pcard') ?? []
      );
      c.forEach(card => gsap.killTweensOf(card));
      isAnim.current = false;

      // Snap all cards instantly to their initial stack positions (no animation)
      c.forEach((card, i) => gsap.set(card, pos(i)));

      // Show card-0 words immediately (no slide-up animation)
      const first = c[0];
      if (first) {
        gsap.set(first.querySelectorAll('.word-inner'), { y: '0%' });
      }

      // Reset all tracking refs
      activeRef.current = 0;
      pendingTarget.current = 0;

      // Reset React state (clears video, reloads card 0's video)
      setVideoUrl(null);
      setDisplayIdx(0);

      // Use stRef.current.start — the ScrollTrigger instance's own value for
      // "where progress=0 begins (in page px from top)". This is accurate
      // whether the user is coming from above OR below (e.g. Contact section),
      // because it accounts for the pinned spacer that scrollIntoView/offsetTop miss.
      if (stRef.current) {
        window.scrollTo({ top: stRef.current.start, behavior: 'instant' as ScrollBehavior });
      }

      // Re-enable onUpdate after one frame (instant scroll has settled)
      requestAnimationFrame(() => {
        isResetting.current = false;
      });
    };

    window.addEventListener('reset-projects', handleReset);
    return () => window.removeEventListener('reset-projects', handleReset);
  }, []);

  /* ── Card helpers ────────────────────────────────────────────────────── */
  const cards = () =>
    Array.from(deckRef.current?.querySelectorAll<HTMLElement>('.pcard') ?? []);

  const revealWords = (card: HTMLElement) => {
    const words = card.querySelectorAll('.word-inner');
    gsap.fromTo(words,
      { y: '105%' },
      { y: '0%', duration: 0.5, stagger: 0.04, ease: 'power2.out', delay: 0.12 },
    );
  };

  /* ── Advance one card forward ────────────────────────────────────────── */
  const goNext = (onDone?: () => void) => {
    const isFS = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    if (isAnim.current || isFS) return;
    isAnim.current = true;

    const c = cards();
    const cur = activeRef.current;
    const nxt = (cur + 1) % TOTAL;

    // Update display immediately so counter and video react at once
    setVideoUrl(null);
    setDisplayIdx(nxt);

    // Fly current front card out
    gsap.to(c[cur], {
      z: 350, y: 70, scale: 1.06, opacity: 0,
      rotationX: -12, rotationY: 8,
      duration: 0.45, ease: 'power2.inOut',
    });

    // Move every other card to its new position
    for (let i = 0; i < TOTAL; i++) {
      if (i === cur) continue;
      const p = (i - nxt + TOTAL) % TOTAL;
      gsap.to(c[i], { ...pos(p), duration: 0.45, ease: 'power2.inOut' });
      if (p === 0) revealWords(c[i]);
    }

    setTimeout(() => {
      // Park outgoing card silently behind the stack
      gsap.set(c[cur], { ...pos(TOTAL - 1), opacity: 0 });
      activeRef.current = nxt;
      isAnim.current = false;
      onDone?.();
    }, 470);
  };

  /* ── Go one card backward ────────────────────────────────────────────── */
  const goPrev = (onDone?: () => void) => {
    const isFS = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    if (isAnim.current || isFS) return;
    isAnim.current = true;

    const c = cards();
    const cur = activeRef.current;
    const prv = (cur - 1 + TOTAL) % TOTAL;

    // Update display immediately so counter and video react at once
    setVideoUrl(null);
    setDisplayIdx(prv);

    // Pre-position incoming card at the fly-in spot
    gsap.set(c[prv], {
      z: 350, y: 70, scale: 1.06, opacity: 0,
      rotationX: -12, rotationY: 8, zIndex: TOTAL + 1,
    });

    // Animate it in
    gsap.to(c[prv], { ...pos(0), duration: 0.45, ease: 'power2.inOut' });
    revealWords(c[prv]);

    // Push all others one position back
    for (let i = 0; i < TOTAL; i++) {
      if (i === prv) continue;
      const p = (i - prv + TOTAL) % TOTAL;
      gsap.to(c[i], { ...pos(p), duration: 0.45, ease: 'power2.inOut' });
    }

    setTimeout(() => {
      activeRef.current = prv;
      isAnim.current = false;
      onDone?.();
    }, 470);
  };

  /* ── Self-correcting step: always reads the LATEST pendingTarget ref ─── */
  const correctToTarget = () => {
    const cur = activeRef.current;
    const target = pendingTarget.current;
    if (cur === target) return;

    const gap = Math.abs(target - cur);

    if (gap > 1) {
      // Fast scroll: gap is large — animating one card at a time would take
      // gap × 680ms (e.g. 8 cards = 5.4s). Instead, kill all tweens and
      // instantly snap every card to its correct stack position for the target,
      // then update state. No animation — the deck locks to the scroll position.
      const c = cards();
      c.forEach(card => gsap.killTweensOf(card));
      c.forEach((card, i) => {
        const stackPos = (i - target + TOTAL) % TOTAL;
        gsap.set(card, pos(stackPos));
      });
      // Show the new front card's words immediately
      const newFront = c[target];
      if (newFront) {
        gsap.set(newFront.querySelectorAll('.word-inner'), { y: '0%' });
      }
      activeRef.current = target;
      isAnim.current = false;
      setVideoUrl(null);
      setDisplayIdx(target);
      return;
    }

    // gap === 1: single smooth animated transition
    const advance = target > cur ? goNext : goPrev;
    // Pass correctToTarget itself as onDone so chaining always uses latest target
    advance(() => correctToTarget());
  };

  /* ── Stable refs updated each render ────────────────────────────────── */
  const goNextRef = useRef(goNext);
  const goPrevRef = useRef(goPrev);
  const correctRef = useRef(correctToTarget);
  useEffect(() => {
    goNextRef.current = goNext;
    goPrevRef.current = goPrev;
    correctRef.current = correctToTarget;
  });

  /* ── Set initial card positions (once on mount) ──────────────────────── */
  useGSAP(() => {
    cards().forEach((card, i) => gsap.set(card, pos(i)));
    // Reveal words on first card
    const first = deckRef.current?.querySelector<HTMLElement>('.pcard');
    if (first) revealWords(first);
  }, { scope: container });

  /* ── ScrollTrigger: pin + scroll-driven card cycling ────────────────── */
  useGSAP(() => {
    const el = container.current;
    if (!el) return;

    // Dead-zone buffer: user must scroll past BUFFER px before first
    // card transition, and the last card stays pinned for BUFFER px after
    // the final transition — prevents accidental triggers at boundaries.
    const BUFFER = 300;  // px dead zone at each end
    const cardRange = (TOTAL - 1) * SCROLL_PER_CARD;
    const totalScroll = cardRange + 2 * BUFFER;

    stRef.current = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: `+=${totalScroll}`,
      pin: true,
      pinSpacing: true,
      onUpdate(self) {
        // Silenced during navbar-reset to prevent re-animating cards
        if (isResetting.current) return;

        const isFS = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        if (isFS) return;

        // Map raw progress into the card-transition window (excluding buffers)
        const rawPx = self.progress * totalScroll;
        const cardPx = rawPx - BUFFER;
        const cardProgress = Math.max(0, Math.min(1, cardPx / cardRange));
        const rawTarget = Math.round(cardProgress * (TOTAL - 1));

        // Direction-aware: only allow target to move in the direction of scroll.
        // This prevents transient mid-scroll values from reversing the stack.
        if (self.direction >= 0) {
          pendingTarget.current = Math.max(pendingTarget.current, rawTarget);
        } else {
          pendingTarget.current = Math.min(pendingTarget.current, rawTarget);
        }

        if (!isAnim.current && pendingTarget.current !== activeRef.current) {
          correctRef.current();
        }
      },
    });

    return () => {
      stRef.current?.kill();
    };
  }, { scope: container });

  /* ══════════════════════════ Render ════════════════════════════════════ */
  return (
    <section
      id="projects"
      ref={container}
      className="w-full px-6 md:px-12 max-w-7xl mx-auto h-screen flex flex-col"
    >
      {/* Scoped override during video fullscreen to prevent browser iframe reload and exit jitter */}
      {isFullscreen && (
        <style>{`
          body.video-fullscreen-active .pcard {
            transform: none !important;
            transform-style: flat !important;
            will-change: auto !important;
            backface-visibility: visible !important;
            transition: none !important;
          }
          body.video-fullscreen-active .project-deck {
            perspective: none !important;
          }
        `}</style>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-24 pb-8 shrink-0">
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

      {/* ── Deck + Controls ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center select-none min-h-0">

        {/* Perspective wrapper */}
        <div
          ref={deckRef}
          className="project-deck relative w-full flex items-center justify-center"
          style={{
            height: '575px',
            perspective: '1600px',
            perspectiveOrigin: '50% 52%',
          }}
        >
          {featuredProjects.map((project, idx) => {
            const Icon = project.icon;
            const isFront = idx === displayIdx;
            const playing = isFront && videoUrl === project.video;

            return (
              <div
                key={project.title}
                className="pcard absolute inset-x-0 mx-auto w-[1125px] h-[550px] max-md:w-[340px] max-md:h-[600px] rounded-[32px] p-8 glass-panel flex"
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  willChange: 'transform, opacity',
                }}
              >
                <div className="grid grid-cols-12 gap-6 h-full w-full max-md:flex max-md:flex-col">

                  {/* LEFT: details */}
                  <div className="col-span-5 flex flex-col justify-between h-full max-md:flex-grow max-md:h-auto">

                    {/* Icon + links row */}
                    <div className="flex justify-between items-start">
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
                    <div className="flex-grow flex flex-col justify-center my-4">
                      <h3 className="text-[2.3rem] font-display font-semibold tracking-tight leading-tight text-white mb-4">
                        <Title text={project.title} />
                      </h3>
                      <p className="text-white/65 font-light leading-relaxed text-[17px]">
                        {project.description}
                      </p>
                    </div>

                    {/* All tech tags — no truncation */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.tech.map((t, i) => (
                        <span key={i}
                          className="text-[11px] font-mono text-white/45 bg-white/5 border border-white/5 px-3 py-2 rounded-full uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: YouTube player */}
                  <div
                    className="col-span-7 relative rounded-2xl overflow-hidden border border-white/10 bg-black max-md:h-[210px] max-md:shrink-0"
                    style={{ minHeight: 0 }}
                  >
                    {playing ? (
                      <iframe
                        key={project.video}
                        src={`${project.video}?autoplay=1&mute=1&rel=0&controls=1&modestbranding=1&vq=hd1080&hd=1&iv_load_policy=3&fs=1`}
                        title={`${project.title} Demo`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isFront && (
                          <div
                            className="w-10 h-10 rounded-full animate-spin"
                            style={{
                              border: '1.5px solid rgba(255,255,255,0.08)',
                              borderTopColor: 'rgba(255,255,255,0.45)',
                              animationDuration: '1s',
                              animationTimingFunction: 'linear',
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* ── Nav controls ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-8 mt-10 shrink-0">
          <button
            onClick={() => goPrevRef.current()}
            aria-label="Previous project"
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-base font-mono tracking-wider min-w-[80px] text-center">
            <span className="text-white font-semibold">{String(displayIdx + 1).padStart(2, '0')}</span>
            <span className="text-white/20 mx-2">/</span>
            <span className="text-white/45">{String(TOTAL).padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => goNextRef.current()}
            aria-label="Next project"
            className="w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer active:scale-90"
          >
            <ArrowRight size={20} />
          </button>
        </div>

        {/* ── Scroll hint ────────────────────────────────────────────────── */}
        <p className="mt-4 text-[10px] font-mono text-white/20 tracking-[0.2em] uppercase shrink-0">
          Scroll to explore projects
        </p>
      </div>
    </section>
  );
}
