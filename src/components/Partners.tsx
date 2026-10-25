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
      className="py-12 sm:py-16 rounded-3xl overflow-hidden relative"
    >
      {/* Sarlavha */}
      <div className="container mx-auto px-4 text-center mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            {t.about.partnerships || "Hamkor Tashkilot va Korxonalar"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            {"Yetakchi kompaniyalar bizga ishonadi"}
          </p>
        </motion.div>
      </div>

      {/* Silliq Infinite Marquee Karusel (CSS Mask bilan) */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max items-center gap-6 sm:gap-8 animate-marquee hover:[animation-play-state:paused] py-4 select-none">
          {/* Loop uchun 2 marta takrorlanadi (Seamless Infinite Loop) */}
          {[...partners, ...partners].map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="flex flex-col items-center justify-center flex-shrink-0 group cursor-pointer"
            >
              <div
                className="w-44 sm:w-52 h-24 sm:h-28 rounded-2xl p-4 sm:p-5 flex items-center justify-center bg-card/80 dark:bg-card/50 backdrop-blur-md border border-border/70 hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
              >
                <img
                  src={p.img}
                  alt={p.name}
                  draggable={false}
                  className={`max-h-12 sm:max-h-14 max-w-[130px] sm:max-w-[160px] object-contain transition-transform duration-300 group-hover:scale-105 ${
                    p.invertInDark ? "dark:brightness-200 dark:contrast-125" : ""
                  }`}
                />
              </div>
              <p className="text-xs sm:text-sm font-semibold mt-2.5 text-muted-foreground group-hover:text-primary transition-colors text-center">
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
