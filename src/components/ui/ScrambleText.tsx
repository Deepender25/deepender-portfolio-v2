import { useState, useEffect } from 'react';

interface ScrambleTextProps {
  text: string;
  delay?: number; // Delay before starting the animation in ms
  className?: string; // Optional class name for styling (like gradients)
}

// Using softer, more gentle characters (lowercase, light symbols) instead of harsh symbols/numbers
const CHARS = 'abcdefghijklmnopqrstuvwxyz+-_~|/\\';

export function ScrambleText({ text, delay = 0, className = "" }: ScrambleTextProps) {
  // Start with a blank string or scrambled string of the same length
  const [displayText, setDisplayText] = useState(text.replace(/./g, ' '));

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    timeoutId = setTimeout(() => {
      let iteration = 0;
      
      intervalId = setInterval(() => {
        setDisplayText(() => {
          return text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (index < iteration) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('');
        });

        if (iteration >= text.length) {
          clearInterval(intervalId);
          setDisplayText(text); // Ensure final text is exact
        }
        
        // Faster progression (1/3) to complete the animation in ~1.2s
        iteration += 1 / 3; 
      }, 45); // Slightly slower update frequency (was 30ms)
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, delay]);

  return (
    <span className="relative inline-block">
      {/* Invisible text to maintain exact final width and prevent layout shifts */}
      <span className={`invisible ${className}`}>{text}</span>
      {/* Absolutely positioned scrambling text */}
      <span className={`absolute top-0 left-0 whitespace-pre ${className}`}>{displayText}</span>
    </span>
  );
}
