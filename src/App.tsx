/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { navigate } from './utils/navigation';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { EtheralShadow } from './components/ui/etheral-shadow';
import { Waves } from './components/ui/wave-background';
import ResumeModal from './components/ResumeModal';
import HangingIdCard from './components/HangingIdCard';

export default function App() {
  const envBgType = import.meta.env.VITE_BACKGROUND_TYPE || '0';
  const envBgCycleMins = parseInt(import.meta.env.VITE_BACKGROUND_CYCLE_MINUTES || '10', 10);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [bgCycle, setBgCycle] = useState(0);

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
    const handleLocationChange = () => {
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

  const closeResume = () => {
    setIsResumeOpen(false);
    navigate('/');
  };

  return (
    <div className="relative min-h-screen text-white font-sans selection:bg-white/20 selection:text-white overflow-x-hidden">
      <ResumeModal isOpen={isResumeOpen} onClose={closeResume} />
      
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
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/15 blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-slate-200/15 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-gray-300/15 blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Dynamic Background Toggle */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu transition-opacity duration-1000">
        {activeBg === '1' ? (
          <Waves className="h-full w-full" strokeColor="rgba(255, 255, 255, 0.3)" />
        ) : (
          <EtheralShadow
            color="rgba(255, 255, 255, 0.15)"
            animation={{ scale: 100, speed: 90 }}
            noise={{ opacity: 0.8, scale: 1.2 }}
            sizing="stretch"
          />
        )}
      </div>
      
      {/* Matted Noise Texture (Keeping the subtle SVG noise for extra frosted feel) */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none transform-gpu"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <Navbar />
      <main className="relative z-10 flex flex-col gap-24 pb-40">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
