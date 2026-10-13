import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import CategoryGrid from "@/components/CategoryGrid";
import PopularArticles from "@/components/PopularArticles";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSearch />
      <CategoryGrid />
      <PopularArticles />
    </div>
  );
};

export default Index;
