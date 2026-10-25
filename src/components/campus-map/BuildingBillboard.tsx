import React from "react";
import { X, Users, Building, GraduationCap, Trophy, Coffee, Home, Cpu } from "lucide-react";
import { BuildingData } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";

interface BuildingBillboardProps {
  building: BuildingData | null;
  screenPosition: { x: number; y: number } | null;
  language: Language;
  onClose: () => void;
}

const getCategoryIcon = (category: BuildingData["category"]) => {
  switch (category) {
    case "administration":
      return <Building className="w-4 h-4 text-amber-500" />;
    case "education":
      return <GraduationCap className="w-4 h-4 text-primary" />;
    case "sports":
      return <Trophy className="w-4 h-4 text-emerald-500" />;
    case "dining":
      return <Coffee className="w-4 h-4 text-orange-500" />;
    case "dormitory":
      return <Home className="w-4 h-4 text-indigo-500" />;
    case "technology":
      return <Cpu className="w-4 h-4 text-cyan-500" />;
    default:
      return <Building className="w-4 h-4 text-primary" />;
  }
};

export const BuildingBillboard: React.FC<BuildingBillboardProps> = ({
  building,
  screenPosition,
  language,
  onClose,
}) => {
  if (!building || !screenPosition) return null;

  const info = building.locales[language] || building.locales.uz;

  return (
    <div
      className="pointer-events-auto absolute z-40 w-[320px] sm:w-[360px] transform -translate-x-1/2 -translate-y-full pb-3 transition-opacity duration-200"
      style={{
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-background/85 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/90">
        {/* Glow indicator header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Yopish"
          className="absolute top-3.5 right-3.5 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Category & Capacity Header */}
        <div className="flex flex-wrap items-center gap-2 mb-2 pr-6">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {getCategoryIcon(building.category)}
            {info.categoryName}
          </span>
          {info.capacity && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              <Users className="w-3 h-3 text-secondary" />
              {info.capacity}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug mb-2">
          {info.title}
        </h3>

        {/* Description */}
        {info.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
            {info.description}
          </p>
        )}

        {/* Departments / Key Divisions */}
        {info.departments && info.departments.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {language === "ru"
                ? "Отделы и направления:"
                : language === "en"
                ? "Key Departments & Facilities:"
                : "Tarkibiy bo'lim va yo'nalishlar:"}
            </span>
            <ul className="space-y-1 max-h-36 overflow-y-auto pr-1 text-xs text-foreground/90 custom-scrollbar">
              {info.departments.map((dept, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-tight">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{dept}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
