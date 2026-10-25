import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import PartnersSection from "./Partners";

const ExpandableText = ({ children }: { children: React.ReactNode }) => {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  if (!isMobile) {
    return <div className="space-y-4 text-base sm:text-lg leading-relaxed allow-select">{children}</div>;
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ maxHeight: 170 }}
        animate={{ maxHeight: expanded ? 2000 : 170 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden space-y-3 text-sm sm:text-base leading-relaxed text-foreground allow-select"
      >
        {children}
      </motion.div>

      {!expanded && (
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-primary font-semibold mt-2 min-h-[44px] px-3 py-2 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors md:hidden text-sm"
      >
        {expanded ? t.about.close : t.about.more}
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
    </div>
  );
};

const About = () => {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { t } = useLanguage();

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 bg-transparent" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 space-y-4 sm:space-y-6 shadow-xl"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{t.about.title}</h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">{t.about.date}</p>

            <ExpandableText>
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
              <p>{t.about.p4}</p>
            </ExpandableText>

            <div className="flex justify-center pt-2 sm:pt-4">
              <a
                href="https://kelajakkaqadammarkazi.uz/?from=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-card rounded-2xl shadow-md border border-border/70 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 group"
              >
                <img
                  src="/kuQR.jpg"
                  alt="Kelajakka Qadam QR"
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain rounded-xl"
                />
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground mt-2 group-hover:text-primary transition-colors">
                  kelajakkaqadammarkazi.uz
                </span>
              </a>
            </div>
          </motion.div>

          <PartnersSection />
        </div>
      </div>
    </section>
  );
};

export default About;
