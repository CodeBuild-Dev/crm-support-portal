import { FileText, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { usePopularArticles } from "@/hooks/useData";
import { useLanguage } from "@/contexts/LanguageContext";

const PopularArticles = () => {
  const { t } = useLanguage();
  const { data: articles = [] } = usePopularArticles(12);
  if (articles.length === 0) return null;
  return (
    <section className="py-10 md:py-16 px-4 md:px-6 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-foreground">{t("popular.title")}</h2>
          </div>
          <Link to="/category/getting-started" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 premium-transition group">
            {t("popular.view_all")}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 premium-transition" />
          </Link>
        </div>
        <div className="bg-card rounded-xl md:rounded-2xl border border-border/40 overflow-hidden" style={{ boxShadow: "var(--card-shadow)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/30">
            {[articles.slice(0, 6), articles.slice(6, 12)].map((col, colIdx) => (
              <div key={colIdx} className="divide-y divide-border/30">
                {col.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="flex items-start gap-2.5 md:gap-3.5 py-3 md:py-4 px-3 md:px-5 hover:bg-accent/30 premium-transition group"
                  >
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-md md:rounded-lg bg-primary/6 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/12 premium-transition">
                      <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary/60 group-hover:text-primary premium-transition" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-semibold text-foreground group-hover:text-primary leading-snug premium-transition line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-[10px] md:text-[11px] text-muted-foreground/50 mt-0.5">{article.categoryTitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularArticles;
