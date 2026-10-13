import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "violet" | "ocean" | "emerald" | "sunset" | "rose" | "slate" | "indigo" | "crimson" | "teal" | "amber";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  colors: { primary: string; accent: string; gradient: string };
}

export const themes: ThemeOption[] = [
  {
    id: "violet",
    name: "Violet",
    description: "Default purple theme",
    colors: { primary: "#7C5AE6", accent: "#A78BFA", gradient: "from-violet-500 via-purple-500 to-pink-500" },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue tones",
    colors: { primary: "#3B82F6", accent: "#60A5FA", gradient: "from-blue-500 via-cyan-500 to-teal-400" },
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Fresh green vibes",
    colors: { primary: "#10B981", accent: "#34D399", gradient: "from-emerald-500 via-teal-500 to-cyan-400" },
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange glow",
    colors: { primary: "#F59E0B", accent: "#FBBF24", gradient: "from-orange-500 via-amber-500 to-yellow-400" },
  },
  {
    id: "rose",
    name: "Rose",
    description: "Elegant pink hues",
    colors: { primary: "#F43F5E", accent: "#FB7185", gradient: "from-rose-500 via-pink-500 to-fuchsia-400" },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Minimal monochrome",
    colors: { primary: "#64748B", accent: "#94A3B8", gradient: "from-slate-600 via-gray-500 to-zinc-400" },
  },
  {
    id: "indigo",
    name: "Indigo",
    description: "Deep royal blue",
    colors: { primary: "#6366F1", accent: "#818CF8", gradient: "from-indigo-600 via-blue-600 to-violet-500" },
  },
  {
    id: "crimson",
    name: "Crimson",
    description: "Bold red energy",
    colors: { primary: "#DC2626", accent: "#F87171", gradient: "from-red-600 via-rose-500 to-orange-400" },
  },
  {
    id: "teal",
    name: "Teal",
    description: "Calm aqua tones",
    colors: { primary: "#0D9488", accent: "#2DD4BF", gradient: "from-teal-600 via-cyan-500 to-sky-400" },
  },
  {
    id: "amber",
    name: "Amber",
    description: "Golden warmth",
    colors: { primary: "#D97706", accent: "#FCD34D", gradient: "from-amber-600 via-yellow-500 to-lime-400" },
  },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  currentTheme: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "violet",
  setTheme: () => {},
  currentTheme: themes[0],
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem("crm-portal-theme");
    return (saved as ThemeId) || "violet";
  });

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    localStorage.setItem("crm-portal-theme", t);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...themes.map((t) => `theme-${t.id}`));
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
