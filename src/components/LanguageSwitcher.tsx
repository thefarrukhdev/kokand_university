import React from "react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown, Check } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  size?: "sm" | "md";
}

interface LanguageOption {
  key: Language;
  label: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { key: "uz", label: "UZ", nativeName: "O'zbekcha" },
  { key: "ru", label: "RU", nativeName: "Русский" },
  { key: "en", label: "EN", nativeName: "English" },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  size = "sm",
}) => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = React.useState(false);

  const currentLang = LANGUAGES.find((l) => l.key === language) || LANGUAGES[0];
  const isSmall = size === "sm";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 hover:bg-muted text-foreground font-semibold shadow-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shrink-0 ${
            isSmall ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
          } ${open ? "ring-2 ring-primary/30 bg-muted" : ""} ${className}`}
          aria-label="Tilni tanlash / Выбор языка / Select language"
          title="Tilni tanlash / Выбор языка / Select language"
        >
          <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-bold tracking-wide">{currentLang.label}</span>
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground transition-transform duration-200 shrink-0 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[100] min-w-[145px] rounded-2xl border border-border/80 bg-card p-1.5 text-card-foreground shadow-2xl"
      >
        {LANGUAGES.map((item) => {
          const isActive = language === item.key;
          return (
            <DropdownMenuItem
              key={item.key}
              onClick={() => {
                setLanguage(item.key);
                setOpen(false);
              }}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground hover:bg-muted focus:bg-muted"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
                <span>{item.nativeName}</span>
              </div>
              {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
