import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Minimize2,
  HelpCircle,
} from "lucide-react";
import { Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import { MAP_I18N } from "./constants";

interface MapHeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onResetCamera: () => void;
  onOpenGuide: () => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  language,
  onLanguageChange,
  onResetCamera,
  onOpenGuide,
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
    <header className="flex items-center justify-between gap-2 w-full max-w-7xl mx-auto">
      {/* Left Pill: Back button & Kokand University Branding */}
      <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 glass-card rounded-2xl px-3 py-2 shadow-lg border border-border/60 bg-card/85 backdrop-blur-xl">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors pr-2 sm:pr-3 border-r border-border/60"
          title={MAP_I18N.home[language]}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{MAP_I18N.home[language]}</span>
        </Link>

        <div className="flex items-center gap-2">
          <img
            src={logoSrc}
            alt="Kokand University logo"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold text-primary leading-tight">
              Kokand University
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:block leading-none">
              {MAP_I18N.title[language]}
            </span>
          </div>
          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            3D
          </span>
        </div>
      </div>

      {/* Right Pill: Control Actions */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 glass-card rounded-2xl p-1.5 shadow-lg border border-border/60 bg-card/85 backdrop-blur-xl">
        {/* Language Switcher */}
        <div className="flex items-center rounded-xl bg-muted/60 p-0.5 text-[11px] font-semibold">
          {(["uz", "ru", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              type="button"
              className={`px-2 py-1 rounded-lg uppercase transition-all ${
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

        {/* Reset Camera */}
        <button
          onClick={onResetCamera}
          type="button"
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          title={MAP_I18N.resetCamera[language]}
          aria-label={MAP_I18N.resetCamera[language]}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Help guide modal trigger */}
        <button
          onClick={onOpenGuide}
          type="button"
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
          title={MAP_I18N.navigationHelp[language]}
          aria-label={MAP_I18N.navigationHelp[language]}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          type="button"
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all hidden sm:inline-flex"
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
    </header>
  );
};
