import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const FooterBottom = () => {
  const { t } = useLanguage();

  return (
    <motion.footer
      id="contact"
      className="relative mt-20 pt-10 pb-12 border-t border-border text-center text-muted-foreground bg-background overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <p className="text-sm mb-6 tracking-wide">
        © 2025 Kokand University. {t.footer.rights}
      </p>

      <div className="flex items-center justify-center">
        <a
          href="https://t.me/ku_Karyera"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          aria-label="Telegram"
        >
          {t.footer.contactUs || "Aloqa uchun..."}
          <Send className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        </a>
      </div>
    </motion.footer>
  );
};

export default FooterBottom;
