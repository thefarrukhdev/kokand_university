import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface PartnerItem {
  name: string;
  img: string;
  invertInDark?: boolean;
}

const partners: PartnerItem[] = [
  { name: "Ishonch", img: "/partners/logo_ishonch.png", invertInDark: true },
  { name: "Mehrigiyo", img: "/partners/logo_mehrigiyo.png" },
  { name: "Domstroy", img: "/partners/domstroy_png.png" },
  { name: "EPA", img: "/partners/epa.png" },
  { name: "Lochin Mould", img: "/partners/lochin.png" },
  { name: "Timsoll", img: "/partners/timsoll_logo.png" },
  { name: "Europrint", img: "/partners/europrint_logo_2.png" },
];

const Partners = () => {
  const { t } = useLanguage();

  return (
    <section
      id="partners"
      className="py-8 sm:py-12 md:py-16 rounded-2xl sm:rounded-3xl overflow-hidden relative"
    >
      {/* Sarlavha */}
      <div className="container mx-auto px-4 text-center mb-6 sm:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            {t.about.partnerships || "Hamkor Tashkilot va Korxonalar"}
          </h2>
          <p className="text-muted-foreground mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
            {t.about.partnersSubtitle || "Yetakchi kompaniyalar bizga ishonadi"}
          </p>
        </motion.div>
      </div>

      {/* Silliq Infinite Marquee Karusel (CSS Mask bilan) */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] sm:[-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max items-center gap-4 sm:gap-6 md:gap-8 animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused] py-2 sm:py-4 select-none">
          {/* Loop uchun 2 marta takrorlanadi (Seamless Infinite Loop) */}
          {[...partners, ...partners].map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="flex flex-col items-center justify-center flex-shrink-0 group cursor-pointer"
            >
              <div
                className="w-36 sm:w-44 md:w-52 h-20 sm:h-24 md:h-28 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex items-center justify-center bg-card/80 dark:bg-card/50 backdrop-blur-md border border-border/70 hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
              >
                <img
                  src={p.img}
                  alt={p.name}
                  draggable={false}
                  className={`max-h-9 sm:max-h-12 md:max-h-14 max-w-[110px] sm:max-w-[130px] md:max-w-[160px] object-contain transition-transform duration-300 group-hover:scale-105 ${
                    p.invertInDark ? "dark:brightness-200 dark:contrast-125" : ""
                  }`}
                />
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm font-semibold mt-2 text-muted-foreground group-hover:text-primary transition-colors text-center">
                {p.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
