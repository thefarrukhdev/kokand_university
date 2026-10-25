import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-full border border-border/60 bg-muted/60 hover:bg-muted text-foreground transition-all duration-200 hover:scale-105 shadow-sm shrink-0"
      title={theme === "light" ? "Tungi rejim / Ночной режим / Dark mode" : "Kunduzgi rejim / Дневной режим / Light mode"}
      aria-label="Rejimni almashtirish / Сменить тему / Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-foreground" />
      ) : (
        <Sun className="h-4 w-4 text-amber-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
