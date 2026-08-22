import portfolioData from '../data/portfolio.json';
import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  url?: string;
}

/**
 * Renders recommendations from portfolio.json → "testimonials".
 * The section hides itself completely while the array is empty —
 * only real, verifiable quotes should ever be added here.
 */
export default function Testimonials() {
  const testimonials = (portfolioData as { testimonials?: Testimonial[] }).testimonials ?? [];
  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="relative z-10 w-full px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-10 md:mb-12">
        <p className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2" aria-hidden="true">
          Kind words
        </p>
        <h2 className="text-4xl font-display font-medium tracking-tight text-gradient">
          What people say
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {testimonials.map((t) => {
          const body = (
            <figure className="glass-panel h-full rounded-3xl p-7 flex flex-col justify-between gap-6 transition-transform duration-500 hover:-translate-y-1">
              <Quote size={18} className="text-white/25" aria-hidden />
              <blockquote className="font-light leading-relaxed text-white/70 text-[15px]">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-auto">
                <p className="font-display text-sm font-medium text-white">{t.name}</p>
                {t.role && (
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {t.role}
                  </p>
                )}
              </figcaption>
            </figure>
          );

          return t.url ? (
            <a key={t.name} href={t.url} target="_blank" rel="noreferrer" className="block">
              {body}
            </a>
          ) : (
            <div key={t.name}>{body}</div>
          );
        })}
      </div>
    </section>
  );
}
