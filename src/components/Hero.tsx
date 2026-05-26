import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react';
import { ScrambleText } from './ui/ScrambleText';

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const container = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Reset initial states for elements to prevent FOUC
    gsap.set('.hero-badge', { autoAlpha: 0, y: 30 });
    gsap.set('.hero-title-1', { autoAlpha: 0, y: 30 });
    gsap.set('.hero-title-2', { autoAlpha: 0, y: 30 });
    gsap.set('.hero-buttons', { autoAlpha: 0, x: -20 });
    gsap.set('.hero-panel', { autoAlpha: 0, y: 30 });

    tl.to('.hero-badge', {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: 'power4.out',
    })
    .to('.hero-title-1', {
      autoAlpha: 1,
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
    }, '-=0.8')
    .to('.hero-title-2', {
      autoAlpha: 1,
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
    }, '-=1.0')
    .to('.hero-buttons', {
      autoAlpha: 1,
      x: 0,
      duration: 1,
      ease: 'power4.out',
    }, '-=0.9')
    .to('.hero-panel', {
      autoAlpha: 1,
      y: 0,
      duration: 1.2,
      ease: 'power4.out',
    }, '-=0.8');

    // Add a continuous pulsing animation to the badge dot using GSAP instead of Tailwind animate-pulse if desired,
    // or keep the Tailwind class for simplicity. We'll keep the Tailwind class.

  }, { scope: container });

  return (
    <section ref={container} className="min-h-screen flex items-center pt-32 px-6 md:px-12 max-w-7xl mx-auto relative">
      <div className="w-full relative z-10 flex flex-col gap-12">
        
        {/* Top Section: Heading & Buttons (Left) */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          
          {/* Left Side */}
          <div>
            <div className="hero-badge inline-flex items-center gap-3 glass-panel px-4 py-2 rounded-full mb-8 invisible">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="font-mono text-xs text-white/80 uppercase tracking-widest">
                Available for Internships
              </p>
            </div>

            <div>
              <h1 className="hero-title-1 text-5xl md:text-7xl lg:text-[7rem] font-display font-medium tracking-tighter leading-[1.05] invisible">
                <ScrambleText text="Deepender" delay={300} className="text-gradient" />
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mt-2">
                <h1 className="hero-title-2 text-5xl md:text-7xl lg:text-[7rem] font-display font-medium tracking-tighter leading-[1.05] italic font-light text-white/60 invisible">
                  <ScrambleText text="Yadav." delay={1500} />
                </h1>
                
                <div className="hero-buttons flex flex-wrap items-center gap-4 mt-4 md:mt-0 invisible">
                  <a
                    href="#projects"
                    className="group flex items-center gap-3 bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-full text-sm md:text-base font-medium hover:bg-white/90 transition-all hover:scale-105 active:scale-95 tracking-normal font-sans"
                  >
                    View Projects 
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <div className="flex items-center gap-3 md:gap-4">
                    {[
                      { icon: Github, href: "https://github.com/Deepender25" },
                      { icon: Linkedin, href: "https://www.linkedin.com/in/deepender25/" },
                      { icon: Mail, href: "mailto:yadavdeepender65@gmail.com" }
                    ].map((social, i) => (
                      <a 
                        key={i}
                        href={social.href} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="glass-panel p-3 md:p-4 rounded-full text-white/60 hover:text-white hover:scale-110 transition-all"
                      >
                        <social.icon size={20} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Wide Text Panel */}
        <div className="hero-panel w-full glass-panel p-8 md:p-12 rounded-[2rem] relative overflow-hidden invisible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed">
              Crafting production-grade machine learning pipelines, agentic LLM systems, and full-stack web applications.
            </p>
            <p className="text-base md:text-lg text-white/50 font-light leading-relaxed">
              I specialize in bridging the gap between complex AI models and intuitive user experiences. Currently pursuing my B.Tech in Computer Science & Engineering (AI/ML) at Gurugram University, I am passionate about building scalable solutions that solve real-world problems.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
