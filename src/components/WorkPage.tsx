import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Github, Store } from 'lucide-react';
import portfolioData from '../data/portfolio.json';
import { navigate } from '../utils/navigation';
import { useFocusTrap } from '../lib/focus-trap';

const pad = (value: number) => String(value).padStart(2, '0');
const slugify = (title: string) => title.toLowerCase().replace(/\s+/g, '-');

interface WorkPageProps {
  slug: string;
  onClose: () => void;
}

const ghostPill =
  'flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-white transition-all duration-300 hover:bg-white hover:text-black active:scale-95';

/**
 * Full-screen case-study view rendered as an overlay route (/work/:slug).
 * Desktop shows the entire project in one viewport: identity on the left,
 * media on the right, navigation pinned to the bottom rail.
 */
export default function WorkPage({ slug, onClose }: WorkPageProps) {
  const projects = portfolioData.projects;
  const index = Math.max(0, projects.findIndex((p) => slugify(p.title) === slug));
  const project = projects[index];
  const trapRef = useFocusTrap<HTMLDivElement>(Boolean(project));

  /* Lock the page behind the overlay + close on Escape */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  /* Reset inner scroll when hopping between case studies */
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [slug]);

  if (!project) return null;

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  const ghMatch = project.github.match(/github\.com\/([^/]+)\/([^/#?]+)/);
  const cover = ghMatch
    ? `https://opengraph.githubassets.com/1/${ghMatch[1]}/${ghMatch[2]}`
    : null;

  return (
    <div
      ref={trapRef}
      data-lenis-prevent
      className="fixed inset-0 z-[90] flex h-[100dvh] flex-col bg-[#030303] text-white"
    >
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-white/[0.08]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <button
            type="button"
            onClick={onClose}
            data-cursor="Back"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-white/70 transition-all duration-300 hover:bg-white hover:text-black active:scale-95"
          >
            <ArrowLeft size={13} />
            All work
          </button>
          <p className="font-mono text-xs tracking-widest text-white/40" aria-live="polite">
            {pad(index + 1)} / {pad(projects.length)}
          </p>
        </div>
      </header>

      {/* ── Main — single viewport on desktop, scrollable on mobile ── */}
      <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto md:overflow-hidden">
        <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-8 md:grid-cols-12 md:gap-10 md:px-12 md:py-4">
          {/* Identity */}
          <div className="md:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
              Project {pad(index + 1)} — {project.category ?? project.tech[0]}
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.2rem,4.6vw,4.4rem)] font-medium uppercase leading-[0.98] tracking-tight text-gradient">
              {project.title}
            </h1>
            <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-white/60 md:text-base lg:line-clamp-5">
              {project.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {project.github !== '#' && (
                <a href={project.github} target="_blank" rel="noreferrer" data-cursor="GitHub" className={ghostPill}>
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
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-all duration-300 hover:bg-white/90 active:scale-95"
                >
                  Live Site
                  <ExternalLink size={13} />
                </a>
              )}
              {project.msStore && project.msStore !== '#' && (
                <a href={project.msStore} target="_blank" rel="noreferrer" data-cursor="Microsoft Store" className={ghostPill}>
                  <Store size={14} />
                  Microsoft Store
                </a>
              )}
            </div>
          </div>

          {/* Media + stack */}
          <div className="md:col-span-7">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-black shadow-[0_32px_90px_rgba(0,0,0,0.55)]">
              {project.clip ? (
                <video
                  src={project.clip}
                  poster={project.poster}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={`absolute inset-0 h-full w-full ${
                    index === projects.findIndex((p) => p.title === 'Buddy')
                      ? 'object-contain'
                      : 'object-cover'
                  }`}
                />
              ) : cover ? (
                <img
                  src={cover}
                  alt={`${project.title} — GitHub repository preview`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-xs uppercase tracking-widest text-white/30">
                    No media available
                  </span>
                </div>
              )}
            </div>

            {/* Stack chips ride along under the media */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
                Stack
              </span>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Bottom rail — previous / next ───────────────────────────── */}
      <footer className="shrink-0 border-t border-white/[0.08]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 divide-x divide-white/[0.08] px-6 md:px-12">
          <button
            type="button"
            onClick={() => navigate(`/work/${slugify(prev.title)}`)}
            data-cursor="Previous Project"
            className="group flex items-center gap-3 py-4 pr-4 text-left"
          >
            <ArrowLeft size={15} className="shrink-0 text-white/35 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-white" />
            <span className="min-w-0">
              <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">
                Previous
              </span>
              <span className="block truncate font-display text-sm font-medium uppercase tracking-tight text-white/75 transition-colors group-hover:text-white">
                {prev.title}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/work/${slugify(next.title)}`)}
            data-cursor="Next Project"
            className="group flex items-center justify-end gap-3 py-4 pl-4 text-right"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-white/35">
                Next
              </span>
              <span className="block truncate font-display text-sm font-medium uppercase tracking-tight text-white/75 transition-colors group-hover:text-white">
                {next.title}
              </span>
            </span>
            <ArrowRight size={15} className="shrink-0 text-white/35 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
          </button>
        </div>
      </footer>
    </div>
  );
}
