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
  const timeoutRef = useRef<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef(new Map<Exclude<ActiveTab, null>, HTMLElement>());
  /* Horizontal distance from the dock's centre to the active icon's centre */
  const [arrowOffset, setArrowOffset] = useState(0);

  const cleanEmail = email.replace(/^mailto:/, '');
  const username = profile.username || 'Deepender25';
  const liveAvatarUrl = `https://github.com/${username}.png`;
  const fallbackAvatarUrl = profile.avatarUrl || '/Deepender.jpg';

  const handleMouseEnter = (tab: ActiveTab) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const dock = dockRef.current?.getBoundingClientRect();
    const icon = tab ? iconRefs.current.get(tab)?.getBoundingClientRect() : undefined;
    if (dock && icon) {
      setArrowOffset(icon.left + icon.width / 2 - (dock.left + dock.width / 2));
    }
    setActiveTab(tab);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setActiveTab(null);
    }, 150);
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

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
      onMouseLeave={handleMouseLeave}
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
            onMouseEnter={() => handleMouseEnter(activeTab)}
            onMouseLeave={handleMouseLeave}
            className="absolute bottom-full mb-3.5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
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
              onMouseEnter={() => handleMouseEnter(item.id)}
            >
              <a
                href={item.href}
                target={item.id === 'email' ? undefined : '_blank'}
                rel={item.id === 'email' ? undefined : 'noreferrer'}
                onFocus={() => handleMouseEnter(item.id)}
                onBlur={handleMouseLeave}
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
