import { useTheme, themes, type ThemeId } from "@/contexts/ThemeContext";
import { Palette, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const colorPreviews: Record<ThemeId, string[]> = {
  violet: ["#7C5AE6", "#A78BFA", "#EC4899"],
  ocean: ["#3B82F6", "#06B6D4", "#14B8A6"],
  emerald: ["#10B981", "#14B8A6", "#06B6D4"],
  sunset: ["#F97316", "#F59E0B", "#EAB308"],
  rose: ["#F43F5E", "#EC4899", "#A855F7"],
  slate: ["#64748B", "#94A3B8", "#CBD5E1"],
  indigo: ["#6366F1", "#818CF8", "#A78BFA"],
  crimson: ["#DC2626", "#F87171", "#FB923C"],
  teal: ["#0D9488", "#2DD4BF", "#38BDF8"],
  amber: ["#D97706", "#FCD34D", "#A3E635"],
};

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-3 rounded-xl text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 premium-transition"
        >
          <Palette className="w-4 h-4" />
          <span className="text-xs font-semibold">Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        className="w-[calc(100vw-2rem)] sm:w-80 p-3 rounded-2xl border-border/50 shadow-2xl"
      >
        <div className="mb-3">
          <p className="text-sm font-bold text-foreground">Choose Theme</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Applied to the entire site</p>
        </div>
        <ScrollArea className="max-h-[60vh]">
          <div className="grid grid-cols-2 gap-1.5 pr-2">
            {themes.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative flex flex-col items-center gap-2 w-full p-3 rounded-xl text-center premium-transition ${
                    isActive
                      ? "bg-primary/10 ring-2 ring-primary/40"
                      : "hover:bg-accent/50 ring-1 ring-border/40"
                  }`}
                >
                  {/* Gradient preview bar */}
                  <div
                    className="w-full h-6 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${colorPreviews[t.id][0]}, ${colorPreviews[t.id][1]}, ${colorPreviews[t.id][2]})`,
                    }}
                  />
                  <div>
                    <p className="text-[12px] font-bold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{t.description}</p>
                  </div>
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSwitcher;
