import { Rocket, Headphones, Users, Bot, BarChart3, Phone, Mail, Contact } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useData";
import { CategoryGridSkeleton } from "./LoadingSkeleton";

const iconMap: Record<string, React.ElementType> = {
  Rocket, Headphones, Users, Bot, BarChart3, Phone, Mail, Contact,
};

const gradients = [
  "from-violet-500/12 to-purple-500/8",
  "from-blue-500/12 to-cyan-500/8",
  "from-emerald-500/12 to-teal-500/8",
  "from-orange-500/12 to-amber-500/8",
  "from-pink-500/12 to-rose-500/8",
  "from-indigo-500/12 to-blue-500/8",
  "from-red-500/12 to-orange-500/8",
  "from-teal-500/12 to-green-500/8",
];

const iconColors = [
  "text-violet-600 dark:text-violet-400",
  "text-blue-600 dark:text-blue-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-orange-600 dark:text-orange-400",
  "text-pink-600 dark:text-pink-400",
  "text-indigo-600 dark:text-indigo-400",
  "text-red-600 dark:text-red-400",
  "text-teal-600 dark:text-teal-400",
];

const CategoryGrid = () => {
  const { data: kbCategories, isLoading } = useCategories();

  if (isLoading) return <CategoryGridSkeleton />;

  return (
    <section className="py-10 md:py-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {(kbCategories || []).map((cat: any, idx: number) => {
            const IconComponent = iconMap[cat.icon] || Rocket;
            const articleCount = cat.folders.reduce((sum, f) => sum + f.articles.length, 0);
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative flex flex-col items-center gap-2.5 md:gap-4 p-5 md:p-8 bg-card rounded-xl md:rounded-2xl border border-border/40 hover:border-primary/20 premium-transition hover:-translate-y-1 overflow-hidden"
                style={{ boxShadow: "var(--card-shadow)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--card-shadow-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--card-shadow)")}
              >
                <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center group-hover:scale-110 premium-transition`}>
                  <IconComponent className={`w-5 h-5 md:w-6 md:h-6 ${iconColors[idx % iconColors.length]} premium-transition`} />
                </div>
                <div className="text-center">
                  <span className="text-xs md:text-sm font-bold text-card-foreground leading-snug block">{cat.title}</span>
                  <span className="text-[10px] md:text-[11px] text-muted-foreground/60 mt-0.5 md:mt-1 block">{articleCount} articles</span>
                </div>
                <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 premium-transition pointer-events-none" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
