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
import { MAP_I18N } from "./constants";

export interface MapHeaderProps {
  language: Language;
  onResetCamera: () => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({
  language,
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
    <header className="w-full flex items-center justify-between pointer-events-none px-1 sm:px-0">
      {/* Left Capsule: Back Link & University Identity (100% Clickable, Zero Dead Zones) */}
      <Link
        to="/"
        className="pointer-events-auto flex items-center gap-2 sm:gap-2.5 rounded-full bg-card/85 dark:bg-card/80 backdrop-blur-xl border border-border/60 py-1.5 px-3 sm:py-2 sm:px-4 shadow-lg shadow-black/5 hover:border-primary/40 hover:bg-card text-foreground transition-all min-h-[44px] sm:min-h-0 active:scale-95 group"
        title={MAP_I18N.home[language]}
        aria-label={MAP_I18N.home[language]}
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        <img
          src={logoSrc}
          alt="Kokand University"
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-contain shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-bold leading-tight group-hover:text-primary transition-colors truncate">
            Kokand University
          </span>
          <span className="text-[10px] text-muted-foreground hidden md:block leading-none">
            {MAP_I18N.title[language]}
          </span>
        </div>
      </Link>

      {/* Right Capsule: Camera & Screen Controls */}
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-card/85 dark:bg-card/80 backdrop-blur-xl border border-border/60 p-1 sm:p-1.5 shadow-lg shadow-black/5 transition-all">
        {/* Reset Camera View */}
        <button
          onClick={onResetCamera}
          type="button"
          className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all"
          title={MAP_I18N.resetCamera[language]}
          aria-label={MAP_I18N.resetCamera[language]}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen Button (Desktop) */}
        <button
          onClick={toggleFullscreen}
          type="button"
          className="min-w-[40px] min-h-[40px] sm:min-w-[36px] sm:min-h-[36px] items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all hidden sm:inline-flex"
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

