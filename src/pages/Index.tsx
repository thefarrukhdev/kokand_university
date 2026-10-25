import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import VacanciesSection from "@/components/vacancies/VacanciesSection";
import About from "@/components/About";
import Footer from "@/components/Footer";
import MeshGradient from "@/components/MeshGradient";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <MeshGradient />

      <Navbar />
      <main className="flex-1 relative z-10">
        <Hero />
        <Stats />
        <VacanciesSection />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
