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
  const [isClosing, setIsClosing] = useState(false);
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

  const closeMenu = () => {
    if (isOpen) {
      setIsClosing(true);
      setIsOpen(false);
    }
  };

  const toggleMenu = () => {
    if (isOpen) {
      setIsClosing(true);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      closeMenu();
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 120);
    }
  };

  const showSolidPill = isScrolled || isOpen || isClosing;

  return (
    <>
      {/* Mobile Dimmed Backdrop (tap outside to close) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 md:hidden pointer-events-auto"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-2.5 sm:px-4 pt-[max(env(safe-area-inset-top),0.625rem)] pointer-events-none">
        {/* Floating Pill Container */}
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto w-full max-w-5xl transition-[border-radius,background-color,border-color,box-shadow] duration-300 ease-out py-2 sm:py-2.5 px-3 sm:px-6 ${
            showSolidPill
              ? `bg-card/95 text-card-foreground shadow-xl border border-border/80 backdrop-blur-xl ${
                  isOpen || isClosing ? "rounded-2xl sm:rounded-3xl" : "rounded-full"
                }`
              : "bg-transparent border-transparent shadow-none rounded-full"
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

            {/* Right side actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 z-50 relative shrink-0">
              {/* Desktop Only: Language Switcher & Theme Toggle */}
              <div className="hidden md:flex items-center gap-2">
                <LanguageSwitcher size="sm" />
                <ThemeToggle />
              </div>

              {/* Mobile menu button with smooth icon morph */}
              <button
                onClick={toggleMenu}
                className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-transform"
                aria-label={isOpen ? "Menyuni yopish" : "Menyuni ochish"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.16 }}
                      className="flex items-center justify-center"
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.16 }}
                      className="flex items-center justify-center"
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown with buttery-smooth height & stagger animation */}
          <AnimatePresence onExitComplete={() => setIsClosing(false)}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.22, ease: "easeOut" }
                }}
                className="md:hidden overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, delay: 0.04 }}
                  className="py-3 mt-2 border-t border-border/50 flex flex-col gap-2 max-h-[calc(85dvh-4.5rem)] overflow-y-auto custom-scrollbar"
                >
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => scrollToSection(link.href)}
                      className="text-left px-4 py-3 min-h-[44px] flex items-center text-sm font-medium text-foreground bg-primary/5 hover:bg-primary/10 active:bg-primary/15 rounded-xl transition-colors"
                    >
                      {link.name}
                    </button>
                  ))}

                  <Link
                    to="/campus-map"
                    onClick={closeMenu}
                    className="flex items-center justify-between px-4 py-3 min-h-[44px] text-sm font-semibold text-primary-foreground bg-primary rounded-xl shadow-md transition-all mt-1 active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-2">
                      <Compass className="h-4 w-4" />
                      <span>{t.nav.campusMap || "3D Kampus Xaritasi"}</span>
                    </span>
                    <span className="text-xs opacity-80">3D Tur →</span>
                  </Link>

                  {/* Mobile Bottom Bar: Language & Day/Night Theme */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 mt-2 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/60">
                    <div className="flex items-center gap-2">
                      <LanguageSwitcher size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </>
  );
};

export default Navbar;
