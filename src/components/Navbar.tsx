import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { t } = useLanguage();
  const { theme } = useTheme();

  const logoSrc = theme === "dark" ? "/ku-white.png" : "/ku-black.png";

  const navLinks = [
    { name: t.nav.home || "Bosh sahifa", href: "#hero" },
    { name: t.nav.vacancies || "E'lonlar", href: "#vacancies" },
    { name: t.nav.about || "Kelajakka Qadam", href: "#about" },
    { name: t.nav.partners || "Hamkorlar", href: "#partners" },
  ];

  // Handle Scroll to toggle solid floating pill
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      setIsOpen(false);
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-3 sm:px-4 pt-3 sm:pt-4 pointer-events-none">
      {/* Floating Pill Container */}
      <motion.nav
        layout
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 ${
          isOpen ? "rounded-3xl" : "rounded-full"
        } ${
          isScrolled || isOpen
            ? "bg-card text-card-foreground shadow-xl border border-border/80 py-2 px-3 sm:px-6"
            : "bg-transparent border-transparent shadow-none py-3 px-3 sm:px-6"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#hero");
            }}
            className="flex items-center space-x-2 group z-50 relative shrink-0"
          >
            <img
              src={logoSrc}
              alt="Kokand University logo"
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-contain transition-transform group-hover:scale-105 duration-300"
            />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base md:text-lg font-bold text-primary transition-colors leading-tight">
                Kokand University
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block leading-none">
                Qoʻqon Universiteti
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 relative">
            {navLinks.map((link, index) => (
              <div
                key={link.name}
                className="relative px-1"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <button
                  onClick={() => scrollToSection(link.href)}
                  className="relative z-10 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </button>
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full -z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Right side actions: Language Switcher + Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 z-50 relative shrink-0">
            {/* Desktop Only: Language Switcher & Theme Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher size="sm" />
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              aria-label={isOpen ? "Menyuni yopish" : "Menyuni ochish"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 mt-2 border-t border-border/50 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-left px-4 py-3 text-sm font-medium text-foreground bg-primary/5 hover:bg-primary/10 rounded-2xl transition-colors"
                  >
                    {link.name}
                  </button>
                ))}

                <Link
                  to="/campus-map"
                  className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-primary-foreground bg-primary rounded-2xl shadow-md transition-all mt-1"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    <span>{t.nav.campusMap || "3D Kampus Xaritasi"}</span>
                  </span>
                  <span className="text-xs opacity-80">3D Tur →</span>
                </Link>

                {/* Mobile Bottom Bar: Language & Day/Night Theme */}
                <div className="flex items-center justify-between px-3.5 py-2.5 mt-2 bg-muted/60 dark:bg-muted/40 rounded-2xl border border-border/60">
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
