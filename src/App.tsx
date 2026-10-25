import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClickSpark from "./components/ui/ClickSpark";

const CampusMapPage = lazy(() => import("./pages/CampusMapPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

const AppContent = () => {
  const { theme } = useTheme();
  
  // Use White for dark mode, Burgundy for light mode so sparks are always visible
  const sparkColor = theme === "dark" ? "#ffffff" : "#9C1447"; 

  return (
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <ClickSpark
            sparkColor={sparkColor}
            sparkSize={12}
            sparkRadius={18}
            sparkCount={12}
            duration={500}
          >
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/campus-map"
                  element={
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
                          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                      }
                    >
                      <CampusMapPage />
                    </Suspense>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ClickSpark>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
