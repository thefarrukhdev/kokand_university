import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { MAP_I18N } from "./constants";

interface CampusMapLoaderProps {
  isLoading: boolean;
  loadProgress: number;
  language: Language;
}

export const CampusMapLoader: React.FC<CampusMapLoaderProps> = ({
  isLoading,
  loadProgress,
  language,
}) => {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/ku-white.png" : "/ku-black.png";

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 dark:bg-slate-950/85 backdrop-blur-md"
        >
          <div className="flex flex-col items-center max-w-xs w-full px-6 text-center space-y-4">
            {/* Spinning Brand Badge */}
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <img
                src={logoSrc}
                alt="Kokand University"
                className="absolute w-11 h-11 object-contain"
              />
            </div>

            {/* Typography */}
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-foreground tracking-wide">
                {MAP_I18N.loadingTitle[language]}
              </h3>
              <p className="text-xs text-muted-foreground">
                {MAP_I18N.loadingSubtitle[language]}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted/60 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden border border-border/40">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(loadProgress, 10)}%` }}
              />
            </div>

            <span className="text-xs font-mono text-muted-foreground">
              {loadProgress}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
