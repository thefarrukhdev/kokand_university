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
    } catch (err: any) {
      console.error("💥 Xatolik:", err);
      toast({
        title: "❌ " + (t.vacancy?.error || "Xatolik yuz berdi"),
        description: err.message || "Internet yoki server bilan muammo bo‘lishi mumkin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold text-foreground pr-8 mb-6">
          {vacancy.title} — {t.vacancy.applyTitle || "Ariza topshirish"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t.vacancy.fullName || "To‘liq ismingiz"} <span className="text-destructive">*</span>
            </label>
            <input
              {...register("fullName")}
              type="text"
              className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Masalan: Aliyev Vali"
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t.vacancy.phone || "Telefon raqamingiz"} <span className="text-destructive">*</span>
            </label>
            <input
              {...register("phone")}
              type="text"
              className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="+998 90 123 45 67"
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t.vacancy.major || "Mutaxassisligingiz (Yo‘nalish)"} <span className="text-destructive">*</span>
            </label>
            <input
              {...register("major")}
              type="text"
              className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder={t.vacancy.majorPlaceholder || "Masalan: Frontend Developer"}
            />
            {errors.major && <p className="text-sm text-destructive">{errors.major.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
