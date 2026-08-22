import { useEffect, useRef, useState } from 'react';

/**
 * Three-layer custom cursor:
 *  · dot   — always-on point, tight follow
 *  · ring  — expands over any interactive target (even without a label)
 *  · chip  — glass pill showing the element's `data-cursor` text,
 *            tilting with pointer velocity; `data-cursor-lg` renders it
 *            as a large circular badge centered under the cursor.
 *
 * Desktop-only (hover + fine pointer). Inert everywhere else.
 */
export function CursorLabel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotWrapRef = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const chipWrapRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [ringOn, setRingOn] = useState(false);
  const [big, setBig] = useState(false);
  const bigRef = useRef(false);

  useEffect(() => {
    bigRef.current = big;
  }, [big]);

  /* Only run where a real cursor exists */
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let tx = -100;
    let ty = -100;
    let dX = -100;
    let dY = -100;
    let cX = -100;
    let cY = -100;
    let velX = 0;
    let raf = 0;
    let seen = false;

    const tick = () => {
      dX += (tx - dX) * 0.42;
      dY += (ty - dY) * 0.42;
      cX += (tx - cX) * 0.16;
      cY += (ty - cY) * 0.16;

      velX += ((tx - cX) * 0.1 - velX) * 0.08;
      const tilt = Math.max(-12, Math.min(12, velX));

      if (dotWrapRef.current) {
        dotWrapRef.current.style.transform = `translate3d(${dX}px, ${dY}px, 0) translate(-50%, -50%)`;
      }
      if (ringWrapRef.current) {
        ringWrapRef.current.style.transform = `translate3d(${dX}px, ${dY}px, 0) translate(-50%, -50%)`;
      }
      if (chipWrapRef.current) {
        chipWrapRef.current.style.transform = bigRef.current
          ? `translate3d(${cX}px, ${cY}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`
          : `translate3d(${cX}px, ${cY}px, 0) translate(-50%, calc(-50% + 28px)) rotate(${tilt}deg)`;
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      if (!seen) {
        seen = true;
        if (rootRef.current) rootRef.current.style.opacity = '1';
      }

      const el = event.target as Element | null;
      const labeled = el?.closest?.('[data-cursor]');
      const text = labeled?.getAttribute('data-cursor') ?? null;
      const isBig = labeled?.hasAttribute('data-cursor-lg') ?? false;
      const interactive =
        !text &&
        Boolean(el?.closest?.('a, button, [role="button"], input, textarea, select'));

      setLabel((prev) => (prev === text ? prev : text));
      setBig((prev) => (prev === isBig ? prev : isBig));
      setRingOn((prev) => (prev === interactive ? prev : interactive));
    };

    const onLeave = () => {
      seen = false;
      if (rootRef.current) rootRef.current.style.opacity = '0';
      setLabel(null);
      setRingOn(false);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[150]"
      style={{ opacity: 0 }}
    >
      {/* Ring — expands over any interactive target */}
      <div ref={ringWrapRef} className="fixed left-0 top-0 will-change-transform">
        <div
          className={`h-9 w-9 rounded-full border border-white/40 transition-all duration-200 ${
            ringOn && !label ? 'scale-100 opacity-90' : 'scale-50 opacity-0'
          }`}
        />
      </div>

      {/* Dot — always on */}
      <div ref={dotWrapRef} className="fixed left-0 top-0 will-change-transform">
        <div
          className={`h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)] transition-transform duration-200 ${
            label ? 'scale-0' : 'scale-100'
          }`}
        />
      </div>

      {/* Chip — unique per interaction */}
      <div ref={chipWrapRef} className="fixed left-0 top-0 will-change-transform">
        <div
          className={`flex items-center rounded-full border border-white/[0.15] bg-[#0b0b0c]/85 font-mono uppercase tracking-[0.18em] text-white shadow-[0_10px_32px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all duration-200 ${
            big ? 'h-20 w-20 justify-center p-2 text-center text-[9px] leading-relaxed' : 'h-7 px-3.5 text-[9px]'
          } ${label ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export default CursorLabel;
