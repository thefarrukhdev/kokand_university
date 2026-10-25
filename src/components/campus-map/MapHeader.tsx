import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { MAP_I18N } from "./constants";

export interface MapHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onResetCamera: () => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  language,
  onLanguageChange,
  onResetCamera,
}) => {
  const { theme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const logoSrc = theme === "dark" ? "/ku-white.png" : "/ku-black.png";

  return (
    <header className="w-full flex justify-center">
      {/* Unified Floating Pill matching Kokand University signature Navbar */}
      <nav className="pointer-events-auto flex items-center justify-between w-full max-w-5xl rounded-full bg-card text-card-foreground py-2 px-2.5 sm:py-2.5 sm:px-6 shadow-xl border border-border/80 transition-all">
        {/* Left Side: Back Link & University Identity */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold text-foreground hover:text-primary hover:bg-primary/5 transition-colors shrink-0"
            title={MAP_I18N.home[language]}
            aria-label={MAP_I18N.home[language]}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{MAP_I18N.home[language]}</span>
          </Link>

          <div className="h-4 sm:h-5 w-px bg-border/60 shrink-0" />

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <img
              src={logoSrc}
              alt="Kokand University logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-bold text-primary leading-tight truncate">
                Kokand University
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block leading-none">
                {MAP_I18N.title[language]}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Language Switcher, Theme & Camera Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile compact language toggle (cycles uz -> ru -> en) */}
          <button
            onClick={() => {
              const next: Record<Language, Language> = { uz: "ru", ru: "en", en: "uz" };
              onLanguageChange(next[language]);
            }}
            type="button"
            className="sm:hidden px-2 py-1 rounded-full text-[11px] font-bold uppercase bg-muted/70 text-foreground hover:bg-muted border border-border/60 transition-all flex items-center gap-0.5"
            title="Tilni almashtirish"
            aria-label="Tilni almashtirish"
          >
            <span>{language}</span>
            <span className="text-[9px] text-muted-foreground">▾</span>
          </button>

          {/* Desktop Segmented Language Switcher */}
          <div className="hidden sm:flex items-center rounded-full bg-muted/60 p-0.5 text-[11px] font-semibold border border-border/40">
            {(["uz", "ru", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                type="button"
                className={`px-2 py-0.5 sm:py-1 rounded-full uppercase transition-all ${
                  language === lang
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Reset Camera View */}
          <button
            onClick={onResetCamera}
            type="button"
            className="p-1.5 sm:p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            title={MAP_I18N.resetCamera[language]}
            aria-label={MAP_I18N.resetCamera[language]}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Button (Desktop) */}
          <button
            onClick={toggleFullscreen}
            type="button"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all hidden sm:inline-flex"
            title={MAP_I18N.fullscreen[language]}
            aria-label={MAP_I18N.fullscreen[language]}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};
