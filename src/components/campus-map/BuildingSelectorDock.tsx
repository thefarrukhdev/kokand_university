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
    <footer className="pointer-events-auto w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="glass-card rounded-2xl border border-border/60 bg-card/85 p-1.5 sm:p-2 shadow-2xl backdrop-blur-xl">
        <div
          ref={containerRef}
          onWheel={handleWheel}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]"
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
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none ${
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
