import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Minimize2,
  HelpCircle,
  Building2,
  GraduationCap,
  Trophy,
  Coffee,
  Home,
  Cpu,
  Layers,
} from "lucide-react";
import { BUILDINGS_DATA } from "@/data/buildings";
import { BuildingKey } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";

interface MapControlsOverlayProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedBuildingKey: BuildingKey | null;
  onSelectBuilding: (key: BuildingKey) => void;
  onResetCamera: () => void;
  isLoading: boolean;
  loadProgress: number;
}

export const MapControlsOverlay: React.FC<MapControlsOverlayProps> = ({
  language,
  onLanguageChange,
  selectedBuildingKey,
  onSelectBuilding,
  onResetCamera,
  isLoading,
  loadProgress,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const getBuildingIcon = (key: BuildingKey) => {
    switch (key) {
      case "building_a":
        return <Building2 className="w-3.5 h-3.5" />;
      case "building_b":
      case "building_c":
      case "building_d":
      case "akm":
        return <GraduationCap className="w-3.5 h-3.5" />;
      case "gym":
        return <Trophy className="w-3.5 h-3.5" />;
      case "dining_room":
        return <Coffee className="w-3.5 h-3.5" />;
      case "dormitory_1":
      case "dormitory_2":
        return <Home className="w-3.5 h-3.5" />;
      case "it_academy":
        return <Cpu className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md transition-opacity duration-500">
          <div className="flex flex-col items-center max-w-xs w-full px-6 text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <img
                src="/ku-white.png"
                alt="Kokand University"
                className="absolute w-12 h-12 object-contain"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {language === "ru"
                  ? "Загрузка 3D Кампуса"
                  : language === "en"
                  ? "Loading 3D Campus"
                  : "3D Kampus yuklanmoqda"}
              </h3>
              <p className="text-xs text-slate-300">
                {language === "ru"
                  ? "Интерактивная карта Кокандского университета"
                  : language === "en"
                  ? "Interactive Map of Kokand University"
                  : "Qo'qon universiteti interaktiv xaritasi"}
              </p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(loadProgress, 12)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-400">
              {loadProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="flex items-center justify-between gap-2 w-full">
        {/* Back Button & Title */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl px-3 py-2 shadow-lg">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors pr-2 border-r border-border/60"
            title={
              language === "ru"
                ? "На главную"
                : language === "en"
                ? "Back to Home"
                : "Bosh sahifa"
            }
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === "ru"
                ? "Bosh sahifaga"
                : language === "en"
                ? "Home"
                : "Bosh sahifa"}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xs sm:text-sm font-bold text-foreground">
              {language === "ru"
                ? "3D Кампус"
                : language === "en"
                ? "3D Campus"
                : "3D Kampus"}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-background/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-1.5 shadow-lg">
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

          {/* Reset Camera */}
          <button
            onClick={onResetCamera}
            type="button"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            title={
              language === "ru"
                ? "Сбросить камеру"
                : language === "en"
                ? "Reset Camera"
                : "Kamerani tiklash"
            }
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Guide toggle */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            type="button"
            className={`p-2 rounded-xl transition-all ${
              showGuide
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
            title={
              language === "ru"
                ? "Инструкция"
                : language === "en"
                ? "Help guide"
                : "Qo'llanma"
            }
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            type="button"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            title={
              language === "ru"
                ? "Полный экран"
                : language === "en"
                ? "Fullscreen"
                : "To'liq ekran"
            }
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Guide Card (Floating Onboarding) */}
      {showGuide && !isLoading && (
        <div className="pointer-events-auto self-center max-w-sm rounded-2xl border border-white/20 bg-background/80 dark:bg-slate-900/80 p-3.5 backdrop-blur-xl shadow-2xl transition-all animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              {language === "ru"
                ? "Как управлять картой"
                : language === "en"
                ? "Navigation Controls"
                : "Xaritani boshqarish"}
            </span>
            <button
              onClick={() => setShowGuide(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/40">
              <img
                src="/map-assets/mouse-lmb.svg"
                alt="LMB"
                className="w-5 h-5 dark:invert"
              />
              <span>
                {language === "ru"
                  ? "ЛКМ: Вращение"
                  : language === "en"
                  ? "Left Click: Rotate"
                  : "Chap tugma: Aylantirish"}
              </span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/40">
              <img
                src="/map-assets/mouse-rmb.svg"
                alt="RMB"
                className="w-5 h-5 dark:invert"
              />
              <span>
                {language === "ru"
                  ? "ПКМ: Смещение"
                  : language === "en"
                  ? "Right Click: Pan"
                  : "O'ng tugma: Siljitish"}
              </span>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-center text-muted-foreground/80">
            {language === "ru"
              ? "💡 Нажмите на любое здание, чтобы узнать подробности"
              : language === "en"
              ? "💡 Click on any building to view details"
              : "💡 Tafsilotlarni ko'rish uchun istalgan binoni bosing"}
          </p>
        </div>
      )}

      {/* Bottom Building Selector Dock */}
      <footer className="pointer-events-auto w-full max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/20 dark:border-white/10 bg-background/80 dark:bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
            {Object.keys(BUILDINGS_DATA).map((key) => {
              const bKey = key as BuildingKey;
              const building = BUILDINGS_DATA[bKey];
              const isSelected = selectedBuildingKey === bKey;
              const title =
                building.locales[language]?.title || building.locales.uz.title;
              const shortTitle = title.split("(")[0].trim();

              return (
                <button
                  key={key}
                  onClick={() => onSelectBuilding(bKey)}
                  type="button"
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted/50 text-foreground/80 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {getBuildingIcon(bKey)}
                  <span>{shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
};
