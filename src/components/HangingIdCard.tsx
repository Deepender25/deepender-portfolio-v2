import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';

export default function HangingIdCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for smooth return to center
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 1 });

  // Calculate rotation based on X movement
  // When dragged right (positive X), it rotates counter-clockwise (negative) so the top points towards the anchor
  const rotate = useTransform(springX, [-200, 200], [25, -25]);

  // Lanyard end points (center of the top edge of the card)
  // Lanyard end points
  // By placing an inner SVG at x="50%", its 0,0 coordinate is perfectly centered.
  // This avoids CSS calc() bugs and width:0 rendering issues in Safari/Chrome.
  const lanyardX = springX;
  const lanyardY = useTransform(springY, (val) => val + 125); // 100px top + 25px to exact center of hole

  return (
    <motion.div
      initial={{ y: -1000 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", bounce: 0.4, duration: 1.5, delay: 0.2 }}
      className="absolute top-12 right-32 xl:right-56 w-56 h-[600px] pointer-events-none hidden lg:block z-30"
    >
      <motion.div
        animate={{
          rotate: [-2, 2, -2],
          y: [0, -15, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transformOrigin: "top center", width: '100%', height: '100%' }}
      >
        {/* Draggable Card */}
        <motion.div
          ref={cardRef}
          // Set transform origin exactly to the center of the hole (25px from top: 1px border + 20px padding + 4px half-hole)
          style={{ x, y, rotate, transformOrigin: '50% 25px' }}
          drag
          dragSnapToOrigin
          dragElastic={0.2}
          dragConstraints={{ top: -50, bottom: 200, left: -200, right: 200 }}
          className="absolute top-[100px] left-0 w-56 glass-panel rounded-2xl p-5 pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col items-center gap-4 hover:border-white/[0.15] transition-colors duration-300 z-20"
        >
          {/* Card Hole */}
          <div className="w-12 h-2 rounded-full bg-white/10 shadow-inner mb-2" />

          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <img 
              src="/Deepender.jpg" 
              alt="Deepender" 
              className="w-full h-full object-cover object-top rounded-full scale-[1.1] -translate-y-1.5"
            />
          </div>

          {/* Details */}
          <div className="text-center w-full">
            <h4 className="text-white font-display font-medium text-lg tracking-wide">Deepender Yadav</h4>
          </div>

          {/* Barcode / Extra details */}
          <div className="w-full mt-2 pt-4 border-t border-white/10 flex flex-col items-center gap-2">
            <div className="flex gap-[2px] h-8 w-full justify-center opacity-40">
              {/* Fake barcode lines */}
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`bg-white h-full ${i % 2 === 0 ? 'w-1' : i % 3 === 0 ? 'w-[2px]' : 'w-[3px]'}`} />
              ))}
            </div>
            <p className="text-[10px] font-mono text-white/30 tracking-widest">ID: DY-2026</p>
          </div>
        </motion.div>

        {/* Lanyard SVG - Placed AFTER card so it renders on top, looking like it goes into the hole */}
        <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-30">
          <svg x="50%" y="0" style={{ overflow: 'visible' }}>
            {/* Anchor point at top center */}
            <motion.line
              x1="0"
              y1="0"
              x2={lanyardX}
              y2={lanyardY}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
            />
          </svg>
        </svg>
      </motion.div>
    </motion.div>
  );
}
