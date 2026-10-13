import { Search, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSearchArticles } from "@/hooks/useData";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSearch = () => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { data: results = [] } = useSearchArticles(query.trim(), 8);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && results.length > 0) {
      navigate(`/article/${results[0].slug}`);
      setQuery("");
      setShowResults(false);
    }
  };

  return (
    <section className="relative py-10 md:py-16 px-4 md:px-6 text-center overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 animate-slide-up">
        <h1 className="text-2xl md:text-3xl lg:text-5xl font-extrabold text-white mb-6 md:mb-8 tracking-tight leading-tight">
          {t("hero.title")}
        </h1>
        <div className="max-w-2xl mx-auto relative group" ref={wrapperRef}>
          <div className="absolute -inset-1 bg-white/10 rounded-3xl blur-xl group-focus-within:bg-white/15 premium-transition" />
          <div className="relative">
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-muted-foreground/50 z-10" />
            <input
              type="text"
              placeholder={t("hero.search_placeholder")}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              onKeyDown={handleKeyDown}
              className="relative w-full pl-11 md:pl-14 pr-12 md:pr-14 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-foreground bg-card border-0 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-muted-foreground/40 shadow-2xl"
            />
            <button
              onClick={() => { if (results.length > 0) { navigate(`/article/${results[0].slug}`); setQuery(""); setShowResults(false); } }}
              className="absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white hover:shadow-lg hover:shadow-primary/30 active:scale-95 premium-transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {showResults && query.trim().length >= 2 && (
            <div className="absolute top-full mt-2 md:mt-3 w-full bg-card rounded-xl md:rounded-2xl border border-border/50 shadow-2xl overflow-hidden text-left z-50 animate-fade-in">
              {results.length > 0 ? (
                <div className="py-1 md:py-2">
                  {results.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      onClick={() => { setQuery(""); setShowResults(false); }}
                      className="flex items-start gap-2.5 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 hover:bg-accent/50 transition-colors mx-1 rounded-lg md:rounded-xl"
                    >
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-md md:rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-foreground truncate">{article.title}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{article.categoryTitle} &rsaquo; {article.folderTitle}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 md:py-8 text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">{t("hero.no_results")} "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
