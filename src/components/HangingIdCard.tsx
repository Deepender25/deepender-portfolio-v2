import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';

// Layout constants — must match the card's CSS exactly
const CARD_TOP = 100;          // absolute top of card within the wrapper (px)
const HOLE_FROM_CARD_TOP = 21; // distance from card's top edge to the center of the hole
                                // = 1px border + 16px padding-top + (8px hole-height / 2) from the w-12 h-2 div
                                // Adjust if you change card padding

export default function HangingIdCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Raw drag motion values — framer sets these to 0 when dragSnapToOrigin fires
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Stretchy retraction physics:
  // - Low stiffness (65) = weak pull force → slow start, gradual acceleration (rubber band feel)
  // - High mass (1.8) = heavy card with inertia → sluggish to start, builds momentum
  // - Low damping (8) = under-damped → overshoots and bounces before settling
  const springX = useSpring(dragX, { stiffness: 65, damping: 8, mass: 1.8 });
  const springY = useSpring(dragY, { stiffness: 65, damping: 8, mass: 1.8 });

  // Subtle tilt based on horizontal drag
  const rotate = useTransform(springX, [-200, 0, 200], [20, 0, -20]);

  // ─── Lanyard endpoint ────────────────────────────────────────────────────
  // The anchor (x1, y1) is at the very top-center of the wrapper: (0, 0) in a
  // child SVG positioned at x="50%" y="0".
  //
  // The card hole sits at:
  //   horizontal: card center  →  springX (relative to wrapper center)
  //   vertical:   CARD_TOP + HOLE_FROM_CARD_TOP + springY
  //
  // Because the inner SVG is placed at x="50%", horizontal is already relative
  // to the wrapper center, so springX maps directly.
  const lanyardX2 = springX; // same reference frame — no extra offset needed
  const lanyardY2 = useTransform(
    springY,
    (val) => CARD_TOP + HOLE_FROM_CARD_TOP + val
  );

  return (
    <motion.div
      initial={{ y: -1000 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', bounce: 0.4, duration: 1.5, delay: 0.2 }}
      className="absolute top-12 right-32 xl:right-56 w-56 h-[600px] pointer-events-none hidden lg:block z-30"
    >
      {/* Subtle idle sway — kept OUTSIDE the drag layer so it doesn't shift
          the coordinate origin that the lanyard math uses */}
      <motion.div
        animate={{ rotate: [-2, 2, -2], y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'top center', width: '100%', height: '100%' }}
      >
        {/* ── Lanyard SVG ── drawn BEHIND the card (lower z) ── */}
        <svg
          className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-10"
        >
          {/* Shift origin to top-center of wrapper so x offsets map to springX */}
          <svg x="50%" y="0" style={{ overflow: 'visible' }}>
            <motion.line
              x1={0}
              y1={0}
              x2={lanyardX2}
              y2={lanyardY2}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </svg>

        {/* ── Draggable ID Card ── */}
        <motion.div
          ref={cardRef}
          /**
           * We use dragX / dragY (raw values) as the drag target so that
           * dragSnapToOrigin resets them to 0. The spring catches up smoothly,
           * producing the elastic bounce-back effect.
           *
           * transformOrigin points to the hole center so rotation looks natural.
           */
          style={{
            x: springX,
            y: springY,
            rotate,
            transformOrigin: `50% ${HOLE_FROM_CARD_TOP}px`,
          }}
          drag
          _dragX={dragX}
          _dragY={dragY}
          dragSnapToOrigin
          dragElastic={0.15}
          dragConstraints={{ top: -60, bottom: 220, left: -200, right: 200 }}
          whileDrag={{ cursor: 'grabbing' }}
          className="absolute top-[100px] left-0 w-56 glass-panel rounded-2xl p-5 pointer-events-auto cursor-grab flex flex-col items-center gap-4 hover:border-white/[0.15] transition-colors duration-300 z-20"
        >
          {/* Card Hole — center of this element is the lanyard attachment point */}
          <div className="w-12 h-2 rounded-full bg-white/10 shadow-inner mb-2" />

          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <img
              src="/Deepender.jpg"
              alt="Deepender"
              className="w-full h-full object-cover object-top rounded-full scale-[1.1] -translate-y-1.5"
            />
          </div>

          {/* Name */}
          <div className="text-center w-full">
            <h4 className="text-white font-display font-medium text-lg tracking-wide">
              Deepender Yadav
            </h4>
          </div>

          {/* Barcode */}
          <div className="w-full mt-2 pt-4 border-t border-white/10 flex flex-col items-center gap-2">
            <div className="flex gap-[2px] h-8 w-full justify-center opacity-40">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-white h-full ${
                    i % 2 === 0 ? 'w-1' : i % 3 === 0 ? 'w-[2px]' : 'w-[3px]'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] font-mono text-white/30 tracking-widest">
              ID: DY-2026
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
