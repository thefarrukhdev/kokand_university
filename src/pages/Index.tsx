import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import VacanciesSection from "@/components/vacancies/VacanciesSection";
import About from "@/components/About";
import Footer from "@/components/Footer";
import MeshGradient from "@/components/MeshGradient";
import SideRays from "@/components/ui/SideRays";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const { theme } = useTheme();
  const rayColor = theme === "dark" ? "#ffffff" : "#9C1447";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient Visual Effects: Active only on Landing Page */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <SideRays 
          rayColor1={rayColor} 
          rayColor2={theme === "dark" ? "#003399" : "#ff0055"}
          intensity={1.2}
          opacity={theme === "dark" ? 0.3 : 0.15}
          origin="top-right" 
        />
      </div>
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
