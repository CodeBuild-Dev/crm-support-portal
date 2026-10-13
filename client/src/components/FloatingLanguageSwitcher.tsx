import { useLanguage, type Lang } from "@/contexts/LanguageContext";
import { Globe, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const languages: { id: Lang; name: string; short: string }[] = [
  { id: "en", name: "English", short: "EN" },
  { id: "de", name: "Deutsch", short: "DE" },
];

const FloatingLanguageSwitcher = () => {
  const { lang, setLang, t } = useLanguage();
  const current = languages.find((l) => l.id === lang);

  return (
    <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 h-10 px-4 rounded-full bg-card border border-border/50 shadow-lg hover:shadow-xl premium-transition text-sm font-medium text-foreground/80 hover:text-foreground">
            <Globe className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{current?.name}</span>
            <span className="sm:hidden text-xs font-bold">{current?.short}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-48 p-1.5 rounded-xl border-border/50 shadow-2xl"
        >
          {languages.map((l) => {
            const isActive = lang === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left premium-transition ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent/50 text-foreground"
                }`}
              >
                <span className="text-xs font-bold w-7 h-5 rounded bg-muted flex items-center justify-center shrink-0">{l.short}</span>
                <span className="text-sm font-medium flex-1">{l.name}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FloatingLanguageSwitcher;
