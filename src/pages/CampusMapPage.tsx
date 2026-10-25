import React, { useState, useCallback } from "react";
import { Campus3DScene } from "@/components/campus-map/Campus3DScene";
import { BuildingDetailCard } from "@/components/campus-map/BuildingDetailCard";
import { MapHeader } from "@/components/campus-map/MapHeader";
import { BuildingSelectorDock } from "@/components/campus-map/BuildingSelectorDock";
import { NavigationGuideModal } from "@/components/campus-map/NavigationGuideModal";
import { CampusMapLoader } from "@/components/campus-map/CampusMapLoader";
import { BUILDINGS_DATA } from "@/data/buildings";
import { BuildingKey } from "@/types/campus-map";
import { useLanguage } from "@/contexts/LanguageContext";

const CampusMapPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [selectedBuildingKey, setSelectedBuildingKey] = useState<BuildingKey | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleLoadingProgress = useCallback((percent: number) => {
    setLoadProgress(percent);
    if (percent >= 100) {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, []);

  const handleBuildingSelect = useCallback((key: BuildingKey | null) => {
    setSelectedBuildingKey(key);
  }, []);

  const handleResetCamera = useCallback(() => {
    setResetSignal((prev) => prev + 1);
    setSelectedBuildingKey(null);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedBuildingKey(null);
  }, []);

  const handleFocusBuilding = useCallback(() => {
    if (selectedBuildingKey) {
      // Re-trigger by nudging reset signal or keeping key
      setSelectedBuildingKey((prev) => (prev ? { ...BUILDINGS_DATA[prev] }.id : null));
    }
  }, [selectedBuildingKey]);

  const activeBuilding = selectedBuildingKey ? BUILDINGS_DATA[selectedBuildingKey] : null;

  return (
    <div className="relative z-20 w-screen h-screen overflow-hidden bg-background font-sans select-none">
      {/* 3D WebGL Canvas */}
      <Campus3DScene
        onBuildingSelect={handleBuildingSelect}
        selectedBuildingKey={selectedBuildingKey}
        onLoadingProgress={handleLoadingProgress}
        resetSignal={resetSignal}
      />

      {/* Brand-Consistent Loading Screen */}
      <CampusMapLoader
        isLoading={isLoading}
        loadProgress={loadProgress}
        language={language}
      />

      {/* UI Overlay Container */}
      <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-6 overflow-hidden">
        {/* Top Header Floating Pill */}
        <MapHeader
          language={language}
          onLanguageChange={setLanguage}
          onResetCamera={handleResetCamera}
          onOpenGuide={() => setIsGuideOpen(true)}
        />

        {/* Selected Building Detail Panel (slides in on selection) */}
        <BuildingDetailCard
          building={activeBuilding}
          language={language}
          onClose={handleCloseDetail}
          onFocus={handleFocusBuilding}
        />

        {/* Bottom Building Selector Dock */}
        <BuildingSelectorDock
          language={language}
          selectedBuildingKey={selectedBuildingKey}
          onSelectBuilding={handleBuildingSelect}
        />
      </div>

      {/* Navigation Guide Modal */}
      <NavigationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        language={language}
      />
    </div>
  );
};

export default CampusMapPage;
