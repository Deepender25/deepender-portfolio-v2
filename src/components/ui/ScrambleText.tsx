import { useState, useEffect } from 'react';

interface ScrambleTextProps {
  text: string;
  delay?: number; // Delay before starting the animation in ms
  className?: string; // Optional class name for styling (like gradients)
}

// Using softer, more gentle characters (lowercase, light symbols) instead of harsh symbols/numbers
const CHARS = 'abcdefghijklmnopqrstuvwxyz+-_~|/\\';

export function ScrambleText({ text, delay = 0, className = "" }: ScrambleTextProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // On mobile, display full text immediately without blank initial state
  const [displayText, setDisplayText] = useState(isMobile ? text : text.replace(/./g, ' '));

  useEffect(() => {
    // Mobile view: no scramble animation at all
    if (isMobile) {
      setDisplayText(text);
      return;
    }

    let rafId: number;
    let startTimestamp: number | null = null;
    let delayDone = false;

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

      setDisplayText(
        text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          if (index < iteration) return text[index];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );

      if (iteration < text.length) {
        rafId = requestAnimationFrame(animate);
      } else {
        setDisplayText(text); // ensure exact final text
      }
    };

    // Use a small delay via rAF timestamp comparison rather than setTimeout
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [text, delay, isMobile]);

  return (
    <span className="relative inline-block">
      {/* Invisible text to maintain exact final width and prevent layout shifts */}
      <span className={`invisible ${className}`}>{text}</span>
      {/* Absolutely positioned text */}
      <span className={`absolute top-0 left-0 whitespace-pre ${className}`}>{displayText}</span>
    </span>
  );
}


