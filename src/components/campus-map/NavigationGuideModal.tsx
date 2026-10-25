import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MousePointer2, Move, ZoomIn, Smartphone } from "lucide-react";
import { Language } from "@/contexts/LanguageContext";
import { MAP_I18N } from "./constants";

interface NavigationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const NavigationGuideModal: React.FC<NavigationGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                {MAP_I18N.navigationHelp[language]}
              </h3>
              <button
                onClick={onClose}
                type="button"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guide List */}
            <div className="space-y-4 py-4 text-xs text-foreground">
              {/* Desktop controls */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Desktop (Mouse)
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                    <MousePointer2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{MAP_I18N.instructions.mouseRotate[language]}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                    <Move className="w-4 h-4 text-secondary shrink-0" />
                    <span>{MAP_I18N.instructions.mousePan[language]}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                    <ZoomIn className="w-4 h-4 text-accent shrink-0" />
                    <span>{MAP_I18N.instructions.mouseZoom[language]}</span>
                  </div>
                </div>
              </div>

              {/* Mobile controls */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Mobile / Touch
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                    <Smartphone className="w-4 h-4 text-primary shrink-0" />
                    <span>{MAP_I18N.instructions.touchRotate[language]}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                    <Move className="w-4 h-4 text-secondary shrink-0" />
                    <span>{MAP_I18N.instructions.touchPan[language]}</span>
                  </div>
                </div>
              </div>

              {/* Hint */}
              <p className="text-[11px] text-muted-foreground bg-primary/5 border border-primary/15 rounded-xl p-3 text-center">
                💡 {MAP_I18N.instructions.tapHint[language]}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
              >
                {MAP_I18N.instructions.gotIt[language]}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
