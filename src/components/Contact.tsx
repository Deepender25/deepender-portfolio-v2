import React, { useRef, useState } from 'react';
import portfolioData from '../data/portfolio.json';
import { ArrowRight, CheckCircle2, Github, Linkedin, Mail, Phone, XCircle } from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  message: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function Contact() {
  const container = useRef<HTMLElement>(null);
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send. Please try again.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="contact" ref={container} className="px-6 md:px-12 max-w-7xl mx-auto w-full relative z-[60]">
      <div className="contact-container-wrapper">
        <div className="contact-card glass-panel-strong rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
            <div>
              <p className="contact-label text-sm font-mono uppercase tracking-[0.2em] text-white/40 mb-4" aria-hidden="true">05 // Contact</p>
              <h2 className="contact-heading text-4xl md:text-6xl font-display font-medium tracking-tight mb-6 text-gradient">
                Let's build<br/>together.
              </h2>
              <p className="contact-subtext text-white/60 font-light text-lg mb-12 max-w-md">
                {portfolioData.contact.text}
              </p>

              <div className="flex flex-col gap-6">
                <a href={`mailto:${portfolioData.contact.email}`} className="contact-link flex items-center gap-3 md:gap-4 text-white/80 hover:text-white transition-colors group w-full md:w-fit">
                  <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full glass-pill flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Mail size={18} />
                  </div>
                  <span className="font-light text-sm md:text-lg break-all md:break-normal">{portfolioData.contact.email}</span>
                </a>
                <a href={`tel:${portfolioData.contact.phone.replace(/\s+/g, '')}`} className="contact-link flex items-center gap-3 md:gap-4 text-white/80 hover:text-white transition-colors group w-full md:w-fit">
                  <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full glass-pill flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Phone size={18} />
                  </div>
                  <span className="font-light text-sm md:text-lg break-all md:break-normal">{portfolioData.contact.phone}</span>
                </a>
                <a href={portfolioData.contact.linkedinUrl} target="_blank" rel="noreferrer" className="contact-link flex items-center gap-3 md:gap-4 text-white/80 hover:text-white transition-colors group w-full md:w-fit">
                  <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full glass-pill flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Linkedin size={18} />
                  </div>
                  <span className="font-light text-sm md:text-lg break-all md:break-normal">{portfolioData.contact.linkedin}</span>
                </a>
              </div>
            </div>

            <div className="contact-form-panel glass-panel p-8 md:p-10 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  {/* Name */}
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="peer w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-transparent focus:outline-none focus:border-white transition-colors"
                      placeholder="Name"
                    />
                    <label htmlFor="name" className="absolute left-0 top-3 text-white/40 text-sm font-light transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white/60 peer-valid:-top-4 peer-valid:text-xs peer-valid:text-white/60">
                      Your Name
                    </label>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="peer w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-transparent focus:outline-none focus:border-white transition-colors"
                      placeholder="Email"
                    />
                    <label htmlFor="email" className="absolute left-0 top-3 text-white/40 text-sm font-light transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white/60 peer-valid:-top-4 peer-valid:text-xs peer-valid:text-white/60">
                      Your Email
                    </label>
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <textarea
                      id="message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={handleChange}
                      className="peer w-full bg-transparent border-b border-white/20 py-3 text-white placeholder-transparent focus:outline-none focus:border-white transition-colors resize-none"
                      placeholder="Message"
                    ></textarea>
                    <label htmlFor="message" className="absolute left-0 top-3 text-white/40 text-sm font-light transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-white/60 peer-valid:-top-4 peer-valid:text-xs peer-valid:text-white/60">
                      Message
                    </label>
                  </div>
                </div>

                {status === 'success' && (
                  <div className="flex items-center gap-2 text-green-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={16} />
                    Message sent! I'll get back to you soon.
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <XCircle size={16} />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full flex justify-center items-center gap-2 bg-white text-black px-8 py-4 rounded-xl text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {status === 'idle' && <><span>Send Message</span><ArrowRight size={16} /></>}
                  {status === 'submitting' && (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Sending…
                    </span>
                  )}
                  {status === 'success' && 'Sent!'}
                  {status === 'error' && 'Try Again'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
