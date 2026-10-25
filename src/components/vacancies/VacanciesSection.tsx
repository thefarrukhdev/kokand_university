import { useState } from "react";
import VacanciesList from "./VacanciesList";
import VacancyModal from "./VacancyModal";
import CaptchaModal from "./CaptchaModal";
import { Vacancy } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const VacanciesSection = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [modalVacancy, setModalVacancy] = useState<Vacancy | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSubscribe = (vacancy: Vacancy) => {
    if (!token) {
      setModalVacancy(vacancy);
      setShowCaptcha(true);
    } else {
      setModalVacancy(vacancy);
    }
  };

  const closeModal = () => {
    setModalVacancy(null);
    setShowCaptcha(false);
  };

  return (
    <>
      <section id="vacancies" className="py-12 sm:py-16 md:py-20 bg-transparent">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <h2 className="flex justify-center text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
            {t.vacancies.title || t.nav.vacancies || "E'lonlar"}
          </h2>
          <VacanciesList onSubscribe={handleSubscribe} />
        </div>
      </section>

      {showCaptcha && modalVacancy && (
        <CaptchaModal
          onClose={() => setShowCaptcha(false)}
          onSuccess={() => {
            setShowCaptcha(false);
            setModalVacancy(modalVacancy); // Needs fix later
          }}
        />
      )}

      {modalVacancy && !showCaptcha && (
        <VacancyModal vacancy={modalVacancy} onClose={closeModal} />
      )}
    </>
  );
};

export default VacanciesSection;
