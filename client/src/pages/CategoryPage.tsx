import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { useCategoryBySlug } from "@/hooks/useData";
import { FileText, FolderOpen, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";
import NotFound from "./NotFound";

const CategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [query, setQuery] = useState("");
  const { t } = useLanguage();
  const { data: category, isLoading, isError } = useCategoryBySlug(categorySlug || "");

  if (isLoading) return <div className="min-h-screen bg-background"><Header /><div className="h-48" style={{ background: "var(--hero-gradient)" }} /></div>;
  if (isError || !category) return <NotFound />;

  const q = query.toLowerCase().trim();

  const filteredFolders = category.folders.map((folder) => ({
    ...folder,
    articles: q
      ? folder.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            (a.description || "").toLowerCase().includes(q)
        )
      : folder.articles,
  })).filter((folder) => folder.articles.length > 0);

  const totalArticles = category.folders.reduce((sum, f) => sum + f.articles.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={category.title} description={`Browse ${totalArticles} articles in ${category.title}`} />
      <Header />

      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/50 text-xs md:text-sm mb-4">
            <Link to="/" className="hover:text-white/80 premium-transition">{t("nav.home")}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90 font-medium">{category.title}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-2">{category.title}</h1>
          <p className="text-white/50 text-sm md:text-base">{totalArticles} {t("admin.articles")} &middot; {category.folders.length} {t("admin.folders")}</p>

          {/* Search */}
          <div className="mt-6 max-w-lg relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 z-10" />
            <input
              type="text"
              placeholder={t("category.search_placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-card/95 backdrop-blur-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-muted-foreground/40 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Folders */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {filteredFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                className="bg-card rounded-2xl border border-border/40 p-5 md:p-6 premium-transition hover:shadow-lg hover:border-primary/15"
                style={{ boxShadow: "var(--card-shadow)" }}
              >
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-foreground">{folder.title}</h2>
                    <p className="text-[11px] text-muted-foreground/50">{folder.articles.length} {t("admin.articles")}</p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {folder.articles.slice(0, 5).map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="flex items-center gap-2.5 py-2 md:py-2.5 px-2.5 rounded-lg hover:bg-accent/40 premium-transition group"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary shrink-0 premium-transition" />
                      <span className="text-xs md:text-sm text-foreground/80 group-hover:text-primary font-medium premium-transition line-clamp-1">{article.title}</span>
                    </Link>
                  ))}
                  {folder.articles.length > 5 && (
                    <p className="text-xs text-muted-foreground/50 pl-2.5 pt-2">
                      + {folder.articles.length - 5} {t("category.more_articles")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-24">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-muted-foreground/20" />
            </div>
            <p className="text-sm text-muted-foreground">{t("category.no_results")} "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
