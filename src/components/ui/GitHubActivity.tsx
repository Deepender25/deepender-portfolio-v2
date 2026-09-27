import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from 'motion/react';
import { cn } from '../../lib/utils';
import { Github, ExternalLink } from 'lucide-react';

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type Contribution = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type RepoContribution = {
  name: string;
  count: number;
  logo?: React.ReactNode;
  href?: string;
};

const DEFAULT_ACCENT = ['rgba(255,255,255,0.06)', '#065f46', '#059669', '#10b981', '#34d399'];
const DEFAULT_CELL_SIZE = 8;
const DEFAULT_LABEL = 'Top contributions in:';
const DEFAULT_MONTHS = 10;
const WEEKS_PER_MONTH = 365.25 / 12 / 7;
const STACK_LIMIT = 3;
const MIN_LABEL_WEEKS = 3;

const gapFor = (cellSize: number) => Math.max(2, Math.round(cellSize / 3.5));
const weeksFor = (months: number) =>
  Math.max(1, Math.ceil(months * WEEKS_PER_MONTH));

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: 'spring', bounce: 0.2, duration: 0.62 } as const;
const HEADER_SPRING = { ...SPRING, bounce: 0.45 } as const;
const ROW_SPRING = { ...SPRING, bounce: 0.26, delay: 0.08 } as const;
const ROW_OFFSET = 16;
const CELL_FADE = { duration: 0.2, ease: EASE_OUT } as const;
const TOOLTIP_FADE = { duration: 0.14, ease: EASE_OUT } as const;
const TOOLTIP_EDGE = 8;
const COLUMN_STAGGER = 0.008;
const LABEL_BLUR = 4;
const LABEL_REVEAL = { duration: 0.45, ease: EASE_OUT } as const;

const LEVELS = [0, 1, 2, 3, 4] as const;

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function toMonthLabels(weeks: Contribution[][]) {
  const labels: (string | null)[] = weeks.map(() => null);
  const monthAt = (index: number) => weeks[index]?.[0]?.date?.slice(5, 7);

  let start = 0;
  for (let i = 1; i <= weeks.length; i++) {
    if (i < weeks.length && monthAt(i) === monthAt(start)) continue;
    if (i - start >= MIN_LABEL_WEEKS && monthAt(start)) {
      labels[start] = MONTH_NAMES[Number(monthAt(start)) - 1] ?? null;
    }
    start = i;
  }

  return labels;
}

const LEVEL_OPACITY: Record<ContributionLevel, number> = {
  0: 0,
  1: 0.35,
  2: 0.6,
  3: 0.85,
  4: 1,
};

type LevelStyle = { backgroundColor: string; opacity: number; border?: string; boxShadow?: string };

type HoveredDay = { day: Contribution; x: number; y: number };

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function describeDay({ count, date }: Contribution) {
  const noun = count === 1 ? 'contribution' : 'contributions';
  return `${count} ${noun} on ${DATE_FORMAT.format(new Date(`${date}T00:00:00`))}`;
}

const CALENDAR_API = 'https://github-contributions-api.jogruber.de/v4';
const EVENTS_API = 'https://api.github.com/users';

type ApiDay = { date: string; count: number; level: number };
type PushEvent = {
  type: string;
  repo?: { name: string };
  payload?: { commits?: unknown[] };
};

async function fetchCalendar(login: string): Promise<{ contributions: Contribution[]; allTimeTotal: number } | null> {
  try {
    const [allRes, lastRes] = await Promise.all([
      fetch(`${CALENDAR_API}/${login}`).catch(() => null),
      fetch(`${CALENDAR_API}/${login}?y=last`).catch(() => null),
    ]);

    let allTimeTotal = 2423;
    if (allRes && allRes.ok) {
      const allData = await allRes.json();
      if (allData?.total) {
        const sumYears = (Object.values(allData.total) as number[]).reduce<number>(
          (acc, val) => acc + (typeof val === 'number' ? val : 0),
          0
        );
        if (sumYears > 0) allTimeTotal = sumYears;
      }
    }

    let days: ApiDay[] = [];
    if (lastRes && lastRes.ok) {
      const lastData = await lastRes.json();
      days = lastData?.contributions ?? [];
    }

    if (!days.length) return null;

    // Align columns to Sunday
    const start = days.findIndex(
      (day) => new Date(`${day.date}T00:00:00Z`).getUTCDay() === 0,
    );

    const contributions = days.slice(start < 0 ? 0 : start).map<Contribution>((day) => ({
      date: day.date,
      count: day.count,
      level: Math.min(4, Math.max(0, day.level)) as ContributionLevel,
    }));

    return { contributions, allTimeTotal };
  } catch {
    return null;
  }
}

async function fetchRepos(login: string): Promise<RepoContribution[]> {
  try {
    const res = await fetch(`${EVENTS_API}/${login}/events/public?per_page=100`);
    if (!res.ok) return [];

    const events: PushEvent[] = await res.json();
    const counts = new Map<string, number>();

    for (const event of events) {
      if (event.type !== 'PushEvent' || !event.repo) continue;
      const commits = event.payload?.commits?.length ?? 1;
      counts.set(event.repo.name, (counts.get(event.repo.name) ?? 0) + commits);
    }

    return [...counts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, STACK_LIMIT)
      .map(([fullName, count]) => {
        const [owner, name] = fullName.split('/');
        return {
          name,
          count,
          href: `https://github.com/${fullName}`,
          logo:
            owner.toLowerCase() === login.toLowerCase() ? undefined : (
              <img src={`https://github.com/${owner}.png?size=64`} alt="" className="size-full object-cover" />
            ),
        };
      });
  } catch {
    return [];
  }
}

function useGitHubUser(login?: string) {
  const [data, setData] = React.useState<{
    contributions: Contribution[];
    repos: RepoContribution[];
    allTimeTotal: number;
  }>();

  React.useEffect(() => {
    if (!login) return;
    let active = true;

    Promise.all([fetchCalendar(login), fetchRepos(login)])
      .then(([calendarResult, repos]) => {
        if (active && calendarResult) {
          setData({
            contributions: calendarResult.contributions,
            repos,
            allTimeTotal: calendarResult.allTimeTotal,
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [login]);

  return data;
}

function generateFallbackDays(weeks = 40): Contribution[] {
  const pattern = [
    1, 1, 0, 2, 1, 1, 3, 2, 1, 1, 4, 2, 1, 0, 1, 2, 3, 1, 1, 1, 2, 4, 1, 0, 2, 1, 3,
    1, 2, 1, 1, 4, 3, 2, 1, 0, 1, 2, 1, 3, 1, 2, 1, 1, 4, 2, 1, 1, 3, 2, 1, 0, 2, 4,
    1, 1, 3, 2, 1, 0, 1, 1, 2, 3, 1, 4, 2, 1, 1, 2, 0, 3, 4, 1, 2, 1, 1, 2, 3, 1, 1,
  ];

  const today = new Date();
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (weeks * 7 - 1 - i));
    const level = pattern[i % pattern.length] as ContributionLevel;
    return {
      date: date.toISOString().slice(0, 10),
      count: level === 0 ? 0 : level * 3 + (i % 4),
      level,
    };
  });
}

function toScale(accent: string | string[]): LevelStyle[] {
  if (typeof accent === 'string') {
    return LEVELS.map((level) => ({
      backgroundColor: accent,
      opacity: LEVEL_OPACITY[level],
    }));
  }

  const colors = accent.length >= 5 ? accent : ['rgba(255,255,255,0.06)', ...accent];
  return LEVELS.map((level) => {
    const color = colors[level] ?? colors[colors.length - 1] ?? 'rgba(255,255,255,0.06)';
    return {
      backgroundColor: color,
      opacity: 1,
      boxShadow: level === 4 ? '0 0 6px rgba(52,211,153,0.45)' : undefined,
    };
  });
}

function toWeeks(contributions: Contribution[]) {
  const weeks: Contribution[][] = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }
  return weeks;
}

function useFittedColumns(cellSize: number, gap: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [columns, setColumns] = React.useState<number>();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () =>
      setColumns(
        Math.max(1, Math.floor((el.clientWidth + gap) / (cellSize + gap))),
      );

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [cellSize, gap]);

  return [ref, columns] as const;
}

const Tooltip = ({
  hovered,
  reduceMotion,
}: {
  hovered: HoveredDay;
  reduceMotion: boolean | null;
  key?: React.Key;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [left, setLeft] = React.useState(hovered.x);

  useIsoLayoutEffect(() => {
    const half = (ref.current?.offsetWidth ?? 0) / 2;
    const edge = TOOLTIP_EDGE + half;
    setLeft(Math.min(Math.max(hovered.x, edge), window.innerWidth - edge));
  }, [hovered]);

  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left,
        top: hovered.y,
        transform: 'translate(-50%, calc(-100% - 8px))',
      }}
    >
      <motion.div
        ref={ref}
        className="whitespace-nowrap rounded-lg bg-[#18181b] border border-white/20 px-2.5 py-1 font-mono text-[11px] font-medium text-white shadow-2xl backdrop-blur-md"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={reduceMotion ? { duration: 0 } : TOOLTIP_FADE}
      >
        {describeDay(hovered.day)}
      </motion.div>
    </div>,
    document.body,
  );
};

const ContributionGrid = ({
  contributions,
  scale,
  cellSize,
  months,
  showMonths,
  label,
  reduceMotion,
}: {
  contributions: Contribution[];
  scale: LevelStyle[];
  cellSize: number;
  months: number;
  showMonths: boolean;
  label: string;
  reduceMotion: boolean | null;
}) => {
  const weeks = React.useMemo(() => toWeeks(contributions), [contributions]);
  const gap = gapFor(cellSize);
  const [ref, columns] = useFittedColumns(cellSize, gap);
  const [hovered, setHovered] = React.useState<HoveredDay>();

  const cap = Math.min(weeks.length, weeksFor(months));
  const visible = weeks.slice(-Math.min(cap, columns ?? cap));
  const sweepEnd = (visible.length - 1) * COLUMN_STAGGER + CELL_FADE.duration;

  const hover = (day: Contribution) => (event: React.PointerEvent) => {
    const cell = event.currentTarget.getBoundingClientRect();
    setHovered({ day, x: cell.left + cell.width / 2, y: cell.top });
  };

  return (
    <div
      ref={ref}
      data-slot="github-activity-grid"
      role="img"
      aria-label={label}
      className="relative w-full"
    >
      {showMonths && (
        <motion.div
          className="flex justify-center"
          style={{ gap, marginBottom: gap }}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, filter: `blur(${LABEL_BLUR}px)` }
          }
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{
            ...LABEL_REVEAL,
            delay: reduceMotion ? 0 : sweepEnd,
          }}
        >
          {toMonthLabels(visible).map((month, index) => (
            <div
              key={index}
              className="relative h-3 shrink-0"
              style={{ width: cellSize }}
            >
              {month && (
                <span className="absolute left-0 top-0 text-[9px] font-mono leading-none text-white/40">
                  {month}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      )}

      <div
        className="flex justify-center overflow-hidden"
        style={{ gap }}
        onPointerLeave={() => setHovered(undefined)}
      >
        {visible.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col" style={{ gap }}>
            {week.map((day) => (
              <motion.div
                key={day.date}
                onPointerEnter={hover(day)}
                className="shrink-0 rounded-[2px] bg-white/[0.06] border border-white/[0.02]"
                style={{ width: cellSize, height: cellSize }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  ...CELL_FADE,
                  delay: reduceMotion ? 0 : weekIndex * COLUMN_STAGGER,
                }}
              >
                <div
                  className="h-full w-full rounded-[2px]"
                  style={scale[day.level] ?? scale[0]}
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {hovered && (
          <Tooltip
            key="tooltip"
            hovered={hovered}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const Avatar = ({
  repo,
  layoutId,
  transition,
  className,
}: {
  repo: RepoContribution;
  layoutId: string;
  transition: Transition;
  className?: string;
}) => (
  <motion.span
    layoutId={layoutId}
    transition={transition}
    className={cn(
      'grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-neutral-800 text-[10px] font-medium uppercase text-white/80 ring-1 ring-white/10',
      className,
    )}
  >
    {repo.logo ?? repo.name.charAt(0)}
  </motion.span>
);

const RepoRow = ({
  repo,
  layoutId,
  transition,
}: {
  repo: RepoContribution;
  layoutId: string;
  transition: Transition;
}) => {
  const className =
    'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-white/10';

  const content = (
    <>
      <Avatar repo={repo} layoutId={layoutId} transition={transition} />
      <span className="flex-1 truncate text-xs text-white/90">
        {repo.name}
      </span>
      <span className="text-xs font-mono tabular-nums text-white/50">
        {repo.count}
      </span>
    </>
  );

  return repo.href ? (
    <a href={repo.href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
};

const Chevron = ({
  open,
  transition,
}: {
  open: boolean;
  transition: Transition;
}) => (
  <motion.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="size-5 text-white/50"
    initial={false}
    animate={{ rotate: open ? 180 : 0 }}
    transition={transition}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m16 10-4 4-4-4" />
  </motion.svg>
);

export type GitHubActivityProps = React.ComponentProps<'div'> & {
  username?: string;
  avatarUrl?: string;
  contributions?: Contribution[];
  repos?: RepoContribution[];
  allTimeTotal?: number;
  accent?: string | string[];
  cellSize?: number;
  months?: number;
  showMonths?: boolean;
  label?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const GitHubActivity = ({
  className,
  username = 'Deepender25',
  avatarUrl = `https://github.com/${username}.png`,
  contributions: contributionsProp = [],
  repos: reposProp = [],
  allTimeTotal: allTimeTotalProp,
  accent = DEFAULT_ACCENT,
  cellSize = DEFAULT_CELL_SIZE,
  months = DEFAULT_MONTHS,
  showMonths = true,
  label = DEFAULT_LABEL,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  style,
  ...props
}: GitHubActivityProps) => {
  const reduceMotion = useReducedMotion();
  const uid = React.useId();
  const [openState, setOpenState] = React.useState(defaultOpen);

  const open = openProp ?? openState;
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (openProp === undefined) setOpenState(!open);
    onOpenChange?.(!open);
  };

  const needsFetch = !contributionsProp.length || !reposProp.length;
  const fetched = useGitHubUser(needsFetch ? username : undefined);
  const placeholder = React.useMemo(
    () => generateFallbackDays(weeksFor(months)),
    [months],
  );

  const contributions = contributionsProp.length
    ? contributionsProp
    : (fetched?.contributions ?? placeholder);
  const repos = reposProp.length ? reposProp : (fetched?.repos ?? []);

  const total = allTimeTotalProp ?? fetched?.allTimeTotal ?? 2423;
  const heading = `${total.toLocaleString()} all-time contributions`;

  const scale = React.useMemo(() => toScale(accent), [accent]);
  const transition = reduceMotion ? { duration: 0 } : SPRING;
  const headerTransition = reduceMotion ? { duration: 0 } : HEADER_SPRING;
  const rowTransition = reduceMotion ? { duration: 0 } : ROW_SPRING;

  const kick = reduceMotion ? {} : { x: ROW_OFFSET, y: ROW_OFFSET };
  const listMotion = {
    initial: { opacity: 0, ...kick },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...kick },
  };

  return (
    <div
      data-slot="github-activity"
      className={cn(
        'relative w-[340px] sm:w-[365px] overflow-hidden rounded-[22px] bg-[#0c0c0e]/95 backdrop-blur-2xl border border-white/[0.12] p-4 text-white shadow-[0_24px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.12)]',
        repos.length > 0 && open && 'pb-4',
        className,
      )}
      style={style}
      {...props}
    >
      {/* ── Top Heading: Contributions Count ─────────────────────────── */}
      <div className="mb-3 px-1 flex items-center justify-between">
        <p className="font-sans font-semibold text-[13px] sm:text-sm text-white tracking-tight">
          {heading}
        </p>
        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </span>
      </div>

      {/* ── Contribution Activity Heatmap Grid ───────────────────────── */}
      <div className="w-full my-1">
        <ContributionGrid
          contributions={contributions}
          scale={scale}
          cellSize={cellSize}
          months={months}
          showMonths={showMonths}
          label={heading}
          reduceMotion={reduceMotion}
        />
      </div>

      {/* ── Expandable Top Repositories (if present and opened) ─────── */}
      <AnimatePresence initial={false}>
        {open && repos.length > 0 && (
          <motion.div
            key="repos-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={rowTransition}
            className="my-3 overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.08] p-2"
          >
            <div className="mb-1.5 px-2.5 text-[10px] font-mono uppercase tracking-widest text-white/40">
              {label}
            </div>
            <motion.ul layout="position" {...listMotion} className="space-y-1">
              {repos.map((repo, index) => (
                <li key={index}>
                  <RepoRow
                    repo={repo}
                    layoutId={`${uid}-${index}`}
                    transition={transition}
                  />
                </li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Bar: Username in Left Bottom & Photo on the Right ─── */}
      <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center justify-between">
        {/* Left Bottom: Username with GitHub Icon & Link */}
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          data-cursor="GitHub"
          className="group flex items-center gap-2 hover:opacity-100 transition-opacity"
        >
          <div className="p-1 rounded-md bg-white/5 border border-white/10 text-white/70 group-hover:text-white transition-colors">
            <Github size={13} />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-semibold text-xs text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">
              {username}
              <ExternalLink size={10} className="text-white/30 group-hover:text-white/70 transition-colors" />
            </span>
            <span className="font-mono text-[9px] text-white/40 tracking-wider">
              github.com/{username}
            </span>
          </div>
        </a>

        {/* Right Bottom: User Photo & Repos Toggle */}
        <div className="flex items-center gap-2">
          {repos.length > 0 && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              title={open ? 'Hide top repos' : 'Show top repos'}
              data-cursor={open ? 'Hide' : 'Top Repos'}
              className="p-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 transition-colors"
            >
              <Chevron open={open} transition={transition} />
            </button>
          )}

          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            data-cursor="Profile"
            className="relative block rounded-full ring-1 ring-white/20 hover:ring-emerald-400/60 transition-all hover:scale-105"
          >
            <img
              src={avatarUrl}
              onError={(e) => {
                e.currentTarget.src = '/Deepender.jpg';
              }}
              alt={username}
              className="size-8 rounded-full object-cover object-top bg-zinc-800"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default GitHubActivity;
