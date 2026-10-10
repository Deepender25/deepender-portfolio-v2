import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

interface MagneticProps {
  children: ReactNode;
  /** 0–1 — how far the element chases the cursor */
  strength?: number;
  className?: string;
}

/** Wraps children in a spring-loaded container that leans slightly toward the cursor. */
export function Magnetic({ children, strength = 0.12, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Critically damped: settles without wobble
  const x = useSpring(rawX, { stiffness: 220, damping: 26, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 220, damping: 26, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={className ?? 'inline-block'}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect || reduceMotion) return;
        // Measure from the resting position, not the already-shifted one
        const cx = rect.left - x.get() + rect.width / 2;
        const cy = rect.top - y.get() + rect.height / 2;
        rawX.set((event.clientX - cx) * strength);
        rawY.set((event.clientY - cy) * strength);
      }}
      onMouseLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export default Magnetic;
