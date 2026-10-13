import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FloatingLanguageSwitcher from "@/components/FloatingLanguageSwitcher";
import ChatWidget from "@/components/ChatWidget";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ArticlePage from "./pages/ArticlePage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import AdminGate from "@/components/admin/AdminGate";
import StageWidgetEmbed from "./pages/StageWidgetEmbed.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

// Hide the public floating chrome on /embed/* (widget iframes) and on
// /admin (its own sidebar owns the theme/language controls, and the
// customer chat widget overlaps the admin UI).
const ChromeGatedSwitcher = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/embed/") || pathname.startsWith("/admin")) return null;
  return (
    <>
      <FloatingLanguageSwitcher />
      <ChatWidget />
    </>
  );
};

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ChromeGatedSwitcher />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/article/:articleSlug" element={<ArticlePage />} />
              <Route
                path="/admin"
                element={
                  <AdminGate>
                    <AdminPage />
                  </AdminGate>
                }
              />
              <Route path="/embed/stage-widget" element={<StageWidgetEmbed />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
