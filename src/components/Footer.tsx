import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const FooterBottom = () => {
  const { t } = useLanguage();

  return (
    <motion.footer
      id="contact"
      className="relative mt-12 sm:mt-16 md:mt-20 pt-8 sm:pt-10 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:pb-12 px-4 border-t border-border text-center text-muted-foreground bg-background overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <p className="text-xs sm:text-sm mb-4 sm:mb-6 tracking-wide leading-relaxed max-w-md mx-auto">
        © 2025 Kokand University. {t.footer.rights}
      </p>

      <div className="flex items-center justify-center">
        <a
          href="https://t.me/ku_Karyera"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full border border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-all duration-300 shadow-sm active:scale-95 group"
          aria-label="Telegram"
        >
          <span>{t.footer.contactUs || "Aloqa uchun..."}</span>
          <Send className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform shrink-0" />
        </a>
      </div>
    </motion.footer>
  );
};

export default FooterBottom;
