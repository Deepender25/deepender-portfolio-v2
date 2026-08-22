import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import portfolioData from '../data/portfolio.json';
import { ArrowUpRight, ExternalLink, Github, Play, Star, Store, X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { navigate } from '../utils/navigation';
import { useFocusTrap } from '../lib/focus-trap';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pad = (value: number) => String(value).padStart(2, '0');

interface ProjectRow {
  title: string;
  category?: string;
  description: string;
  tech: string[];
  github: string;
  live: string;
  clip?: string;
  poster?: string;
  msStore?: string;
  showStars?: boolean;
}

const ghostPill =
  'flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-black active:scale-95';

/* Live GitHub star count — fetched at view-time, refreshed every 10 min */
function GithubStars({ repo, href }: { repo: string; href: string }) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(`https://api.github.com/repos/${repo}`, {
        headers: { Accept: 'application/vnd.github+json' },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data && typeof data.stargazers_count === 'number') {
            setStars(data.stargazers_count);
          }
        })
        .catch(() => {});
    };
    load();
    const id = window.setInterval(load, 600_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [repo]);

  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label="GitHub stars" className={ghostPill}>
      <Star size={13} className="fill-current opacity-80" />
      <span>{stars === null ? '···' : `${stars.toLocaleString('en-US')} Stars`}</span>
    </a>
  );
}

interface LightboxTarget {
  src: string;
  title: string;
}

/* Cover image with graceful source-by-source fallback */
function Cover({ sources, alt }: { sources: string[]; alt: string }) {
  const [step, setStep] = useState(0);
  if (!sources.length) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/[0.03]">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          Demo Coming Soon
        </span>
      </div>
    );
  }
  return (
    <img
      src={sources[Math.min(step, sources.length - 1)]}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setStep((prev) => (prev < sources.length - 1 ? prev + 1 : prev))}
      className={`absolute inset-0 h-full w-full object-cover ${step === sources.length - 1 && step > 0 ? 'scale-[1.6]' : ''}`}
    />
  );
}

export default function Projects() {
  const container = useRef<HTMLElement>(null);
  const projects: ProjectRow[] = portfolioData.projects;
  const [streaming, setStreaming] = useState<ReadonlySet<number>>(new Set());
  const [portrait, setPortrait] = useState<ReadonlySet<number>>(new Set());
  const [lightbox, setLightbox] = useState<LightboxTarget | null>(null);
  const lightboxTrapRef = useFocusTrap<HTMLDivElement>(Boolean(lightbox));

  const markPortrait = (index: number) => {
    setPortrait((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  /* ── Lazy stream: mount each inline player once its row nears viewport ── */
  useEffect(() => {
    const stage = container.current;
    if (!stage) return;
    const targets = stage.querySelectorAll<HTMLElement>('[data-media-index]');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setStreaming((prev) => {
          let changed = false;
          const next = new Set(prev);
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = Number((entry.target as HTMLElement).dataset.mediaIndex);
              if (!next.has(idx)) {
                next.add(idx);
                changed = true;
              }
            }
          });
          return changed ? next : prev;
        });
      },
      { rootMargin: '700px 0px' },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Lightbox: escape to close + body scroll lock ─────────────────────── */
  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  /* ── Scroll choreography — quiet editorial reveals ────────────────────── */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.work-header > *',
          { y: 34, opacity: 0 },
          {
            scrollTrigger: { trigger: container.current, start: 'top 85%' },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
          },
        );

        gsap.utils.toArray<HTMLElement>('.work-item').forEach((item) => {
          gsap.fromTo(
            item.querySelectorAll('.row-reveal'),
            { y: 28, opacity: 0 },
            {
              scrollTrigger: { trigger: item, start: 'top 86%' },
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.07,
              ease: 'power3.out',
            },
          );
        });
      });
    },
    { scope: container },
  );

  return (
    <section id="projects" ref={container} className="relative z-10 w-full">
      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto pt-[6vh] pb-[8vh]">
        <div className="work-header">
          <div className="flex items-baseline justify-between border-b border-white/[0.08] pb-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Selected work</span>
          </div>

          <h2 className="mt-10 font-display uppercase font-light leading-[0.92] tracking-[-0.04em] text-[clamp(2.8rem,9vw,9rem)] text-white">
            Things I've<br />put into<br /><span className="font-medium">the world.</span>
          </h2>

          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">{projects.length} projects</span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">AI / ML / Full-Stack / HCI</span>
          </div>
        </div>
      </div>

      {/* ── Work list ──────────────────────────────────────────────────── */}
      <div>
        {projects.map((project, index) => {
          const clip = project.clip ?? '';
          const poster = project.poster ?? '';
          const hasClip = Boolean(clip);
          const ghMatch = project.github.match(/github\.com\/([^/]+)\/([^/#?]+)/);
          const coverSources = poster
            ? [poster]
            : ghMatch
              ? [`https://opengraph.githubassets.com/1/${ghMatch[1]}/${ghMatch[2]}`]
              : [];

          return (
            <article key={project.title} className="work-item group relative border-t border-white/[0.08] last:border-b">
              <div className="relative grid grid-cols-1 items-center gap-x-8 gap-y-8 px-6 md:px-12 py-12 md:py-16 max-w-7xl mx-auto md:grid-cols-12">
                {/* Ghost numeral — anchored in the padding gutter, out of the grid flow */}
                <span
                  aria-hidden
                  className="row-reveal pointer-events-none absolute left-2 top-1/2 hidden -translate-y-1/2 select-none font-display font-light leading-none tracking-[-0.05em] text-white/[0.09] text-[clamp(3.5rem,6.5vw,6rem)] lg:block"
                >
                  {pad(index + 1)}
                </span>

                {/* Text block */}
                <div className="col-span-1 flex flex-col items-start gap-4 md:col-span-7 lg:pl-14 xl:pl-20">
                  <h3 className="row-reveal font-display font-medium uppercase tracking-[-0.03em] leading-none transition-transform duration-300 group-hover:translate-x-1 text-[clamp(1.9rem,3.6vw,3.4rem)]">
                    <a
                      href={`/work/${project.title.toLowerCase().replace(/\s+/g, '-')}`}
                      data-cursor="Case Study"
                      onClick={(event) => {
                        event.preventDefault();
                        navigate(`/work/${project.title.toLowerCase().replace(/\s+/g, '-')}`);
                      }}
                      className="text-white hover:text-white/90 focus-visible:outline-none"
                    >
                      {project.title}
                    </a>
                  </h3>

                  <p className="row-reveal max-w-xl text-base font-light leading-relaxed text-white/55">
                    {project.description}
                  </p>

                  <div className="row-reveal flex flex-wrap items-center gap-x-3 gap-y-2">
                    {[project.category ?? project.tech[0], project.tech[0]].filter(Boolean).map((part, i, arr) => (
                      <span key={i} className="flex items-center gap-x-3">
                        {i > 0 && i <= arr.length && <span aria-hidden className="text-white/20">·</span>}
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">{part}</span>
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="row-reveal flex flex-wrap items-center gap-3 pt-2">
                    {project.github !== '#' && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="Source"
                        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-black active:scale-95"
                      >
                        <Github size={14} />
                        Source Code
                      </a>
                    )}
                    {project.live !== '#' && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="Visit Site"
                        className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-wider font-medium text-black transition-all duration-300 hover:bg-white/90 hover:scale-[1.03] active:scale-95"
                      >
                        Live Site
                        <ArrowUpRight size={13} />
                      </a>
                    )}
                    {project.msStore && project.msStore !== '#' && (
                      <a href={project.msStore} target="_blank" rel="noreferrer" className={ghostPill}>
                        <Store size={14} />
                        Microsoft Store
                      </a>
                    )}
                    {project.showStars && project.github !== '#' && (
                      <GithubStars
                        repo={project.github.replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, '')}
                        href={`${project.github}/stargazers`}
                      />
                    )}
                  </div>
                </div>

                {/* Playing video — click for semi-fullscreen */}
                <button
                  type="button"
                  data-media-index={index}
                  data-cursor={hasClip ? 'Play Demo' : 'View Source'}
                  onClick={() => {
                    if (hasClip) setLightbox({ src: clip, title: project.title });
                    else window.open(project.github, '_blank', 'noopener,noreferrer');
                  }}
                  aria-label={hasClip ? `Play ${project.title} demo video` : `Open ${project.title} on GitHub`}
                  className="group/media relative col-span-1 block aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40 md:col-span-5"
                >
                  <div className="absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/media:scale-[1.02]">
                    <Cover sources={coverSources} alt={`${project.title} cover`} />

                    {hasClip && streaming.has(index) && (
                      portrait.has(index) ? (
                        <>
                          {/* Blurred self-fill backdrop for vertical footage */}
                          <video
                            src={clip}
                            poster={poster || undefined}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            disablePictureInPicture
                            aria-hidden
                            tabIndex={-1}
                            onLoadedMetadata={(event) => {
                              const el = event.currentTarget;
                              if (el.videoHeight > el.videoWidth) markPortrait(index);
                            }}
                            className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl brightness-[0.55]"
                          />
                          <video
                            src={clip}
                            poster={poster || undefined}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            disablePictureInPicture
                            onLoadedMetadata={(event) => {
                              const el = event.currentTarget;
                              if (el.videoHeight > el.videoWidth) markPortrait(index);
                            }}
                            className="absolute inset-0 h-full w-full object-contain"
                          />
                        </>
                      ) : (
                        <video
                          src={clip}
                          poster={poster || undefined}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          disablePictureInPicture
                          onLoadedMetadata={(event) => {
                            const el = event.currentTarget;
                            if (el.videoHeight > el.videoWidth) markPortrait(index);
                          }}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                       )
                     )}
                   </div>

                  {/* Click-to-expand affordance */}
                  {hasClip && (
                    <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80 opacity-90 backdrop-blur-md transition-opacity duration-300 group-hover/media:opacity-100">
                      <Play size={11} />
                      Expand
                    </span>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Semi-fullscreen player ─────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md md:p-10"
          >
            <motion.div
              ref={lightboxTrapRef}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="glass-panel-strong relative w-full max-w-5xl overflow-hidden rounded-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                  {lightbox.title} — Demo
                </p>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  data-cursor="Close"
                  aria-label="Close video"
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition-all duration-300 hover:bg-white/15 hover:text-white active:scale-90"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                <video
                  key={lightbox.src}
                  src={lightbox.src}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full bg-black"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
