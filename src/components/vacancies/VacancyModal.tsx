import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Vacancy, submitSubscription, SubscriptionPayload } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface VacancyModalProps {
  vacancy: Vacancy;
  onClose: () => void;
}

const subscriptionSchema = z.object({
  fullName: z.string().min(3, "Iltimos, to‘liq ismingizni kiriting."),
  phone: z.string().regex(/^\+?998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, "Telefon raqam noto‘g‘ri formatda (Masalan: +998 90 123 45 67)"),
  major: z.string().min(2, "Iltimos, yo‘nalishingizni kiriting."),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

const VacancyModal = ({ vacancy, onClose }: VacancyModalProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      fullName: "",
      phone: "+998",
      major: "",
    },
  });

  const onSubmit = async (data: SubscriptionFormValues) => {
    const captcha = localStorage.getItem("captcha");
    if (!captcha) {
      toast({
        title: "❌ reCAPTCHA topilmadi",
        description: "Iltimos, sahifani yangilang.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: SubscriptionPayload = {
        fullName: data.fullName,
        phone: data.phone.replace(/\s/g, ""), // API kutilayotgan holat
        major: data.major,
        vacansy_id: vacancy.id,
        captcha,
      };

      await submitSubscription(payload);
      
      toast({ title: "✅ " + (t.vacancy?.success || "Muvaffaqiyatli yuborildi") });
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      console.error("💥 Xatolik:", err);
      const message = err instanceof Error ? err.message : "Internet yoki server bilan muammo bo‘lishi mumkin.";
      toast({
        title: "❌ " + (t.vacancy?.error || "Xatolik yuz berdi"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-xl max-h-[min(90vh,calc(100dvh-2rem))] overflow-y-auto rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-7 md:p-8 shadow-2xl custom-scrollbar"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors z-20"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <h3 className="text-xl sm:text-2xl font-bold text-foreground pr-10 mb-4 sm:mb-6 leading-snug">
          {vacancy.title} — {t.vacancy.applyTitle || "Ariza topshirish"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              {t.vacancy.fullName || "To‘liq ismingiz"} <span className="text-destructive">*</span>
            </label>
            <input
              {...register("fullName")}
              type="text"
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base"
              placeholder="Masalan: Aliyev Vali"
            />
            {errors.fullName && <p className="text-xs sm:text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              {t.vacancy.phone || "Telefon raqamingiz"} <span className="text-destructive">*</span>
            </label>
            <input
              {...register("phone")}
              type="text"
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base"
              placeholder="+998 90 123 45 67"
            />
            {errors.phone && <p className="text-xs sm:text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              {t.vacancy.major || "Mutaxassisligingiz (Yo‘nalish)"} <span className="text-destructive">*</span>
            </label>
            <input
              {...register("major")}
              type="text"
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-base"
              placeholder={t.vacancy.majorPlaceholder || "Masalan: Frontend Developer"}
            />
            {errors.major && <p className="text-xs sm:text-sm text-destructive">{errors.major.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 min-h-[46px] mt-2 sm:mt-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
            ) : (
              t.vacancy.submit || "Ariza yuborish"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default VacancyModal;
