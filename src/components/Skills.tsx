import { motion } from 'motion/react';

const skillCategories = [
  {
    title: "Languages",
    skills: ["Python", "TypeScript", "JavaScript", "SQL"],
    className: "md:col-span-4"
  },
  {
    title: "AI / ML",
    skills: ["Machine Learning", "LLMs", "RAG", "Prompt Engineering", "LangChain", "Hugging Face", "PyTorch", "Scikit-learn", "Computer Vision"],
    className: "md:col-span-8"
  },
  {
    title: "Web & Backend",
    skills: ["Next.js", "React.js", "FastAPI", "Flask", "REST API", "Tailwind CSS", "Serverless"],
    className: "md:col-span-7"
  },
  {
    title: "Databases & Cloud",
    skills: ["PostgreSQL", "ChromaDB", "Supabase", "Vercel"],
    className: "md:col-span-5"
  },
  {
    title: "Tools & Practices",
    skills: ["Git", "Docker", "CI/CD", "JWT", "OAuth 2.0", "Web Scraping", "Linux"],
    className: "md:col-span-12"
  }
];

export default function Skills() {
  return (
    <section id="skills" className="px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="mb-12">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2">02 // Skills</h2>
        <h3 className="text-4xl font-display font-medium tracking-tight text-gradient">Technical Arsenal</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {skillCategories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`glass-panel p-8 rounded-3xl hover:bg-white/[0.04] transition-colors ${category.className}`}
          >
            <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-6">
              {category.title}
            </h4>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {category.skills.map((skill, i) => (
                <span 
                  key={i} 
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] text-sm font-light text-white/80 hover:border-white/30 hover:text-white transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
