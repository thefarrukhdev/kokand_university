import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Crosshair } from "lucide-react";
import { BuildingData } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";
import { CATEGORY_META, MAP_I18N } from "./constants";

export interface BuildingDetailCardProps {
  building: BuildingData | null;
  language: Language;
  onClose: () => void;
  onFocus?: () => void;
}

export const BuildingDetailCard: React.FC<BuildingDetailCardProps> = ({
  building,
  language,
  onClose,
  onFocus,
}) => {
  // Listen for Escape key to close the drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const info = building ? building.locales[language] || building.locales.uz : null;
  const categoryConfig = building ? CATEGORY_META[building.category] : null;
  const CategoryIcon = categoryConfig?.icon;

  return (
    <AnimatePresence mode="wait">
      {building && info && (
        <motion.div
          key={building.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="pointer-events-auto absolute z-40 bottom-[calc(env(safe-area-inset-bottom,0px)+4.5rem)] left-2.5 right-2.5 sm:bottom-auto sm:left-auto sm:right-6 sm:top-24 w-auto sm:w-96 max-h-[50vh] sm:max-h-[calc(100vh-160px)] flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Mobile Grab Indicator Handle */}
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-2 sm:hidden shrink-0" />

          {/* Brand Accent Top Line */}
          <div className="hidden sm:block absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-accent" />

          {/* Card Header */}
          <div className="flex items-start justify-between p-4 sm:p-5 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  categoryConfig?.badgeClass || "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                {info.categoryName || categoryConfig?.label[language]}
              </span>

              {info.capacity && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/40">
                  <Users className="w-3 h-3 text-secondary" />
                  <span>{info.capacity}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {onFocus && (
                <button
                  onClick={onFocus}
                  type="button"
                  className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={MAP_I18N.focusBuilding[language]}
                  aria-label={MAP_I18N.focusBuilding[language]}
                >
                  <Crosshair className="w-4 h-4 text-primary" />
                </button>
              )}

              <button
                onClick={onClose}
                type="button"
                className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Yopish"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Scrollable Area */}
          <div className="px-4 sm:px-5 pb-5 overflow-y-auto space-y-3 text-foreground custom-scrollbar">
            {/* Building Title */}
            <h2 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground">
              {info.title}
            </h2>

            {/* Description */}
            {info.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {info.description}
              </p>
            )}

            {/* Departments & Divisions */}
            {info.departments && info.departments.length > 0 && (
              <div className="space-y-2 pt-2.5 border-t border-border/60">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  {MAP_I18N.departmentsTitle[language]}
                </span>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {info.departments.map((dept, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{dept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
