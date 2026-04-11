import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { navigate } from '../utils/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', path: '/about', id: 'about' },
    { name: 'Skills', path: '/skills', id: 'skills' },
    { name: 'Experience', path: '/experience', id: 'experience' },
    { name: 'Projects', path: '/projects', id: 'projects' },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="glass-pill rounded-full px-6 py-3 flex items-center justify-between gap-8 md:gap-12 pointer-events-auto w-full max-w-fit">
        <a href="#" className="text-xl font-display font-bold tracking-tighter">
          DY<span className="text-white/50">.</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.path, link.id);
              }}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              navigate('/contact', 'contact');
            }}
            className="text-xs font-mono uppercase tracking-widest border border-white/20 bg-white/5 text-white rounded-full px-5 py-2.5 hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Contact
          </a>
          <a
            href="/resume"
            onClick={(e) => {
              e.preventDefault();
              navigate('/resume');
            }}
            className="text-xs font-mono uppercase tracking-widest border border-white/20 bg-white/10 text-white rounded-full px-5 py-2.5 hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Resume
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white/80" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-4 right-4 glass-panel-strong rounded-2xl p-6 flex flex-col gap-6 md:hidden pointer-events-auto"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  navigate(link.path, link.id);
                }}
                className="text-lg font-display font-medium text-white/80 hover:text-white"
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-2">
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  navigate('/contact', 'contact');
                }}
                className="text-center text-sm font-mono uppercase tracking-widest border border-white/20 bg-white/5 text-white rounded-full px-5 py-3 hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Contact Me
              </a>
              <a
                href="/resume"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  navigate('/resume');
                }}
                className="text-center text-sm font-mono uppercase tracking-widest border border-white/20 bg-white/10 text-white rounded-full px-5 py-3 hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
