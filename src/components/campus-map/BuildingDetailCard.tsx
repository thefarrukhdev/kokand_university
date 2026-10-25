import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BuildingData } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";
import { CATEGORY_META, MAP_I18N } from "./constants";

export interface BuildingDetailCardProps {
  building: BuildingData | null;
  language: Language;
  onClose: () => void;
  onFocus?: () => void;
  onSelectPrev?: () => void;
  onSelectNext?: () => void;
  currentIndex?: number;
  totalBuildings?: number;
}

export const BuildingDetailCard: React.FC<BuildingDetailCardProps> = ({
  building,
  language,
  onClose,
  onSelectPrev,
  onSelectNext,
}) => {
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

    // Detect horizontal swipe across card: > 50px horizontally
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0 && onSelectNext) {
        onSelectNext();
      } else if (deltaX > 0 && onSelectPrev) {
        onSelectPrev();
      }
    }
  };

  const info = building ? building.locales[language] || building.locales.uz : null;
  const categoryConfig = building ? CATEGORY_META[building.category] : null;
  const CategoryIcon = categoryConfig?.icon;
  const isOpen = Boolean(building && info);

  return (
    <AnimatePresence>
      {isOpen && building && info && (
        <motion.div
          key="building-detail-drawer"
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.35 }}
          onDragEnd={(_e, dragInfo) => {
            if (dragInfo.offset.y > 60 || dragInfo.velocity.y > 220) {
              onClose();
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="pointer-events-auto absolute z-40
            bottom-0 left-0 right-0 rounded-t-3xl border-t border-x border-border/80 bg-card/95 dark:bg-card/90 backdrop-blur-xl shadow-2xl p-4 sm:p-5 pb-[max(env(safe-area-inset-bottom),1rem)]
            sm:bottom-auto sm:left-auto sm:right-6 sm:top-20 sm:w-[380px] sm:rounded-2xl sm:border sm:border-border/80 max-h-[65dvh] sm:max-h-[calc(100vh-120px)] flex flex-col overflow-hidden text-card-foreground select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Pull-to-dismiss Handle */}
          <div className="w-full flex items-center justify-center -mt-1 mb-2.5 sm:hidden shrink-0">
            <div className="w-9 h-1 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
          </div>

          {/* Top Bar: Clean Brand Category Badge & Close Button */}
          <div className="flex items-center justify-between gap-2 pb-2.5 shrink-0 border-b border-border/40">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate max-w-[200px] sm:max-w-none">
                {info.categoryName || categoryConfig?.label[language]}
              </span>
            </span>

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
              title={MAP_I18N.close[language]}
              aria-label={MAP_I18N.close[language]}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Building Information */}
          <motion.div
            key={building.id}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col flex-1 min-h-0 pt-3 space-y-3 overflow-y-auto custom-scrollbar"
          >
            {/* Title & Capacity */}
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground">
                {info.title}
              </h2>

              {info.capacity && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                  <span>{info.capacity}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {info.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {info.description}
              </p>
            )}

            {/* Departments & Facilities as Modern Tags */}
            {info.departments && info.departments.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-border/40">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {MAP_I18N.departmentsTitle[language]}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {info.departments.map((dept, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/50 hover:bg-muted/80 text-foreground/90 border border-border/40 transition-colors"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Bottom Navigation: Prev / Next building cycling */}
          {(onSelectPrev || onSelectNext) && (
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/50 text-xs shrink-0">
              <button
                onClick={onSelectPrev}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all text-xs font-medium"
                title={MAP_I18N.prevBuilding[language]}
                aria-label={MAP_I18N.prevBuilding[language]}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{MAP_I18N.prevBuilding[language]}</span>
              </button>

              <button
                onClick={onSelectNext}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-95 transition-all text-xs font-medium"
                title={MAP_I18N.nextBuilding[language]}
                aria-label={MAP_I18N.nextBuilding[language]}
              >
                <span>{MAP_I18N.nextBuilding[language]}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
