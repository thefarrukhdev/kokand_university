import React, { useState, useCallback } from "react";
import { Campus3DScene } from "@/components/campus-map/Campus3DScene";
import { BuildingBillboard } from "@/components/campus-map/BuildingBillboard";
import { MapControlsOverlay } from "@/components/campus-map/MapControlsOverlay";
import { BUILDINGS_DATA } from "@/data/buildings";
import { BuildingKey } from "@/types/campus-map";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const CampusMapPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [selectedBuildingKey, setSelectedBuildingKey] = useState<BuildingKey | null>(null);
  const [screenPosition, setScreenPosition] = useState<{ x: number; y: number } | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);

  const handleLoadingProgress = useCallback((percent: number) => {
    setLoadProgress(percent);
    if (percent >= 100) {
      setTimeout(() => setIsLoading(false), 400);
    }
  }, []);

  const handleBuildingSelect = useCallback((key: BuildingKey | null) => {
    setSelectedBuildingKey(key);
    if (!key) {
      setScreenPosition(null);
    }
  }, []);

  const handleScreenPositionChange = useCallback((pos: { x: number; y: number } | null) => {
    setScreenPosition(pos);
  }, []);

  const handleResetCamera = useCallback(() => {
    setResetSignal((prev) => prev + 1);
  }, []);

  const handleCloseBillboard = useCallback(() => {
    setSelectedBuildingKey(null);
    setScreenPosition(null);
  }, []);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
  }, [setLanguage]);

  const activeBuilding = selectedBuildingKey ? BUILDINGS_DATA[selectedBuildingKey] : null;

  return (
    <div className="relative z-20 w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas */}
      <Campus3DScene
        onBuildingSelect={handleBuildingSelect}
        selectedBuildingKey={selectedBuildingKey}
        onScreenPositionChange={handleScreenPositionChange}
        onLoadingProgress={handleLoadingProgress}
        resetSignal={resetSignal}
      />

      {/* Floating 3D Billboard Anchor */}
      <BuildingBillboard
        building={activeBuilding}
        screenPosition={screenPosition}
        language={language}
        onClose={handleCloseBillboard}
      />

      {/* UI Controls Overlay (Top bar, Bottom Selector Dock, Guide, Loader) */}
      <MapControlsOverlay
        language={language}
        onLanguageChange={handleLanguageChange}
        selectedBuildingKey={selectedBuildingKey}
        onSelectBuilding={handleBuildingSelect}
        onResetCamera={handleResetCamera}
        isLoading={isLoading}
        loadProgress={loadProgress}
      />
    </div>
  );
};

export default CampusMapPage;
