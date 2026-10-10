import { useState, useRef, useEffect, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { GitHubActivity } from './GitHubActivity';

export interface SocialProfile {
  name: string;
  username: string;
  headline: string;
  subheadline?: string;
  location: string;
  bio?: string;
  avatarUrl?: string;
  links: {
    github?: string;
    linkedin?: string;
    x?: string;
    email?: string;
  };
}

export interface BannerColors {
  github?: string[];
  linkedin?: string[];
  x?: string[];
  email?: string[];
}

export interface SocialPreviewDockProps {
  profile: SocialProfile;
  email?: string;
  bannerColors?: BannerColors;
  className?: string;
}

type ActiveTab = 'github' | 'linkedin' | 'email' | null;

export function SocialPreviewDock({
  profile,
  email = profile.links.email || 'yadavdeepender65@gmail.com',
  className = '',
}: SocialPreviewDockProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [copied, setCopied] = useState(false);
  const closeTimer = useRef<number | null>(null);
  /* How the popover was opened: pointer-opened popovers follow the pointer,
     keyboard-opened ones follow focus */
  const openedBy = useRef<'pointer' | 'focus'>('pointer');
  /* Last known pointer position — survives the listener re-subscribing on tab switch */
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef(new Map<Exclude<ActiveTab, null>, HTMLElement>());
  /* Horizontal distance from the dock's centre to the active icon's centre */
  const [arrowOffset, setArrowOffset] = useState(0);

  const cleanEmail = email.replace(/^mailto:/, '');
  const username = profile.username || 'Deepender25';
  const liveAvatarUrl = `https://github.com/${username}.png`;
  const fallbackAvatarUrl = profile.avatarUrl || '/images/deepender-avatar.jpg';

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  /* At most one pending close — a second request never orphans the first */
  const scheduleClose = () => {
    if (closeTimer.current) return;
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setActiveTab(null);
    }, 150);
  };

  const closeNow = () => {
    cancelClose();
    setActiveTab(null);
  };

  const open = (tab: Exclude<ActiveTab, null>, source: 'pointer' | 'focus') => {
    cancelClose();
    openedBy.current = source;
    const dock = dockRef.current?.getBoundingClientRect();
    const icon = iconRefs.current.get(tab)?.getBoundingClientRect();
    if (dock && icon) {
      setArrowOffset(icon.left + icon.width / 2 - (dock.left + dock.width / 2));
    }
    setActiveTab(tab);
  };

  const copyEmail = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(cleanEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  useEffect(() => cancelClose, []);

  /* While open, watch for every way the pointer can stop being over the dock
     without a mouseleave: scrolling it away, leaving or minimising the window,
     switching tabs, or tapping elsewhere on touch screens. */
  useEffect(() => {
    if (!activeTab) return;
    const dock = dockRef.current;
    if (!dock) return;

    const isInside = (node: EventTarget | null) => node instanceof Node && dock.contains(node);

    const onPointerMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      if (openedBy.current !== 'pointer') return;
      if (isInside(event.target)) cancelClose();
      else scheduleClose();
    };
    const onScroll = () => {
      const at = pointer.current;
      if (openedBy.current !== 'pointer' || !at) return;
      if (!isInside(document.elementFromPoint(at.x, at.y))) scheduleClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!isInside(event.target)) closeNow();
    };
    const onWindowOut = (event: MouseEvent) => {
      if (!event.relatedTarget && openedBy.current === 'pointer') closeNow();
    };
    const onHidden = () => {
      if (document.hidden) closeNow();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeNow();
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('mouseout', onWindowOut);
    window.addEventListener('blur', closeNow);
    document.addEventListener('visibilitychange', onHidden);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseout', onWindowOut);
      window.removeEventListener('blur', closeNow);
      document.removeEventListener('visibilitychange', onHidden);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [activeTab]);

  const items = [
    {
      id: 'github' as const,
      label: 'GitHub',
      icon: Github,
      href: profile.links.github || `https://github.com/${username}`,
      enabled: Boolean(profile.links.github),
    },
    {
      id: 'linkedin' as const,
      label: 'LinkedIn',
      icon: Linkedin,
      href: profile.links.linkedin || `https://www.linkedin.com/in/${username.toLowerCase()}/`,
      enabled: Boolean(profile.links.linkedin),
    },
    {
      id: 'email' as const,
      label: 'Email',
      icon: Mail,
      href: profile.links.email?.startsWith('mailto:')
        ? profile.links.email
        : `mailto:${cleanEmail}`,
      enabled: Boolean(email),
    },
  ].filter((item) => item.enabled);

  return (
    <div
      ref={dockRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseLeave={() => {
        if (openedBy.current === 'pointer') scheduleClose();
      }}
    >
      {/* ── Popover Preview Card ─────────────────────────────────────── */}
      <AnimatePresence>
        {activeTab && (
          /* One popover shell for all tabs: it opens/closes once, and only the
             content cross-fades when moving between icons */
          <motion.div
            key="popover"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            /* Bottom padding (not margin) bridges the gap above the icons, so the
               pointer never "leaves" the dock on its way up to the card */
            className="absolute bottom-full pb-3.5 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
            {/* ── 1. GITHUB CARD (Rich Activity Graph with Bottom Info) ── */}
            {activeTab === 'github' && (
              <div className="relative">
                <GitHubActivity
                  username={username}
                  avatarUrl={liveAvatarUrl}
                  showMonths={true}
                  months={10}
                  cellSize={8}
                />
              </div>
            )}

            {/* ── 2. LINKEDIN CARD ───────────────────────────────────── */}
            {activeTab === 'linkedin' && (
              <div className="relative rounded-2xl border border-white/[0.12] bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] overflow-hidden text-white">
                <a
                  href={profile.links.linkedin || `https://www.linkedin.com/in/${username.toLowerCase()}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 sm:p-5 w-[310px] sm:w-[340px] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={liveAvatarUrl}
                      onError={(e) => {
                        e.currentTarget.src = fallbackAvatarUrl;
                      }}
                      alt={profile.name}
                      className="w-9 h-9 rounded-full object-cover object-top border border-white/20 bg-zinc-800 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-sans font-semibold text-sm text-white tracking-tight group-hover:text-sky-400 transition-colors truncate">
                          {profile.name}
                        </h4>
                        <ExternalLink size={12} className="text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
                      </div>
                      <p className="text-xs text-white/50 font-light truncate mt-0.5">
                        {profile.headline}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/50 font-light">
                    <span className="truncate">Gurugram, India</span>
                    <span className="text-sky-400/90 font-medium font-mono text-[11px] group-hover:underline">
                      Connect ↗
                    </span>
                  </div>
                </a>
              </div>
            )}

            {/* ── 3. EMAIL CARD ──────────────────────────────────────── */}
            {activeTab === 'email' && (
              <div className="relative rounded-2xl border border-white/[0.12] bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] overflow-hidden text-white">
                <div className="p-4 sm:p-5 w-[300px] sm:w-[330px]">
                  <p className="font-mono text-xs sm:text-[13px] text-white/90 select-all font-medium break-all">
                    {cleanEmail}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-white hover:text-black transition-all active:scale-95"
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={`mailto:${cleanEmail}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition-all active:scale-95"
                    >
                      <Send size={12} />
                      <span>Send Mail</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
            </motion.div>
            </AnimatePresence>

            {/* Arrow tracks the hovered icon instead of the dock's centre.
                The slide and the 45° turn live on separate elements so the
                slide isn't applied along the rotated axis. */}
            <motion.div
              aria-hidden
              initial={false}
              animate={{ x: arrowOffset }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-1 left-1/2 -ml-[5px] w-2.5 h-2.5"
            >
              <div className="h-full w-full rotate-45 border-r border-b border-white/[0.12] bg-[#0c0c0e]" />
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dock Buttons Bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              ref={(node: HTMLDivElement | null) => {
                if (node) iconRefs.current.set(item.id, node);
                else iconRefs.current.delete(item.id);
              }}
              className="relative"
              onMouseEnter={(event: MouseEvent) => {
                pointer.current = { x: event.clientX, y: event.clientY };
                open(item.id, 'pointer');
              }}
            >
              <a
                href={item.href}
                target={item.id === 'email' ? undefined : '_blank'}
                rel={item.id === 'email' ? undefined : 'noreferrer'}
                onFocus={(event) => {
                  // Keyboard focus only. Mouse clicks also focus the link, and the
                  // browser re-focuses it when the window is restored — neither
                  // should pop the card open with no pointer over it.
                  if (event.currentTarget.matches(':focus-visible')) open(item.id, 'focus');
                }}
                onBlur={(event) => {
                  // Tabbing between icons or into the card keeps it open
                  const next = event.relatedTarget;
                  const stillInside = next instanceof Node && dockRef.current?.contains(next);
                  if (openedBy.current === 'focus' && !stillInside) scheduleClose();
                }}
                className={`relative flex items-center justify-center p-3 md:p-3.5 rounded-full transition-all duration-300 border ${
                  isActive
                    ? 'bg-white text-black border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                    : 'glass-pill text-white/70 hover:text-white hover:border-white/30 hover:scale-105'
                }`}
                aria-label={`Open ${item.label}`}
              >
                <Icon size={19} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SocialPreviewDock;
