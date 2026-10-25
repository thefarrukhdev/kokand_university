export type BuildingKey =
  | 'akm'
  | 'building_a'
  | 'building_b'
  | 'building_c'
  | 'building_d'
  | 'gym'
  | 'dining_room'
  | 'dormitory_1'
  | 'dormitory_2'
  | 'it_academy';

export type BuildingCategory =
  | 'administration'
  | 'education'
  | 'sports'
  | 'dining'
  | 'dormitory'
  | 'technology';

export interface BuildingLocalizedInfo {
  title: string;
  categoryName: string;
  capacity?: string;
  departments: string[];
  description?: string;
}

export interface BuildingData {
  id: BuildingKey;
  category: BuildingCategory;
  offsetY: number;
  cameraOffset?: { x: number; y: number; z: number };
  locales: {
    uz: BuildingLocalizedInfo;
    ru: BuildingLocalizedInfo;
    en: BuildingLocalizedInfo;
  };
}
