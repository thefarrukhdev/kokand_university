import { useEffect, useState } from "react";
import VacancyCard from "./VacancyCard";
import SkeletonCard from "./SkeletonCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchVacancies, Vacancy } from "@/lib/api-client";
import { linkify } from "@/lib/linkify";

const ITEMS_PER_PAGE = 6;

interface VacanciesListProps {
  onSubscribe?: (vacancy: Vacancy) => void;
}

const VacanciesList = ({ onSubscribe }: VacanciesListProps) => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [detailVacancy, setDetailVacancy] = useState<Vacancy | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const loadVacancies = async () => {
      try {
        const sortedVacancies = await fetchVacancies();
        setVacancies(sortedVacancies);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadVacancies();
  }, []);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );

  if (vacancies.length === 0)
    return (
      <p className="text-center text-muted-foreground py-8">
        {t.vacancies?.notFound || "Hech qanday vakansiya topilmadi."}
      </p>
    );

  const totalPages = Math.ceil(vacancies.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedVacancies = vacancies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        {paginatedVacancies.map((v) => (
          <VacancyCard
            key={v.id}
            vacancy={v}
            onSubscribe={() => onSubscribe?.(v)}
            onViewDetails={() => setDetailVacancy(v)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="min-h-[44px] px-4 py-2 font-semibold"
          >
            {t.vacancies?.previous || "Oldingi"}
          </Button>

          <div className="text-xs sm:text-sm font-medium text-muted-foreground px-2">
            {page} / {totalPages}
          </div>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="min-h-[44px] px-4 py-2 font-semibold"
          >
            {t.vacancies?.next || "Keyingi"}
          </Button>
        </div>
      )}

      <Dialog open={!!detailVacancy} onOpenChange={(open) => !open && setDetailVacancy(null)}>
        {detailVacancy && (
          <DialogContent className="max-w-lg w-[calc(100%-2rem)] sm:w-full p-5 sm:p-6 rounded-2xl">
            <DialogHeader className="flex justify-between items-center text-left">
              <DialogTitle className="text-lg sm:text-xl font-bold pr-6 leading-snug">
                {detailVacancy.title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-3 text-sm sm:text-base text-foreground space-y-2 break-words max-h-[60vh] overflow-y-auto pr-1 sm:pr-2 allow-select custom-scrollbar">
              {linkify(detailVacancy.description).map((line, i) => (
                <span key={i} className="block break-words">
                  {line}
                </span>
              ))}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default VacanciesList;
