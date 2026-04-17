import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Loader2, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIframeLoaded(false); // reset loader each time modal opens
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Use the full absolute URL so the iframe src is unambiguous
  const pdfUrl = `${window.location.origin}/resume.pdf`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ willChange: "opacity" }}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl h-[88vh] glass-panel-strong rounded-2xl overflow-hidden flex flex-col"
            style={{ willChange: "transform, opacity" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 shrink-0">
              <h3 className="text-xl font-display font-medium text-white">Resume</h3>
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors"
                >
                  <ExternalLink size={15} />
                  <span className="hidden sm:inline">Open in Tab</span>
                </a>
                <a
                  href={pdfUrl}
                  download="Deepender_Yadav_Resume.pdf"
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="relative flex-1 w-full overflow-hidden bg-neutral-900">
              {/* Loading Spinner */}
              {!iframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/40 z-10">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm">Loading resume…</p>
                </div>
              )}

              {/* Direct iframe — most browser-compatible approach */}
              <iframe
                key={isOpen ? 'open' : 'closed'}
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                onLoad={() => setIframeLoaded(true)}
                className="w-full h-full border-none"
                title="Deepender Yadav — Resume"
                style={{ display: iframeLoaded ? 'block' : 'none' }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
