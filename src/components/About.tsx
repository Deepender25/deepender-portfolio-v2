import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="px-6 md:px-12 max-w-7xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel-strong rounded-[2rem] p-8 md:p-16 relative overflow-hidden"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Decorative blur inside card */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
          <div className="md:col-span-4">
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-4">
              01 // About
            </h2>
            <h3 className="text-4xl font-display font-medium tracking-tight text-gradient">
              Bridging AI & UX
            </h3>
          </div>
          
          <div className="md:col-span-8 space-y-6 text-white/70 font-light leading-relaxed text-lg">
            <p>
              Currently pursuing my B.Tech in Computer Science & Engineering (AI/ML) at Gurugram University (CGPA: 8.5/10). My focus lies at the intersection of machine learning and full-stack development.
            </p>
            <p>
              I specialize in building agentic LLM pipelines, RAG systems, and robust web applications. Whether it's optimizing multi-step reasoning tasks or engineering hands-free HCI systems, I thrive on solving complex technical challenges.
            </p>
            
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-white/10">
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-3">Education</h4>
                <p className="text-white/90 font-medium">B.Tech CS & Eng (AI/ML)</p>
                <p className="text-white/60 text-sm mt-1">Gurugram University<br/>2023 – 2027</p>
              </div>
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-3">Certifications</h4>
                <ul className="text-white/80 text-sm space-y-2 font-medium">
                  <li>Claude Code in Action</li>
                  <li>Oracle Cloud Infrastructure</li>
                  <li>AWS Solutions Architecture</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
