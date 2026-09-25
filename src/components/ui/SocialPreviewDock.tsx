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

export interface SocialProfile {
  name: string;
  username: string;
  headline: string;
  subheadline?: string;
  location: string;
  bio?: string;
  avatarUrl?: string;
  status?: string;
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

interface ContributionDay {
  date?: string;
  count: number;
  level: number;
}

// Generate realistic vibrant default contribution matrix (40 weeks x 7 days)
function getFallbackContributions(): { total: number; days: ContributionDay[] } {
  const pattern = [
    1, 1, 0, 2, 1, 1, 3, 2, 1, 1, 4, 2, 1, 0, 1, 2, 3, 1, 1, 1, 2, 4, 1, 0, 2, 1, 3,
    1, 2, 1, 1, 4, 3, 2, 1, 0, 1, 2, 1, 3, 1, 2, 1, 1, 4, 2, 1, 1, 3, 2, 1, 0, 2, 4,
    1, 1, 3, 2, 1, 0, 1, 1, 2, 3, 1, 4, 2, 1, 1, 2, 0, 3, 4, 1, 2, 1, 1, 2, 3, 1, 1,
  ];

  const totalDays = 40 * 7;
  const days: ContributionDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const level = pattern[i % pattern.length];
    const count = level === 0 ? 0 : level * 3 + (i % 4);
    days.push({ count, level });
  }

  return { total: 2423, days };
}

export function SocialPreviewDock({
  profile,
  email = profile.links.email || 'yadavdeepender65@gmail.com',
  className = '',
}: SocialPreviewDockProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [copied, setCopied] = useState(false);
  const [contributions, setContributions] = useState<{
    total: number;
    days: ContributionDay[];
  }>(getFallbackContributions);
  const timeoutRef = useRef<number | null>(null);

  const cleanEmail = email.replace(/^mailto:/, '');
  const username = profile.username || 'Deepender25';
  // Live GitHub avatar URL (public high-resolution face portrait)
  const liveAvatarUrl = `https://github.com/${username}.png`;
  const fallbackAvatarUrl = profile.avatarUrl || '/Deepender.jpg';

  // Fetch real GitHub contribution stats (all-time total + live active heatmap)
  useEffect(() => {
    let isMounted = true;

    // Fetch both all-time totals and the latest rolling active days
    Promise.all([
      fetch(`https://github-contributions-api.jogruber.de/v4/${username}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
      fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    ]).then(([allData, lastData]) => {
      if (!isMounted) return;

      // 1. Calculate true all-time total from all years
      let totalAllTime = 2423;
      if (allData && allData.total) {
        const sumYears = (Object.values(allData.total) as number[]).reduce<number>(
          (acc, val) => acc + (typeof val === 'number' ? val : 0),
          0
        );
        if (sumYears > 0) totalAllTime = sumYears;
      }

      // 2. Extract recent active heatmap from latest contributions data
      const activeSource: any[] =
        (lastData && lastData.contributions && lastData.contributions.length > 0)
          ? lastData.contributions
          : (allData && allData.contributions && allData.contributions.length > 0)
          ? allData.contributions
          : [];

      if (activeSource.length > 0) {
        // Take the latest ~40 weeks (280 days)
        const recentDays = activeSource.slice(-280).map((d) => ({
          date: d.date,
          count: d.count || 0,
          level:
            typeof d.level === 'number' && d.level > 0
              ? d.level
              : d.count > 10
              ? 4
              : d.count > 5
              ? 3
              : d.count > 0
              ? 1
              : 0,
        }));

        setContributions({
          total: totalAllTime,
          days: recentDays,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [username]);

  const handleMouseEnter = (tab: ActiveTab) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
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

  // Vibrant, high-contrast emerald contribution palette on dark background
  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-500/40 border border-emerald-400/25';
      case 2:
        return 'bg-emerald-500/65 border border-emerald-400/40';
      case 3:
        return 'bg-emerald-400/90 border border-emerald-300/50';
      case 4:
        return 'bg-emerald-300 border border-emerald-200/60 shadow-[0_0_6px_rgba(52,211,153,0.45)]';
      case 0:
      default:
        return 'bg-white/[0.06] border border-white/[0.02]';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Popover Preview Card ─────────────────────────────────────── */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 30,
              mass: 0.5,
            }}
            onMouseEnter={() => handleMouseEnter(activeTab)}
            onMouseLeave={handleMouseLeave}
            className="absolute bottom-full mb-3.5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          >
            <div className="relative rounded-2xl border border-white/[0.12] bg-[#0c0c0e]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] overflow-hidden text-white">
              
              {/* ── 1. GITHUB CARD (Live Avatar + Real Active Heatmap) ── */}
              {activeTab === 'github' && (
                <a
                  href={profile.links.github || `https://github.com/${username}`}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="GitHub"
                  className="block p-4 sm:p-5 w-[320px] sm:w-[350px] hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3.5">
                    <img
                      src={liveAvatarUrl}
                      onError={(e) => {
                        e.currentTarget.src = fallbackAvatarUrl;
                      }}
                      alt={username}
                      className="w-9 h-9 rounded-full object-cover object-top border border-white/20 bg-zinc-800 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-sans font-semibold text-sm text-white tracking-tight group-hover:text-emerald-400 transition-colors truncate">
                        {username}
                      </h4>
                      <p className="text-xs text-white/50 font-light truncate mt-0.5">
                        {contributions.total.toLocaleString()} all-time contributions
                      </p>
                    </div>
                  </div>

                  {/* Heatmap Grid */}
                  <div className="w-full overflow-hidden">
                    <div
                      className="grid grid-rows-7 grid-flow-col gap-[3px] w-fit mx-auto"
                      aria-label="GitHub Contribution Heatmap"
                    >
                      {contributions.days.map((day, idx) => (
                        <div
                          key={idx}
                          title={day.date ? `${day.count} contributions on ${day.date}` : undefined}
                          className={`w-[5px] h-[5px] sm:w-[5.6px] sm:h-[5.6px] rounded-[1.5px] ${getCellColor(
                            day.level
                          )}`}
                        />
                      ))}
                    </div>
                  </div>
                </a>
              )}

              {/* ── 2. LINKEDIN CARD (Live Profile Photo + Clean Details) ── */}
              {activeTab === 'linkedin' && (
                <a
                  href={profile.links.linkedin || `https://www.linkedin.com/in/${username.toLowerCase()}/`}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="LinkedIn"
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
              )}

              {/* ── 3. EMAIL CARD (No Avatar, Minimalist Status & Actions) ─ */}
              {activeTab === 'email' && (
                <div className="p-4 sm:p-5 w-[300px] sm:w-[330px]">
                  <p className="font-mono text-xs sm:text-[13px] text-white/90 select-all font-medium break-all">
                    {cleanEmail}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyEmail}
                      data-cursor="Copy"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-white hover:text-black transition-all active:scale-95"
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={`mailto:${cleanEmail}`}
                      data-cursor="Send Mail"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white text-black text-xs font-medium hover:bg-white/90 transition-all active:scale-95"
                    >
                      <Send size={12} />
                      <span>Send Mail</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Subtle arrow pointer */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-r border-b border-white/[0.12] bg-[#0c0c0e]" />
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
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.id)}
            >
              <a
                href={item.href}
                data-cursor={item.label}
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
