
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SITE_KEY = "6LdI5PYrAAAAAG12QVrn7j2uaHag0bkoImOgsv71"; // 🔑 Google reCAPTCHA v3 site key

interface CaptchaModalProps {
  onClose: () => void;
  onSuccess: (token: string) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    grecaptcha: any;
  }
}

const CaptchaModal: React.FC<CaptchaModalProps> = ({ onClose, onSuccess }) => {
  const [status, setStatus] = useState<"loading" | "verified" | "error">("loading");

  useEffect(() => {
    const scriptId = "recaptcha-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const checkRecaptchaReady = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        clearInterval(checkRecaptchaReady);
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(SITE_KEY, { action: "verify_user" });
            if (token) {
              console.log("✅ reCAPTCHA token:", token);
              setStatus("verified");
              onSuccess(token);
              localStorage.setItem('captcha', token)
            } else {
              setStatus("error");
            }
          } catch (err) {
            console.error("❌ reCAPTCHA xatosi:", err);
            setStatus("error");
          }
        });
      }
    }, 300);

    return () => clearInterval(checkRecaptchaReady);
  }, [onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md text-center"
      >
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Iltimos, odamligingizni tasdiqlang
        </h2>

        {status === "loading" && (
          <p className="text-gray-600 dark:text-gray-300 text-sm">Tekshirilmoqda...</p>
        )}
        {status === "verified" && (
          <p className="text-green-600 font-semibold text-sm">Tasdiqdan o‘tdingiz ✅</p>
        )}
        {status === "error" && (
          <p className="text-red-500 text-sm mt-2">
            Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.
          </p>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
          >
            Bekor qilish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CaptchaModal;
