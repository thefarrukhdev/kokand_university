import React, { useRef } from "react";
import { BUILDINGS_DATA } from "@/data/buildings";
import { BuildingKey } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";
import { getBuildingIcon } from "./constants";

interface BuildingSelectorDockProps {
  language: Language;
  selectedBuildingKey: BuildingKey | null;
  onSelectBuilding: (key: BuildingKey) => void;
}

export const BuildingSelectorDock: React.FC<BuildingSelectorDockProps> = ({
  language,
  selectedBuildingKey,
  onSelectBuilding,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const buildingKeys = Object.keys(BUILDINGS_DATA) as BuildingKey[];

  return (
    <footer className="pointer-events-auto w-full max-w-4xl mx-auto px-2 sm:px-0">
      <div className="glass-card rounded-2xl border border-border/60 bg-card/85 p-2 shadow-2xl backdrop-blur-xl">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth"
        >
          {buildingKeys.map((key) => {
            const building = BUILDINGS_DATA[key];
            const isSelected = selectedBuildingKey === key;
            const Icon = getBuildingIcon(key);
            const title = building.locales[language]?.title || building.locales.uz.title;
            // Clean short title, e.g. "A-bino", "AKM", "KU Canteen"
            const shortTitle = title.split("(")[0].trim();

            return (
              <button
                key={key}
                onClick={() => onSelectBuilding(key)}
                type="button"
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 select-none ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.03]"
                    : "bg-muted/40 text-foreground/80 hover:bg-muted hover:text-foreground border border-border/30"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                <span className="whitespace-nowrap">{shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
