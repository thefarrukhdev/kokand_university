import React from "react";
import {
  Building2,
  GraduationCap,
  Trophy,
  Coffee,
  Home,
  Cpu,
  Layers,
} from "lucide-react";
import { BuildingCategory, BuildingKey } from "@/types/campus-map";
import { Language } from "@/contexts/LanguageContext";

export interface CategoryMeta {
  label: Record<Language, string>;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
}

export const CATEGORY_META: Record<BuildingCategory, CategoryMeta> = {
  administration: {
    label: {
      uz: "Ma'muriyat",
      ru: "Администрация",
      en: "Administration",
    },
    icon: Building2,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  education: {
    label: {
      uz: "Ta'lim va Fan",
      ru: "Образование и Наука",
      en: "Education & Science",
    },
    icon: GraduationCap,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  sports: {
    label: {
      uz: "Sport",
      ru: "Спорт",
      en: "Sports & Athletics",
    },
    icon: Trophy,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  dining: {
    label: {
      uz: "Oshxona va Kafe",
      ru: "Питание и Кафе",
      en: "Dining & Cafe",
    },
    icon: Coffee,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  dormitory: {
    label: {
      uz: "Yotoqxona",
      ru: "Общежитие",
      en: "Residence Hall",
    },
    icon: Home,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  technology: {
    label: {
      uz: "Axborot texnologiyalari",
      ru: "Информационные технологии",
      en: "Information Technology",
    },
    icon: Cpu,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
};

export const BUILDING_CATEGORY_MAP: Record<BuildingKey, BuildingCategory> = {
  akm: "education",
  building_a: "administration",
  building_b: "education",
  building_c: "education",
  building_d: "education",
  gym: "sports",
  dining_room: "dining",
  dormitory_1: "dormitory",
  dormitory_2: "dormitory",
  it_academy: "technology",
};

export const BUILDING_SHORT_TITLES: Record<BuildingKey, Record<Language, string>> = {
  akm: {
    uz: "AKM",
    ru: "ИБЦ",
    en: "ILC",
  },
  building_a: {
    uz: "A-bino",
    ru: "Корпус А",
    en: "Building A",
  },
  building_b: {
    uz: "B-bino",
    ru: "Корпус B",
    en: "Building B",
  },
  building_c: {
    uz: "C-bino",
    ru: "Корпус C",
    en: "Building C",
  },
  building_d: {
    uz: "D-bino",
    ru: "Корпус D",
    en: "Building D",
  },
  gym: {
    uz: "Sport zali",
    ru: "Спортзал",
    en: "Gym",
  },
  dining_room: {
    uz: "Oshxona",
    ru: "Столовая",
    en: "Canteen",
  },
  dormitory_1: {
    uz: "Yotoqxona ♀",
    ru: "Общежитие ♀",
    en: "Dorm ♀",
  },
  dormitory_2: {
    uz: "Yotoqxona ♂",
    ru: "Общежитие ♂",
    en: "Dorm ♂",
  },
  it_academy: {
    uz: "IT Akademiya",
    ru: "IT Академия",
    en: "IT Academy",
  },
};

export const getBuildingIcon = (key: BuildingKey): React.ComponentType<{ className?: string }> => {
  const category = BUILDING_CATEGORY_MAP[key];
  return CATEGORY_META[category]?.icon || Layers;
};

export const MAP_I18N = {
  title: {
    uz: "3D Kampus",
    ru: "3D Кампус",
    en: "3D Campus",
  },
  subtitle: {
    uz: "Qo'qon universiteti interaktiv xaritasi",
    ru: "Интерактивная карта Кокандского университета",
    en: "Interactive Map of Kokand University",
  },
  home: {
    uz: "Bosh sahifa",
    ru: "На главную",
    en: "Home",
  },
  allBuildings: {
    uz: "Barcha binolar",
    ru: "Все здания",
    en: "All Buildings",
  },
  focusBuilding: {
    uz: "Kamerani qaratish",
    ru: "Фокусировать камеру",
    en: "Focus Camera",
  },
  resetCamera: {
    uz: "Kamerani tiklash",
    ru: "Сбросить камеру",
    en: "Reset View",
  },
  navigationHelp: {
    uz: "Xaritani boshqarish",
    ru: "Управление картой",
    en: "Navigation Guide",
  },
  fullscreen: {
    uz: "To'liq ekran",
    ru: "Полный экран",
    en: "Fullscreen",
  },
  departmentsTitle: {
    uz: "Tarkibiy bo'lim va yo'nalishlar:",
    ru: "Отделы и направления:",
    en: "Key Departments & Facilities:",
  },
  loadingTitle: {
    uz: "3D Kampus yuklanmoqda",
    ru: "Загрузка 3D Кампуса",
    en: "Loading 3D Campus",
  },
  loadingSubtitle: {
    uz: "Qo'qon Universiteti interaktiv 3D modeli tayyorlanmoqda...",
    ru: "Подготовка интерактивной 3D модели университета...",
    en: "Initializing university interactive 3D model...",
  },
  moreDetails: {
    uz: "Batafsil",
    ru: "Подробнее",
    en: "Details",
  },
  lessDetails: {
    uz: "Kamroq",
    ru: "Свернуть",
    en: "Less",
  },
  prevBuilding: {
    uz: "Oldingi bino",
    ru: "Предыдущее здание",
    en: "Previous Building",
  },
  nextBuilding: {
    uz: "Keyingi bino",
    ru: "Следующее здание",
    en: "Next Building",
  },
  close: {
    uz: "Yopish",
    ru: "Закрыть",
    en: "Close",
  },
  instructions: {
    mouseRotate: {
      uz: "Sichqonchaning chap tugmasi: Aylantirish",
      ru: "Левая кнопка мыши: Вращение",
      en: "Left Click Drag: Rotate view",
    },
    mousePan: {
      uz: "Sichqonchaning o'ng tugmasi: Siljitish",
      ru: "Правая кнопка мыши: Панорамирование",
      en: "Right Click Drag: Pan camera",
    },
    mouseZoom: {
      uz: "G'ildirak: Yaqinlashtirish / Uzoqlashtirish",
      ru: "Колесо мыши: Приближение / Отдаление",
      en: "Scroll Wheel: Zoom in / out",
    },
    touchRotate: {
      uz: "Bir barmoq: Aylantirish",
      ru: "Один палец: Вращение",
      en: "One Finger Drag: Rotate",
    },
    touchPan: {
      uz: "Ikki barmoq: Siljitish va masshtab",
      ru: "Два пальца: Смещение и масштаб",
      en: "Two Fingers: Pan & Zoom",
    },
    tapHint: {
      uz: "Tafsilotlarni ko'rish uchun istalgan binoni bosing",
      ru: "Нажмите на любое здание для просмотра сведений",
      en: "Click any building in the scene to inspect details",
    },
    gotIt: {
      uz: "Tushundim",
      ru: "Понятно",
      en: "Got it",
    },
  },
} as const;

export const CAMERA_PRESETS = {
  initialPosition: { x: 22, y: 22, z: 22 },
  initialTarget: { x: 0, y: 0, z: 0 },
  boundaries: {
    minX: -40,
    maxX: 26,
    minZ: -70,
    maxZ: 35,
    minHeight: 1.5,
    maxDistance: 80,
    minDistance: 2,
  },
} as const;
