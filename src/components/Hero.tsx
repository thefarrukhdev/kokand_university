import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink, Compass } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import MagneticButton from "@/components/ui/MagneticButton";

const Hero = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const logoSrc = theme === "dark" ? "/ku-white.png" : "/ku-black.png";

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent transition-all duration-500"
    >
      <div className="container relative z-10 mx-auto px-4 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <h1 className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 md:gap-6 text-2xl min-[380px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold drop-shadow-lg select-none text-center">
              <img
                key={logoSrc}
                src={logoSrc}
                alt="Kokand University logo"
                className="w-10 h-10 min-[380px]:w-12 min-[380px]:h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full object-contain transition-all duration-500 shrink-0"
              />
              <span className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent break-words tracking-tight">
                {t.hero.title}
              </span>
            </h1>
          </motion.div>

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 overflow-hidden shadow-xl sm:shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <img
              src="/kokand_university.webp"
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-30 blur-[0.5px]"
            />

            <div className="relative z-10 space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {t.hero.welcomeCard.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                {t.hero.welcomeCard.description}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
                <MagneticButton
                  as="a"
                  href="https://www.kokanduni.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto justify-center gap-2 px-6 sm:px-8 py-3 min-h-[46px] bg-primary text-primary-foreground rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-colors text-sm sm:text-base"
                >
                  {t.hero.welcomeCard.cta}
                  <ExternalLink className="h-5 w-5 pointer-events-none" />
                </MagneticButton>

                <Link
                  to="/campus-map"
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 sm:px-6 py-3 min-h-[46px] rounded-xl font-semibold bg-background/80 hover:bg-background text-foreground border border-border/80 hover:border-primary/50 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group text-sm sm:text-base"
                >
                  <Compass className="h-5 w-5 text-primary group-hover:rotate-90 transition-transform duration-500" />
                  <span>{t.nav.campusMap || "3D Kampus"}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
