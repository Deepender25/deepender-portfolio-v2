import { useState, useEffect } from 'react';

interface ScrambleTextProps {
  text: string;
  delay?: number; // Delay before starting the animation in ms
  className?: string; // Optional class name for styling (like gradients)
}

// Using softer, more gentle characters (lowercase, light symbols) instead of harsh symbols/numbers
const CHARS = 'abcdefghijklmnopqrstuvwxyz+-_~|/\\';

export function ScrambleText({ text, delay = 0, className = "" }: ScrambleTextProps) {
  // Mobile and reduced-motion visitors see the final text immediately
  const isStatic =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const [displayText, setDisplayText] = useState(isStatic ? text : text.replace(/./g, ' '));

  useEffect(() => {
    if (isStatic) {
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
  }, [text, delay, isStatic]);

  if (isStatic) return <span className={className}>{text}</span>;

  return (
    // The final text reserves the width through a CSS pseudo-element, so the
    // word exists only once in the DOM (headings read "Deepender", not
    // "DeependerDeepender", for search engines and screen readers).
    <span data-text={text} className="relative inline-block whitespace-pre before:invisible before:content-[attr(data-text)]">
      <span className={`absolute top-0 left-0 whitespace-pre ${className}`}>{displayText}</span>
    </span>
  );
}


