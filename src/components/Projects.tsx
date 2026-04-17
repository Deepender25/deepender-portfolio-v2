import { motion } from 'motion/react';
import { Github, ExternalLink, ArrowRight, Bot, Newspaper, FileText, MonitorPlay, CalendarCheck, Subtitles, Scissors, MessageSquare, MousePointer2 } from 'lucide-react';

const featuredProjects = [
  {
    title: "Readme Architect AI",
    description: "SaaS app generating professional GitHub READMEs with Google Gemini AI. Shipped GitHub OAuth, private repo support, JWT auth, dynamic sitemap, and Google Analytics.",
    tech: ["Next.js", "TypeScript", "Gemini API", "PostgreSQL", "Tailwind"],
    github: "https://github.com/Deepender25/Readme-Architect-AI",
    live: "https://readmearchitect.vercel.app",
    icon: FileText
  },
  {
    title: "Campus Chatbot",
    description: "AI-powered multilingual chatbot (Multilingual) for campus information. Features Gemini LLM, dynamic knowledge base, Telegram/web interfaces, and a secure admin dashboard.",
    tech: ["Next.js", "React", "Flask", "Python", "Supabase", "ChromaDB", "Gemini API", "LangChain"],
    github: "https://github.com/Deepender25/Campus_Chatbot",
    live: "#",
    icon: MessageSquare
  },
  {
    title: "CursorViaCam",
    description: "AI-powered head tracking mouse control system for hands-free computer interaction — designed to assist users with motor impairments.",
    tech: ["Python", "PyQt6", "OpenCV", "Mediapipe", "PyAutoGUI", "NumPy", "Pywin32"],
    github: "https://github.com/Deepender25/CursorViaCam",
    live: "#",
    icon: MousePointer2
  },
  {
    title: "Buddy",
    description: "AI text assistant for Android — type /fix, /formal, /reply or any custom trigger at the end of text in any app, and Buddy rewrites it instantly using Gemini or any OpenAI-compatible provider.",
    tech: ["Kotlin", "Python", "Jetpack Compose", "Coroutines", "AES-256-GCM"],
    github: "https://github.com/Deepender25/Buddy",
    live: "#",
    icon: Bot
  },
  {
    title: "AI-Attendance",
    description: "An AI-powered attendance tracker that turns uploaded schedules into a beautiful, interactive dashboard for managing your classes.",
    tech: ["React 19", "TypeScript", "Tailwind", "Express.js", "Gemini API", "Python"],
    github: "https://github.com/Deepender25/AI-Attendance",
    live: "https://attendsight.vercel.app/login",
    icon: CalendarCheck
  },
  {
    title: "Presenta",
    description: "Create stunning video mockups and screenshots with professional device frames and smooth scrolling animations directly in your browser.",
    tech: ["Python", "FastAPI", "Vanilla JS", "HTML5 Canvas", "Vercel"],
    github: "https://github.com/Deepender25/Presenta",
    live: "https://presenta-studio.vercel.app",
    icon: MonitorPlay
  },
  {
    title: "AI-news-Automation",
    description: "Automated AI news aggregator that fetches, summarizes, and emails daily tech briefings using Google Gemini AI and Vercel serverless functions.",
    tech: ["Python", "Gemini API", "RSS", "Web Scraping", "Vercel"],
    github: "https://github.com/Deepender25/AI-news-Automation",
    live: "#",
    icon: Newspaper
  },
  {
    title: "Video-to-Shorts",
    description: "Converts long-form videos into short-form video content with AI-generated subtitles. Features a frontend powered by Gemini API for intelligent content analysis and automatic subtitle generation.",
    tech: ["React", "TypeScript", "Python", "Flask", "Whisper", "FFmpeg", "Gemini API"],
    github: "https://github.com/Deepender25/Video-to-Shorts",
    live: "#",
    icon: Scissors
  },
  {
    title: "Sub-Gen",
    description: "AI-powered video subtitle generation tool that automatically transcribes and generates subtitles using speech-to-text technology. Supports multiple languages including Hindi and Hinglish.",
    tech: ["React", "TypeScript", "Python", "Flask", "Whisper", "FFmpeg", "Gemini API"],
    github: "https://github.com/Deepender25/Sub-Gen",
    live: "#",
    icon: Subtitles
  }
];

export default function Projects() {
  return (
    <section id="projects" className="px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-2">04 // Projects</h2>
          <h3 className="text-4xl font-display font-medium tracking-tight text-gradient">Selected Works</h3>
        </div>
        <a href="https://github.com/Deepender25" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-mono text-white/60 hover:text-white transition-colors">
          View all on GitHub <ArrowRight size={14} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {featuredProjects.map((project, index) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-panel p-8 rounded-3xl flex flex-col h-full group"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors shadow-lg">
                  <Icon size={24} className="text-white/70 group-hover:text-white transition-colors" />
                </div>
                <div className="flex gap-2 shrink-0">
                  {project.github !== "#" && (
                    <a href={project.github} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                      <Github size={18} />
                    </a>
                  )}
                  {project.live !== "#" && (
                    <a href={project.live} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-display font-medium tracking-tight mb-4">{project.title}</h3>
              <p className="text-white/60 font-light leading-relaxed mb-8 text-sm flex-grow">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tech.map((tech, i) => (
                  <span key={i} className="text-[10px] font-mono text-white/50 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
