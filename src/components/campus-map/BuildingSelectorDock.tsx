import React, { useEffect, useRef } from "react";
import { BUILDINGS_DATA } from "@/data/buildings";
import { BuildingKey } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";
import { getBuildingIcon } from "./constants";

export interface BuildingSelectorDockProps {
  language: Language;
  selectedBuildingKey: BuildingKey | null;
  onSelectBuilding: (key: BuildingKey) => void;
  onFocusBuilding?: () => void;
}

export const BuildingSelectorDock: React.FC<BuildingSelectorDockProps> = ({
  language,
  selectedBuildingKey,
  onSelectBuilding,
  onFocusBuilding,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<BuildingKey, HTMLButtonElement>>(new Map());

  const buildingKeys = Object.keys(BUILDINGS_DATA) as BuildingKey[];

  // Automatically scroll active building into view
  useEffect(() => {
    if (selectedBuildingKey && buttonRefs.current.has(selectedBuildingKey)) {
      const activeBtn = buttonRefs.current.get(selectedBuildingKey);
      activeBtn?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedBuildingKey]);

  // Smooth wheel horizontal scrolling on desktop
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (containerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      containerRef.current.scrollLeft += e.deltaY * 0.8;
    }
  };

  return (
    <footer className="pointer-events-auto w-full max-w-4xl mx-auto px-1 sm:px-0 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <div className="rounded-2xl border border-border/80 bg-card text-card-foreground p-1 sm:p-1.5 shadow-2xl">
        <div
          ref={containerRef}
          onWheel={handleWheel}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth touch-pan-x overscroll-x-contain [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-8px),transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-8px),transparent)] sm:[-webkit-mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]"
        >
          {buildingKeys.map((key) => {
            const building = BUILDINGS_DATA[key];
            const isSelected = selectedBuildingKey === key;
            const Icon = getBuildingIcon(key);
            const title = building.locales[language]?.title || building.locales.uz.title;
            // Short title, e.g. "A-bino", "AKM", "IT Academy"
            const shortTitle = title.split("(")[0].trim();

            const handleClick = () => {
              if (isSelected && onFocusBuilding) {
                onFocusBuilding();
              } else {
                onSelectBuilding(key);
              }
            };

            return (
              <button
                key={key}
                ref={(el) => {
                  if (el) buttonRefs.current.set(key, el);
                  else buttonRefs.current.delete(key);
                }}
                onClick={handleClick}
                type="button"
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 min-h-[44px] sm:min-h-[36px] rounded-xl text-xs font-semibold transition-all duration-200 select-none active:scale-95 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                      : "bg-muted/40 text-foreground/80 hover:bg-muted hover:text-foreground border border-border/30"
                  }`}
                title={title}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? "text-primary-foreground" : "text-primary"
                  }`}
                />
                <span className="whitespace-nowrap">{shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
