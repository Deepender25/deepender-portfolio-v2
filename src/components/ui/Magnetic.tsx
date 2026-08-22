import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface MagneticProps {
  children: ReactNode;
  /** 0–1 — how far the element chases the cursor */
  strength?: number;
  className?: string;
}

/** Wraps children in a spring-loaded container that leans toward the cursor. */
export function Magnetic({ children, strength = 0.25, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 180, damping: 14, mass: 0.2 });
  const y = useSpring(rawY, { stiffness: 180, damping: 14, mass: 0.2 });

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={className ?? 'inline-block'}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        rawY.set((event.clientY - (rect.top + rect.height / 2)) * strength);
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
