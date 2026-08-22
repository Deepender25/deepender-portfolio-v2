/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
import { navigate } from './utils/navigation';
import portfolioData from './data/portfolio.json';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Testimonials from './components/Testimonials';
import WorkPage from './components/WorkPage';
import { EtheralShadow } from './components/ui/etheral-shadow';
import { Waves } from './components/ui/wave-background';
import HangingIdCard from './components/HangingIdCard';
import CursorLabel from './components/ui/CursorLabel';

const ResumeModal = lazy(() => import('./components/ResumeModal'));

/** Thin hairline at the very top of the page tracking overall scroll. */
function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = barRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      ref={barRef}
      className="fixed left-0 right-0 top-0 z-[80] h-[2px] origin-left bg-white/40"
      style={{ transform: 'scaleX(0)' }}
    />
  );
}

export default function App() {
  const envBgType = import.meta.env.VITE_BACKGROUND_TYPE || '0';
  const envBgCycleMins = parseInt(import.meta.env.VITE_BACKGROUND_CYCLE_MINUTES || '10', 10);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [bgCycle, setBgCycle] = useState(0);
  const [route, setRoute] = useState(() => window.location.pathname);

  /* Case-study overlay route: /work/:slug */
  const workSlug = route.startsWith('/work/')
    ? decodeURIComponent(route.slice('/work/'.length))
    : null;
  const workProject =
    portfolioData.projects.find(
      (p) => p.title.toLowerCase().replace(/\s+/g, '-') === workSlug,
    ) ?? null;

  useEffect(() => {
    if (envBgType === '0-1') {
      const interval = setInterval(() => {
        setBgCycle(prev => (prev === 0 ? 1 : 0));
      }, envBgCycleMins * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [envBgType, envBgCycleMins]);

  const activeBg = envBgType === '0-1' ? bgCycle.toString() : envBgType;

  useEffect(() => {
    // If the user reloads the page via the browser, redirect to the home page
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
      window.history.replaceState(null, '', '/');
      window.scrollTo(0, 0);
    }

    const handleLocationChange = () => {
      setRoute(window.location.pathname);
      if (window.location.pathname === '/resume') {
        setIsResumeOpen(true);
      } else {
        setIsResumeOpen(false);
      }
    };

    // Check initial path
    handleLocationChange();

    // Check if initial load requires scrolling
    const path = window.location.pathname;
    const sectionId = path.substring(1);
    if (['about', 'skills', 'experience', 'projects', 'contact'].includes(sectionId)) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Initialize Lenis for smooth scrolling and sync with GSAP
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.7, // Reduced from 1.2 for snappier, less "floaty/laggy" feeling
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    (window as any).lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
    };
  }, []);

  const closeResume = () => {
    setIsResumeOpen(false);
    navigate('/');
  };

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-white/20 selection:text-white overflow-x-hidden">
      <CursorLabel />
      <ScrollProgress />
      <Suspense fallback={null}>
        <ResumeModal isOpen={isResumeOpen} onClose={closeResume} />
      </Suspense>

      {workProject && (
        <WorkPage slug={workSlug!} onClose={() => navigate('/')} />
      )}

      <HangingIdCard />

      {/* Top Edge Hard-to-Soft Blur Gradient */}
      <div 
        className="fixed top-0 left-0 right-0 h-40 z-40 pointer-events-none backdrop-blur-2xl transform-gpu"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 20%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 20%, transparent 100%)'
        }}
      />

      {/* Deep Liquid Orbs (Behind the shadow) */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transform-gpu">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/15 blur-[60px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-slate-200/15 blur-[60px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-gray-300/15 blur-[50px] animate-blob animation-delay-4000" />
      </div>

      {/* Dynamic Background Toggle */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu transition-opacity duration-1000">
        {activeBg === '1' ? (
          <Waves className="h-full w-full" strokeColor="rgba(255, 255, 255, 0.3)" />
        ) : (
          <EtheralShadow
            color="rgba(255, 255, 255, 0.15)"
            animation={{ scale: 0, speed: 0 }}
            noise={{ opacity: 0.8, scale: 1.2 }}
            sizing="stretch"
          />
        )}
      </div>
      


      <Navbar />
      <main className="relative z-10 flex flex-col gap-16 md:gap-24">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
