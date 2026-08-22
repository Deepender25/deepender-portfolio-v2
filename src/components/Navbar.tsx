import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { navigate } from '../utils/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [logoEgg, setLogoEgg] = useState(false);
  const logoClicks = useRef<number[]>([]);

  const onLogoClick = (e: ReactMouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    logoClicks.current = [...logoClicks.current.filter((t) => now - t < 2500), now];
    if (logoClicks.current.length >= 5) {
      logoClicks.current = [];
      setLogoEgg(true);
      window.setTimeout(() => setLogoEgg(false), 2200);
      return;
    }
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Scroll-spy — highlights the section currently in view */
  useEffect(() => {
    const sections = ['about', 'skills', 'experience', 'projects', 'contact']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection((entry.target as HTMLElement).id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { name: 'About', path: '/about', id: 'about' },
    { name: 'Skills', path: '/skills', id: 'skills' },
    { name: 'Experience', path: '/experience', id: 'experience' },
    { name: 'Projects', path: '/projects', id: 'projects' },
  ];

  const linkClass = (id?: string) =>
    `text-sm font-medium transition-colors ${
      id && activeSection === id ? 'text-white' : 'text-white/60 hover:text-white'
    }`;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="glass-pill rounded-full px-6 py-3 flex items-center justify-between gap-8 md:gap-12 pointer-events-auto w-full max-w-fit">
        <a
          href="/"
          data-cursor="Top"
          onClick={onLogoClick}
          className="text-xl font-display font-bold tracking-tighter"
        >
          DY<span className="text-white/50">.</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              aria-current={activeSection === link.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.path, link.id);
              }}
              className={linkClass(link.id)}
            >
              {link.name}
            </a>
          ))}
          <a
            href="/contact"
            data-cursor="Say Hello"
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
            data-cursor="Open Resume"
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
        <button
          aria-label="Toggle mobile menu"
          data-cursor="Menu"
          className="md:hidden text-white/80"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Logo easter egg toast */}
      <AnimatePresence>
        {logoEgg && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="fixed bottom-8 left-1/2 z-[130] -translate-x-1/2 rounded-full border border-white/[0.15] bg-[#0b0b0c]/90 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/80 shadow-2xl backdrop-blur-md"
          >
            {'// achievement unlocked: persistent'}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-4 right-4 glass-mobile-menu rounded-2xl p-6 flex flex-col gap-6 md:hidden pointer-events-auto"
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
                className={`text-lg font-display font-medium ${
                  activeSection === link.id ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
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
