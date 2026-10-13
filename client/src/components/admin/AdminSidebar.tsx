import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  FolderOpen,
  FileText,
  ChevronRight,
  Sparkles,
  Layers,
  Hash,
  LifeBuoy,
  Bot,
  BarChart3,
  Mail,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminCategory {
  id: string;
  title: string;
  slug: string;
  folders: {
    id: string;
    title: string;
    slug: string;
    articles: { id: string; title: string; slug: string; description: string; content: string }[];
  }[];
}

interface AdminSidebarProps {
  categories: AdminCategory[];
  activeView: string;
  selectedCategory: string | null;
  selectedFolder: string | null;
  onSelectCategories: () => void;
  onSelectCategory: (id: string) => void;
  onSelectFolder: (catId: string, folderId: string) => void;
  onSelectView?: (view: "analytics" | "tickets" | "ai-settings" | "email-settings") => void;
  ticketCount?: number;
}

const AdminSidebar = ({
  categories,
  activeView,
  selectedCategory,
  selectedFolder,
  onSelectCategories,
  onSelectCategory,
  onSelectFolder,
  onSelectView,
  ticketCount,
}: AdminSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t } = useLanguage();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(selectedCategory ? [selectedCategory] : [])
  );

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header */}
      <SidebarHeader className={collapsed ? "px-0 py-4 flex items-center justify-center" : "px-4 py-5"}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-extrabold text-sidebar-foreground tracking-tight truncate">{t("sidebar.title")}</p>
              <p className="text-[11px] text-sidebar-foreground/40 font-medium">{t("sidebar.subtitle")}</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={collapsed ? "px-1 pt-2" : "px-2 pt-2"}>
        {/* Quick Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/30 font-bold px-3 mb-1">
            {t("sidebar.navigation")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "categories"}
                  onClick={onSelectCategories}
                  className={cn(
                    "h-10 rounded-xl gap-3 premium-transition data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold hover:bg-sidebar-accent/60",
                    collapsed ? "px-0 justify-center" : "px-3"
                  )}
                >
                  <div className={cn("rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0", collapsed ? "w-7 h-7" : "w-8 h-8")}>
                    <LayoutGrid className="w-4 h-4 text-sidebar-primary/70" />
                  </div>
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="text-[13px] font-medium">{t("sidebar.all_categories")}</span>
                      <span className="text-[10px] font-bold text-sidebar-foreground/30 bg-sidebar-accent rounded-md px-1.5 py-0.5 tabular-nums">
                        {categories.length}
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {onSelectView && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeView === "analytics"}
                      onClick={() => onSelectView("analytics")}
                      className={cn(
                        "h-10 rounded-xl gap-3 premium-transition data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold hover:bg-sidebar-accent/60",
                        collapsed ? "px-0 justify-center" : "px-3"
                      )}
                    >
                      <div className={cn("rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0", collapsed ? "w-7 h-7" : "w-8 h-8")}>
                        <BarChart3 className="w-4 h-4 text-sidebar-primary/70" />
                      </div>
                      {!collapsed && <span className="text-[13px] font-medium flex-1 text-left">Analytics</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeView === "tickets"}
                      onClick={() => onSelectView("tickets")}
                      className={cn(
                        "h-10 rounded-xl gap-3 premium-transition data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold hover:bg-sidebar-accent/60",
                        collapsed ? "px-0 justify-center" : "px-3"
                      )}
                    >
                      <div className={cn("rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0", collapsed ? "w-7 h-7" : "w-8 h-8")}>
                        <LifeBuoy className="w-4 h-4 text-sidebar-primary/70" />
                      </div>
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="text-[13px] font-medium">Tickets</span>
                          {typeof ticketCount === "number" && ticketCount > 0 && (
                            <span className="text-[10px] font-bold text-sidebar-foreground/30 bg-sidebar-accent rounded-md px-1.5 py-0.5 tabular-nums">
                              {ticketCount}
                            </span>
                          )}
                        </div>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeView === "ai-settings"}
                      onClick={() => onSelectView("ai-settings")}
                      className={cn(
                        "h-10 rounded-xl gap-3 premium-transition data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold hover:bg-sidebar-accent/60",
                        collapsed ? "px-0 justify-center" : "px-3"
                      )}
                    >
                      <div className={cn("rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0", collapsed ? "w-7 h-7" : "w-8 h-8")}>
                        <Bot className="w-4 h-4 text-sidebar-primary/70" />
                      </div>
                      {!collapsed && <span className="text-[13px] font-medium flex-1 text-left">AI Settings</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeView === "email-settings"}
                      onClick={() => onSelectView("email-settings")}
                      className={cn(
                        "h-10 rounded-xl gap-3 premium-transition data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold hover:bg-sidebar-accent/60",
                        collapsed ? "px-0 justify-center" : "px-3"
                      )}
                    >
                      <div className={cn("rounded-lg bg-sidebar-accent flex items-center justify-center shrink-0", collapsed ? "w-7 h-7" : "w-8 h-8")}>
                        <Mail className="w-4 h-4 text-sidebar-primary/70" />
                      </div>
                      {!collapsed && <span className="text-[13px] font-medium flex-1 text-left">Email Settings</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Tree */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/30 font-bold px-3 mb-1">
            {t("sidebar.content")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((cat) => {
                const isExpanded = expandedCats.has(cat.id);
                const isCatActive = selectedCategory === cat.id && activeView === "folders";

                return (
                  <Collapsible key={cat.id} open={isExpanded} onOpenChange={() => toggleCat(cat.id)}>
                    <SidebarMenuItem>
                      <div className="flex items-center w-full">
                        <SidebarMenuButton
                          isActive={isCatActive}
                          onClick={() => {
                            onSelectCategory(cat.id);
                            if (!expandedCats.has(cat.id)) toggleCat(cat.id);
                          }}
                          className={cn(
                            "flex-1 h-9 rounded-xl gap-2.5 premium-transition data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold hover:bg-sidebar-accent/60",
                            collapsed ? "px-0 justify-center" : "px-3"
                          )}
                        >
                          <Layers className="w-4 h-4 text-sidebar-primary/40 shrink-0" />
                          {!collapsed && (
                            <span className="truncate text-[13px] font-medium flex-1">{cat.title}</span>
                          )}
                        </SidebarMenuButton>
                        {!collapsed && cat.folders.length > 0 && (
                          <CollapsibleTrigger asChild>
                            <button className="p-1.5 mr-1 rounded-lg hover:bg-sidebar-accent/60 premium-transition">
                              <ChevronRight
                                className={`w-3 h-3 text-sidebar-foreground/30 premium-transition ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                          </CollapsibleTrigger>
                        )}
                      </div>

                      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                        <SidebarMenu className="ml-4 mt-1 pl-3 border-l-2 border-sidebar-primary/15">
                          {cat.folders.map((folder) => {
                            const isFolderActive = selectedFolder === folder.id;
                            return (
                              <SidebarMenuItem key={folder.id}>
                                <SidebarMenuButton
                                  isActive={isFolderActive}
                                  onClick={() => onSelectFolder(cat.id, folder.id)}
                                  className="h-8 rounded-lg px-2.5 gap-2 premium-transition data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:font-semibold hover:bg-sidebar-accent/60"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-sidebar-foreground/30 shrink-0" />
                                  {!collapsed && (
                                    <div className="flex items-center justify-between flex-1 min-w-0">
                                      <span className="truncate text-xs font-medium">{folder.title}</span>
                                      <span className="text-[10px] text-sidebar-foreground/25 tabular-nums font-medium">
                                        {folder.articles.length}
                                      </span>
                                    </div>
                                  )}
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}

              {categories.length === 0 && !collapsed && (
                <div className="flex flex-col items-center py-8 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-sidebar-accent flex items-center justify-center mb-3">
                    <Hash className="w-5 h-5 text-sidebar-foreground/20" />
                  </div>
                  <p className="text-xs text-sidebar-foreground/25 text-center font-medium">{t("sidebar.no_content")}</p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
        <ThemeSwitcher />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
