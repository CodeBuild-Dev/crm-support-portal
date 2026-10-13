import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, SearchX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center px-4 py-24 md:py-32">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-primary/8 flex items-center justify-center mb-6 animate-float">
          <SearchX className="w-10 h-10 md:w-12 md:h-12 text-primary/40" />
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold text-foreground/10 tracking-tighter mb-2">{t("notfound.title")}</h1>
        <p className="text-lg md:text-xl font-semibold text-foreground mb-2">{t("notfound.message")}</p>
        <p className="text-sm text-muted-foreground/60 mb-8 text-center max-w-sm">
          {location.pathname}
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] premium-transition"
        >
          <Home className="w-4 h-4" />
          {t("notfound.back")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
