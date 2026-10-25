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
      <div className="container relative z-10 mx-auto px-4 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <h1 className="flex justify-center items-center gap-4 text-5xl md:text-7xl font-bold drop-shadow-lg select-none">
              <img
                key={logoSrc}
                src={logoSrc}
                alt="Kokand University logo"
                className="w-16 h-16 md:w-24 md:h-24 rounded-full object-contain transition-all duration-500"
              />
              <span className="bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent">
                {t.hero.title}
              </span>
            </h1>
          </motion.div>

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative glass-card rounded-3xl p-8 overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <img
              src="/kokand_university.webp"
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover object-top opacity-30 blur-[0.5px]"
            />

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t.hero.welcomeCard.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                {t.hero.welcomeCard.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <MagneticButton
                  as="a"
                  href="https://www.kokanduni.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-md hover:bg-primary/90 transition-colors"
                >
                  {t.hero.welcomeCard.cta}
                  <ExternalLink className="h-5 w-5 pointer-events-none" />
                </MagneticButton>

                <Link
                  to="/campus-map"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-background/80 hover:bg-background text-foreground border border-border/80 hover:border-primary/50 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
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
