import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Calendar, ExternalLink } from "lucide-react";
import { MouseEvent } from "react";
import { Vacancy } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";
import MagneticButton from "@/components/ui/MagneticButton";

interface VacancyCardProps {
  vacancy: Vacancy;
  onSubscribe?: () => void;
  onViewDetails?: () => void;
}

export const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline px-1 rounded-sm text-blue-500 break-keep whitespace-pre-wrap relative z-20"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const VacancyCard = ({ vacancy, onSubscribe, onViewDetails }: VacancyCardProps) => {
  const { language, t } = useLanguage();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const localeCode = language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "uz-UZ";

  const formattedDate = vacancy.created_at
    ? new Date(vacancy.created_at).toLocaleString(localeCode, {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const isLongDescription = vacancy.description.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-md hover:shadow-lg transition-all duration-300"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              hsl(var(--primary) / 0.1),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="p-5 flex flex-col gap-3 h-full relative z-10 pointer-events-auto">
        <h3 className="text-lg sm:text-xl font-bold text-foreground">{vacancy.title}</h3>

        {formattedDate && (
          <p className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" /> {formattedDate}
          </p>
        )}

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-4 leading-relaxed break-words flex-1 allow-select">
          {linkify(vacancy.description)}
        </p>

        {isLongDescription && onViewDetails && (
          <button
            onClick={onViewDetails}
            className="mt-1 text-primary font-medium hover:underline text-sm flex items-center gap-1 w-fit relative z-20"
          >
            {t.vacancy.details || "Batafsil"} <ExternalLink className="w-4 h-4" />
          </button>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50">
          {vacancy.url && (
            <a
              href={vacancy.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 sm:gap-2 text-primary font-medium hover:underline text-sm sm:text-base relative z-20"
            >
              {t.vacancy.details || "Batafsil"} <ExternalLink className="w-4 h-4 pointer-events-none" />
            </a>
          )}

          {onSubscribe && (
            <MagneticButton
              onClick={onSubscribe}
              className="ml-auto rounded-xl bg-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all z-20"
            >
              {t.vacancy.apply || "Ro‘yxatdan o‘tish"}
            </MagneticButton>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VacancyCard;
