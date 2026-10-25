import React from "react";
import { MapHeader } from "./MapHeader";
import { BuildingSelectorDock } from "./BuildingSelectorDock";
import { CampusMapLoader } from "./CampusMapLoader";
import { BuildingKey } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";

export interface MapControlsOverlayProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  selectedBuildingKey: BuildingKey | null;
  onSelectBuilding: (key: BuildingKey) => void;
  onResetCamera: () => void;
  isLoading: boolean;
  loadProgress: number;
}

/**
 * Backward-compatible facade overlay component composing MapHeader,
 * BuildingSelectorDock, and CampusMapLoader.
 */
export const MapControlsOverlay: React.FC<MapControlsOverlayProps> = ({
  language,
  onLanguageChange,
  selectedBuildingKey,
  onSelectBuilding,
  onResetCamera,
  isLoading,
  loadProgress,
}) => {
  return (
    <>
      <CampusMapLoader
        isLoading={isLoading}
        loadProgress={loadProgress}
        language={language}
      />

      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-6 overflow-hidden">
        <MapHeader
          language={language}
          onLanguageChange={onLanguageChange}
          onResetCamera={onResetCamera}
        />

        <BuildingSelectorDock
          language={language}
          selectedBuildingKey={selectedBuildingKey}
          onSelectBuilding={onSelectBuilding}
        />
      </div>
    </>
  );
};

export default MapControlsOverlay;
