import React from "react";
import { BuildingDetailCard } from "./BuildingDetailCard";
import { BuildingData } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";

export interface BuildingBillboardProps {
  building: BuildingData | null;
  screenPosition?: { x: number; y: number } | null;
  language: Language;
  onClose: () => void;
  onFocus?: () => void;
}

/**
 * Backward-compatible wrapper around BuildingDetailCard.
 * Upgraded from fragile 2D billboard projections to a responsive, accessible glass panel.
 */
export const BuildingBillboard: React.FC<BuildingBillboardProps> = ({
  building,
  language,
  onClose,
  onFocus,
}) => {
  return (
    <BuildingDetailCard
      building={building}
      language={language}
      onClose={onClose}
      onFocus={onFocus}
    />
  );
};

export default BuildingBillboard;
