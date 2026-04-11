import { motion } from 'motion/react';

const experiences = [
  {
    role: "AI/ML Intern",
    company: "RationalGo AI",
    period: "Jun 2025 – Aug 2025",
    description: [
      "Shipped 3+ internal tools and product features — including workflow automation utilities and marketing efficiency tools.",
      "Built and optimized agentic LLM pipelines using prompt engineering and LLM evaluation, improving output quality.",
      "Contributed to product testing, bug fixing, and performance optimization, collaborating on backend AI logic."
    ]
  },
  {
    role: "Head of Data Collection",
    company: "Training & Placement Office, Gurugram University",
    period: "Feb 2026 – Present",
    description: [
      "Led a team of 4–5 members to scrape, clean, and maintain a structured database of 300+ company profiles.",
      "Built automated data pipelines cutting manual data entry time by ~40%, supporting placement drive coordination."
    ]
  }
];

export default function Experience() {
  return (
    <section id="experience" className="px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="mb-12">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2">03 // Experience</h2>
        <h3 className="text-4xl font-display font-medium tracking-tight text-gradient">Professional Journey</h3>
      </div>
      
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-display font-medium tracking-tight text-white group-hover:text-gradient transition-all">
                  {exp.role}
                </h3>
                <p className="text-sm font-mono text-white/50 mt-2">{exp.company}</p>
              </div>
              <span className="glass-pill px-4 py-2 rounded-full text-xs font-mono text-white/60 shrink-0">
                {exp.period}
              </span>
            </div>
            
            <ul className="space-y-4">
              {exp.description.map((item, i) => (
                <li key={i} className="text-white/70 font-light text-sm md:text-base flex gap-4">
                  <span className="text-white/20 mt-1.5 text-[10px]">◆</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
