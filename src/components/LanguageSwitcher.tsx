import React from "react";
import { useLanguage, Language } from "@/contexts/LanguageContext";

interface LanguageSwitcherProps {
  className?: string;
  size?: "sm" | "md";
}

const LANGUAGES: { key: Language; label: string; title: string }[] = [
  { key: "uz", label: "UZ", title: "O'zbekcha" },
  { key: "ru", label: "RU", title: "Русский" },
  { key: "en", label: "EN", title: "English" },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  size = "md",
}) => {
  const { language, setLanguage } = useLanguage();

  const isSmall = size === "sm";

  return (
    <div
      className={`inline-flex items-center rounded-full bg-muted/70 dark:bg-muted/50 p-0.5 border border-border/60 shadow-sm ${className}`}
      role="group"
      aria-label="Tilni tanlash / Выбор языка / Select language"
    >
      {LANGUAGES.map((item) => {
        const isActive = language === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setLanguage(item.key)}
            type="button"
            className={`rounded-full font-bold uppercase transition-all duration-200 ${
              isSmall
                ? "px-2 py-0.5 text-[10px]"
                : "px-2.5 py-1 text-xs"
            } ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm scale-100"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
            title={item.title}
            aria-pressed={isActive}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
