import { useEffect, useRef, useState } from 'react';

/**
 * Contextual cursor hint. The native cursor is never replaced; a small
 * label appears beside it only over elements that opt in with
 * `data-cursor="…"`, and only where the label tells the visitor something
 * the element itself doesn't (e.g. "Play demo" on a muted preview).
 *
 * Desktop-only (hover + fine pointer). The animation loop runs only while
 * a label is showing, and smoothing is dropped for reduced-motion users.
 */

const OFFSET_X = 16;
const OFFSET_Y = 20;
const EDGE = 8;
/* Fraction of the remaining distance covered per 60fps frame */
const FOLLOW = 0.35;

export function CursorLabel() {
  const chipRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  /* Last non-empty label, kept so the chip doesn't collapse while fading out */
  const [text, setText] = useState('');

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

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pointerX = -1;
    let pointerY = -1;
    let x = 0;
    let y = 0;
    let visible = false;
    let raf = 0;
    let last = 0;

    /* Where the chip should sit: bottom-right of the pointer, flipped near edges */
    const target = () => {
      const chip = chipRef.current;
      const w = chip?.offsetWidth ?? 0;
      const h = chip?.offsetHeight ?? 0;
      let tx = pointerX + OFFSET_X;
      let ty = pointerY + OFFSET_Y;
      if (tx + w > window.innerWidth - EDGE) tx = pointerX - OFFSET_X - w;
      if (ty + h > window.innerHeight - EDGE) ty = pointerY - OFFSET_Y - h;
      return [tx, ty] as const;
    };

    const paint = () => {
      if (chipRef.current) chipRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const tick = (now: number) => {
      const [tx, ty] = target();
      // Frame-rate independent smoothing; instant for reduced motion
      const alpha = reduceMotion.matches ? 1 : 1 - Math.pow(1 - FOLLOW, Math.min(now - last, 64) / 16.67);
      last = now;
      x += (tx - x) * alpha;
      y += (ty - y) * alpha;
      paint();

      if (visible && (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1)) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    /* Resolve the label under the pointer — also re-run after scroll/click,
       since content can move under a cursor that hasn't moved */
    const resolve = () => {
      if (pointerX < 0) return;
      const el = document.elementFromPoint(pointerX, pointerY);
      const text = el?.closest('[data-cursor]')?.getAttribute('data-cursor')?.trim() || null;

      if (text && !visible) {
        // Snap into place so the chip never flies in from its last position
        visible = true;
        [x, y] = target();
        paint();
      } else if (!text) {
        visible = false;
      }
      setLabel((prev) => (prev === text ? prev : text));
      if (text) setText(text);
      if (visible) kick();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      resolve();
    };

    let recheck = 0;
    const onRecheck = () => {
      if (recheck) return;
      recheck = requestAnimationFrame(() => {
        recheck = 0;
        resolve();
      });
    };

    const hide = () => {
      pointerX = -1;
      visible = false;
      setLabel(null);
    };

    const onOut = (event: MouseEvent) => {
      if (!event.relatedTarget) hide(); // pointer left the window
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onRecheck, { passive: true, capture: true });
    window.addEventListener('click', onRecheck, true);
    window.addEventListener('popstate', onRecheck);
    document.addEventListener('mouseout', onOut);
    window.addEventListener('blur', hide);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onRecheck, { capture: true });
      window.removeEventListener('click', onRecheck, true);
      window.removeEventListener('popstate', onRecheck);
      document.removeEventListener('mouseout', onOut);
      window.removeEventListener('blur', hide);
      if (raf) cancelAnimationFrame(raf);
      if (recheck) cancelAnimationFrame(recheck);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={chipRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[150] will-change-transform"
    >
      <div
        className={`flex h-7 items-center whitespace-nowrap rounded-full border border-white/[0.12] bg-[#0b0b0c]/90 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none ${
          label ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default CursorLabel;
