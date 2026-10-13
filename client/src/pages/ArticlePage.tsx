import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useArticleBySlug, useSearchArticles, useVoteArticle, useViewArticle } from "@/hooks/useData";
import { FileText, Search, Printer, ChevronRight, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";
import NotFound from "./NotFound";

const ArticlePage = () => {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const [query, setQuery] = useState("");
  const [voted, setVoted] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: result, isLoading, isError } = useArticleBySlug(articleSlug || "");
  const { data: searchResults = [] } = useSearchArticles(query.trim(), 5);
  const voteMutation = useVoteArticle();
  const viewMutation = useViewArticle();

  // Track view on load
  useEffect(() => {
    if (result?.article?.id) {
      viewMutation.mutate(result.article.id);
    }
  }, [result?.article?.id]);

  if (isLoading) return <div className="min-h-screen bg-background"><Header /><div className="h-40" style={{ background: "var(--hero-gradient)" }} /></div>;
  if (isError || !result) return <NotFound />;

  const { article, folder, category, relatedArticles } = result;

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      navigate(`/article/${searchResults[0].slug}`);
      setQuery("");
    }
  };

  const renderContent = (content?: string) => {
    if (!content) return <p className="text-muted-foreground">{t("article.coming_soon")}</p>;

    return content.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        return <h2 key={i} className="text-xl md:text-2xl font-bold text-foreground mt-8 md:mt-10 mb-3 md:mb-4">{trimmed.replace("## ", "").replace(/\*\*/g, "")}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={i} className="text-lg md:text-xl font-semibold text-foreground mt-5 md:mt-6 mb-2 md:mb-3">{trimmed.replace("### ", "").replace(/\*\*/g, "")}</h3>;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s/, "");
        return (
          <div key={i} className="flex gap-3 ml-1 md:ml-2 mb-2.5">
            <span className="w-6 h-6 rounded-full bg-primary/8 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">{trimmed.match(/^\d+/)?.[0]}</span>
            <p className="text-sm md:text-base text-foreground/85 leading-relaxed" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />
          </div>
        );
      }
      if (trimmed === "") return <div key={i} className="h-3" />;
      return <p key={i} className="text-sm md:text-base text-foreground/80 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>") }} />;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={article.title} description={article.description} />
      <Header />

      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/50 text-xs md:text-sm mb-3 flex-wrap">
            <Link to="/" className="hover:text-white/80 premium-transition">{t("nav.home")}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/category/${category.slug}`} className="hover:text-white/80 premium-transition">{category.title}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">{folder.title}</span>
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold text-white tracking-tight mb-1">{article.title}</h1>
          {article.description && (
            <p className="text-white/45 text-sm md:text-base mt-1">{article.description}</p>
          )}
          <p className="text-white/30 text-[10px] md:text-xs mt-3">{article.date}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col lg:flex-row gap-6 md:gap-10">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          <div className="bg-card rounded-2xl border border-border/40 p-5 md:p-8 overflow-hidden" style={{ boxShadow: "var(--card-shadow)" }}>
            <div className="rich-content max-w-none">
              {renderContent(article.content)}
            </div>
          </div>

          {/* Helpful section */}
          <div className="mt-6 p-5 md:p-6 bg-card rounded-2xl border border-border/40 text-center" style={{ boxShadow: "var(--card-shadow)" }}>
            {voted === null ? (
              <>
                <p className="text-sm font-semibold text-foreground mb-3">Was this article helpful?</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => { voteMutation.mutate({ id: article.id, helpful: true }); setVoted(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 premium-transition"
                  >
                    <ThumbsUp className="w-4 h-4" /> Yes
                  </button>
                  <button
                    onClick={() => { voteMutation.mutate({ id: article.id, helpful: false }); setVoted(false); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 premium-transition"
                  >
                    <ThumbsDown className="w-4 h-4" /> No
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
                <Check className="w-4 h-4" />
                Thanks for your feedback!
              </div>
            )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-6">
          {/* Actions */}
          <div className="bg-card rounded-2xl border border-border/40 p-4" style={{ boxShadow: "var(--card-shadow)" }}>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
              <input
                type="text"
                placeholder={t("article.search_placeholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/35"
              />
              {query.trim().length >= 2 && (
                <div className="absolute top-full mt-1 w-full bg-card rounded-lg border border-border shadow-lg overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((r) => (
                      <Link
                        key={r.id}
                        to={`/article/${r.slug}`}
                        onClick={() => setQuery("")}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent/50 transition-colors"
                      >
                        <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{r.title}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2.5 text-xs text-muted-foreground">{t("article.no_results")}</div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full px-3 py-2 rounded-lg hover:bg-accent/40 premium-transition"
            >
              <Printer className="w-3.5 h-3.5" />
              {t("article.print")}
            </button>
          </div>

          {/* Related articles */}
          <div className="bg-card rounded-2xl border border-border/40 p-4" style={{ boxShadow: "var(--card-shadow)" }}>
            <h3 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">{t("article.sidebar_title")}</h3>
            <div className="space-y-0.5">
              {(relatedArticles || folder.articles || []).map((a: any) => (
                <Link
                  key={a.id}
                  to={`/article/${a.slug}`}
                  className={`flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs premium-transition ${
                    a.id === article.id
                      ? "text-primary font-semibold bg-primary/8"
                      : "text-foreground/70 hover:text-primary hover:bg-accent/40"
                  }`}
                >
                  <FileText className="w-3 h-3 shrink-0 text-primary/50" />
                  <span className="line-clamp-2">{a.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ArticlePage;
