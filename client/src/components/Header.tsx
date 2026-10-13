import { Link, useLocation } from "react-router-dom";
import { LifeBuoy, Settings, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdmin = location.pathname === "/admin";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-4 md:px-8 py-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 premium-transition">
              <LifeBuoy className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 premium-transition" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-foreground">CRM Support Portal</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            to="/"
            className={`relative px-4 py-2 text-sm font-medium rounded-xl premium-transition ${
              isHome
                ? "text-primary bg-primary/8"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            {t("nav.home")}
            {isHome && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />}
          </Link>
          <Link
            to="/admin"
            className={`relative px-4 py-2 text-sm font-medium rounded-xl premium-transition flex items-center gap-2 ${
              isAdmin
                ? "text-primary bg-primary/8"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {t("nav.admin")}
            {isAdmin && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />}
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-2 rounded-xl hover:bg-accent/50 premium-transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl animate-fade-in">
          <nav className="flex flex-col p-2 gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 text-sm font-medium rounded-xl premium-transition ${
                isHome ? "text-primary bg-primary/8" : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 text-sm font-medium rounded-xl premium-transition flex items-center gap-2 ${
                isAdmin ? "text-primary bg-primary/8" : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              {t("nav.admin")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
