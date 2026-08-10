import { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  delay?: number; // Delay before starting the animation in ms
  className?: string; // Optional class name for styling (like gradients)
}

// Using softer, more gentle characters (lowercase, light symbols) instead of harsh symbols/numbers
const CHARS = 'abcdefghijklmnopqrstuvwxyz+-_~|/\\';

export function ScrambleText({ text, delay = 0, className = "" }: ScrambleTextProps) {
  // Start with a blank string of the same length
  const [displayText, setDisplayText] = useState(text.replace(/./g, ' '));
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let rafId: number;
    let startTimestamp: number | null = null;
    let delayDone = false;
    let lastMobileUpdate = 0;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // How long (ms) the full scramble takes after delay
    const animate = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      if (!delayDone && elapsed < delay) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      delayDone = true;

      // Map elapsed time (after delay) to iteration progress
      const animElapsed = elapsed - delay;
      const iteration = Math.min((animElapsed / 45) * (1 / 3), text.length);

      const nextText = text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        if (index < iteration) return text[index];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');

      if (isMobile) {
        // Mobile-optimized path: bypass high-frequency React state re-renders by mutating DOM directly,
        // and throttle DOM writes to ~30fps (~33ms) to eliminate mobile main-thread jank & lag.
        if (animElapsed - lastMobileUpdate >= 30 || iteration >= text.length) {
          lastMobileUpdate = animElapsed;
          if (textRef.current) {
            textRef.current.textContent = iteration >= text.length ? text : nextText;
          }
        }
      } else {
        // Exact PC path (untouched high-frequency state updates)
        setDisplayText(nextText);
      }

      if (iteration < text.length) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayText(text); // ensure exact final state
        if (textRef.current) {
          textRef.current.textContent = text;
        }
      }
    };

    // Use a small delay via rAF timestamp comparison rather than setTimeout
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [text, delay]);

  return (
    <span className="relative inline-block">
      {/* Invisible text to maintain exact final width and prevent layout shifts */}
      <span className={`invisible ${className}`}>{text}</span>
      {/* Absolutely positioned scrambling text */}
      <span ref={textRef} className={`absolute top-0 left-0 whitespace-pre ${className}`}>
        {displayText}
      </span>
    </span>
  );
}

