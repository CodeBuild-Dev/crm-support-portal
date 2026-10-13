import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutGrid, FolderOpen, FileText, Plus, Trash2, ChevronRight, ChevronLeft, ArrowLeft, Save, X, Pencil, Eye, EyeOff, BarChart3, History, GripVertical, Rocket, Headphones, Users, Bot, Phone, Mail, Contact, BookOpen, ShoppingCart, Globe, Shield, Zap, Settings, Heart, Star, MessageSquare, Calendar, Camera, Database, Map, Music, Palette, Search, Bookmark, Clock, Gift, Home, Key, Lightbulb, Target, Tv, Wifi, Check, ThumbsUp, ThumbsDown, FileCheck, FileEdit, LifeBuoy, Sparkles as SparklesIcon, Inbox, AlertCircle, CheckCircle2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useCategories, useCreateCategory, useDeleteCategory,
  useCreateFolder, useDeleteFolder,
  useCreateArticle, useUpdateArticle, useDeleteArticle,
  useArticleVersions, useRestoreVersion,
  useAnalyticsOverview, useTopArticles, useTopSearches,
  useTickets, useTicketStats, useUpdateTicket,
  useAdminAiSettings, useUpdateAiSettings,
  useEmailSettings, useUpdateEmailSettings,
} from "@/hooks/useData";
import { api } from "@/lib/api";
import { AdminCardSkeleton, AnalyticsSkeleton } from "@/components/LoadingSkeleton";

type ActiveView = "categories" | "folders" | "articles" | "edit-article" | "analytics" | "tickets" | "ai-settings" | "email-settings";

const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const categoryIconMap: Record<string, React.ElementType> = {
  Rocket, Headphones, Users, Bot, BarChart3, Phone, Mail, Contact,
  BookOpen, ShoppingCart, Globe, Shield, Zap, Settings, Heart, Star,
  MessageSquare, Calendar, Camera, Database, Map, Music, Palette,
  Search, Bookmark, Clock, Gift, Home, Key, Lightbulb, Target, Tv, Wifi,
  LayoutGrid, FolderOpen, FileText,
};

const availableIcons = Object.entries(categoryIconMap);

const AdminPage = () => {
  const { t } = useLanguage();

  const [activeView, setActiveView] = useState<ActiveView>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [showVersions, setShowVersions] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("Rocket");

  // Data from API (falls back to local)
  const { data: categoriesData = [], isLoading: catsLoading } = useCategories();

  // Local state for folder/article lists (fetched on demand)
  const [currentFolders, setCurrentFolders] = useState<any[]>([]);
  const [currentArticles, setCurrentArticles] = useState<any[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Mutations
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const restoreVersion = useRestoreVersion();

  // Analytics
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsOverview();
  const { data: topArticles = [] } = useTopArticles(10);
  const { data: topSearches = [] } = useTopSearches(10);

  // Version history
  const { data: versions = [] } = useArticleVersions(showVersions ? selectedArticle : null);

  // Tickets
  const [ticketStatusFilter, setTicketStatusFilter] = useState<"all" | "open" | "in_progress" | "closed">("all");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketEdits, setTicketEdits] = useState<{ status?: string; priority?: string; adminNotes?: string }>({});
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets(ticketStatusFilter === "all" ? undefined : ticketStatusFilter);
  const { data: ticketStats } = useTicketStats();
  const updateTicket = useUpdateTicket();

  // AI settings
  const { data: aiSettings, isLoading: aiSettingsLoading, error: aiSettingsError, refetch: refetchAiSettings } = useAdminAiSettings();
  const updateAiSettings = useUpdateAiSettings();

  // Email settings
  const { data: emailSettings, isLoading: emailSettingsLoading } = useEmailSettings();
  const updateEmailSettings = useUpdateEmailSettings();
  const [emailForm, setEmailForm] = useState<{ enabled: boolean; fromName: string; closeSubject: string; closeBody: string } | null>(null);
  useEffect(() => {
    if (emailSettings && !emailForm) {
      setEmailForm({
        enabled: emailSettings.enabled,
        fromName: emailSettings.fromName,
        closeSubject: emailSettings.closeSubject,
        closeBody: emailSettings.closeBody,
      });
    }
  }, [emailSettings, emailForm]);
  const [aiForm, setAiForm] = useState<{ enabled: boolean; botName: string; model: string; welcomeMessage: string; systemPrompt: string; suggestions: string[]; maxArticlesPerQuery: number } | null>(null);
  useEffect(() => {
    if (aiSettings && !aiForm) {
      setAiForm({
        enabled: aiSettings.enabled,
        botName: aiSettings.botName ?? "Aria",
        model: aiSettings.model,
        welcomeMessage: aiSettings.welcomeMessage,
        systemPrompt: aiSettings.systemPrompt,
        suggestions: Array.isArray(aiSettings.suggestions) ? aiSettings.suggestions : [],
        maxArticlesPerQuery: aiSettings.maxArticlesPerQuery ?? 5,
      });
    }
  }, [aiSettings, aiForm]);

  const currentCategory = categoriesData.find((c: any) => c.id === selectedCategory);

  // Fetch folders when selecting a category
  const selectCategory = async (id: string) => {
    setSelectedCategory(id);
    setSelectedFolder(null);
    setActiveView("folders");
    setCurrentPage(1);
    setFoldersLoading(true);
    try {
      const flds = await api.folders.listByCategory(id);
      setCurrentFolders(flds);
    } catch {
      // Fallback to local data
      const cat = categoriesData.find((c: any) => c.id === id);
      setCurrentFolders(cat?.folders || []);
    }
    setFoldersLoading(false);
  };

  // Fetch articles when selecting a folder
  const selectFolder = async (catId: string, folderId: string) => {
    setSelectedCategory(catId);
    setSelectedFolder(folderId);
    setActiveView("articles");
    setCurrentPage(1);
    setArticlesLoading(true);
    try {
      const res = await api.articles.listByFolder(folderId, 1, 100);
      setCurrentArticles(res.data);
    } catch {
      const cat = categoriesData.find((c: any) => c.id === catId);
      const folder = cat?.folders?.find((f: any) => f.id === folderId);
      setCurrentArticles(folder?.articles || []);
    }
    setArticlesLoading(false);
  };

  // CRUD handlers
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) { toast.error(t("admin.error_category_name")); return; }
    try {
      await createCategory.mutateAsync({ title: newCategoryName, slug: toSlug(newCategoryName), icon: newCategoryIcon });
      toast.success(`${t("admin.category_created")}: "${newCategoryName}"`);
      setShowAddCategoryModal(false);
      setNewCategoryName("");
      setNewCategoryIcon("Rocket");
    } catch { toast.error("Failed to create category"); }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      if (selectedCategory === id) { setSelectedCategory(null); setActiveView("categories"); }
      toast.success(t("admin.category_deleted"));
    } catch { toast.error("Failed to delete"); }
  };

  const handleAddFolder = async () => {
    if (!newItemName.trim() || !selectedCategory) { toast.error(t("admin.error_folder_name")); return; }
    try {
      await createFolder.mutateAsync({ categoryId: selectedCategory, title: newItemName, slug: toSlug(newItemName) });
      toast.success(`${t("admin.folder_created")}: "${newItemName}"`);
      selectCategory(selectedCategory); // Refresh folders
    } catch { toast.error("Failed to create folder"); }
    setNewItemName("");
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder.mutateAsync(id);
      if (selectedFolder === id) { setSelectedFolder(null); setActiveView("folders"); }
      toast.success(t("admin.folder_deleted"));
      if (selectedCategory) selectCategory(selectedCategory);
    } catch { toast.error("Failed to delete"); }
  };

  const handleAddArticle = async () => {
    if (!newItemName.trim() || !selectedFolder) { toast.error(t("admin.error_article_title")); return; }
    try {
      await createArticle.mutateAsync({ folderId: selectedFolder, title: newItemName, slug: toSlug(newItemName) });
      toast.success(`${t("admin.article_created")}: "${newItemName}"`);
      if (selectedCategory && selectedFolder) selectFolder(selectedCategory, selectedFolder);
    } catch { toast.error("Failed to create article"); }
    setNewItemName("");
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle.mutateAsync(id);
      if (selectedArticle === id) { setSelectedArticle(null); setActiveView("articles"); }
      toast.success(t("admin.article_deleted"));
      if (selectedCategory && selectedFolder) selectFolder(selectedCategory, selectedFolder);
    } catch { toast.error("Failed to delete"); }
  };

  const openEditArticle = (article: any) => {
    setSelectedArticle(article.id);
    setEditTitle(article.title);
    setEditSlug(article.slug);
    setEditDescription(article.description || "");
    setEditContent(article.content || "");
    setEditPublished(article.isPublished !== false);
    setShowVersions(false);
    setActiveView("edit-article");
  };

  const handleSaveArticle = async () => {
    if (!selectedArticle) return;
    try {
      await updateArticle.mutateAsync({
        id: selectedArticle,
        data: { title: editTitle, slug: editSlug, description: editDescription, content: editContent, isPublished: editPublished },
      });
      toast.success(t("admin.article_saved"));
      setActiveView("articles");
      if (selectedCategory && selectedFolder) selectFolder(selectedCategory, selectedFolder);
    } catch { toast.error("Failed to save article"); }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!selectedArticle) return;
    try {
      const article = await restoreVersion.mutateAsync({ id: selectedArticle, versionId });
      setEditTitle(article.title);
      setEditSlug(article.slug);
      setEditDescription(article.description || "");
      setEditContent(article.content || "");
      toast.success("Version restored");
    } catch { toast.error("Failed to restore"); }
  };

  // Breadcrumb
  const getBreadcrumb = () => {
    const parts: { label: string; onClick?: () => void }[] = [
      { label: t("admin.categories"), onClick: () => { setActiveView("categories"); setSelectedCategory(null); setSelectedFolder(null); setSelectedArticle(null); } },
    ];
    if (currentCategory && activeView !== "categories" && activeView !== "analytics" && activeView !== "tickets" && activeView !== "ai-settings" && activeView !== "email-settings") {
      parts.push({ label: currentCategory.title, onClick: () => selectCategory(currentCategory.id) });
    }
    if (selectedFolder && (activeView === "articles" || activeView === "edit-article")) {
      const folder = currentFolders.find((f: any) => f.id === selectedFolder);
      if (folder) parts.push({ label: folder.title, onClick: () => { if (selectedCategory) selectFolder(selectedCategory, selectedFolder); } });
    }
    if (activeView === "edit-article") parts.push({ label: editTitle || t("admin.edit_article") });
    if (activeView === "analytics") parts.push({ label: "Analytics" });
    if (activeView === "tickets") parts.push({ label: "Tickets" });
    if (activeView === "ai-settings") parts.push({ label: "AI Settings" });
    if (activeView === "email-settings") parts.push({ label: "Email Settings" });
    return parts;
  };

  // Shared UI components
  const ContentCard = ({ icon: Icon, title, subtitle, badges, onDelete, onClick, children }: any) => (
    <div className="group relative flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.06] premium-transition cursor-pointer animate-fade-in" onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/30 flex items-center justify-center ring-1 ring-primary/[0.06] group-hover:ring-primary/20 group-hover:scale-105 premium-transition">
          <Icon className="w-5 h-5 text-primary/60 group-hover:text-primary premium-transition" />
        </div>
        <div>
          <p className="font-semibold text-[14px] text-card-foreground tracking-tight">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground/50 mt-0.5 line-clamp-1">{subtitle}</p>}
          {badges && <div className="flex items-center gap-1.5 mt-1.5">{badges.map((b: any, i: number) => <Badge key={i} variant={b.variant || "secondary"} className="text-[10px] font-semibold px-2 py-0 h-5 rounded-md bg-muted/60">{b.label}</Badge>)}</div>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {children}
        {onDelete && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive hover:bg-destructive/8 premium-transition" onClick={(e: any) => { e.stopPropagation(); onDelete(); }}><Trash2 className="w-3.5 h-3.5" /></Button>}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center opacity-30 group-hover:opacity-100 group-hover:bg-primary/6 premium-transition"><ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 premium-transition" /></div>
      </div>
    </div>
  );

  const EmptyState = ({ icon: Icon, message }: any) => (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-border/30 bg-gradient-to-b from-muted/10 to-transparent">
      <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-4 animate-float"><Icon className="w-7 h-7 text-muted-foreground/20" /></div>
      <p className="text-sm text-muted-foreground/40 font-medium">{message}</p>
    </div>
  );

  const PaginationBar = ({ total }: { total: number }) => {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-2 animate-fade-in">
        <p className="text-xs text-muted-foreground/50">
          {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)} of {total}
        </p>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)} className="h-8 w-8 p-0 rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(p)} className="h-8 w-8 p-0 rounded-lg text-xs font-semibold">
              {p}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="h-8 w-8 p-0 rounded-lg">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const paginate = <T,>(items: T[]) => items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="animate-slide-up"><h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">{title}</h1><p className="text-xs md:text-sm text-muted-foreground/50 mt-1">{subtitle}</p></div>
  );

  const AddItemBar = ({ placeholder, onAdd, buttonText }: { placeholder: string; onAdd: () => void; buttonText: string }) => (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="relative flex-1 sm:max-w-md"><Input placeholder={placeholder} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAdd()} className="h-11 rounded-xl border-border/50 bg-background pl-4 pr-4 text-sm placeholder:text-muted-foreground/35 focus-visible:ring-primary/30" /></div>
      <Button onClick={onAdd} size="default" className="h-11 px-5 rounded-xl gap-2 font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] premium-transition w-full sm:w-auto"><Plus className="w-4 h-4" />{buttonText}</Button>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case "categories":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <SectionHeader title={t("admin.categories")} subtitle={t("admin.categories_subtitle")} />
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowAddCategoryModal(true)} className="h-10 px-4 rounded-xl gap-2 font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] premium-transition"><Plus className="w-4 h-4" />{t("admin.add_category")}</Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-2 h-10" onClick={() => setActiveView("analytics")}><BarChart3 className="w-4 h-4" /> Analytics</Button>
              </div>
            </div>

            {/* Add Category Modal */}
            <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">{t("admin.add_category")}</DialogTitle>
                  <DialogDescription>Create a new category with a name and icon.</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 block">{t("admin.title")}</label>
                    <Input
                      placeholder={t("admin.new_category_placeholder")}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      className="h-11 rounded-xl"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 block">Icon</label>
                    <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1 rounded-xl border border-border/40 bg-muted/20">
                      {availableIcons.map(([name, Icon]) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setNewCategoryIcon(name)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center premium-transition ${
                            newCategoryIcon === name
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-110"
                              : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                          }`}
                          title={name}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="flex-1 h-11 rounded-xl gap-2 font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] premium-transition">
                      <Plus className="w-4 h-4" /> {t("admin.add_category")}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddCategoryModal(false)} className="h-11 rounded-xl px-5">
                      {t("admin.cancel")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {catsLoading ? <AdminCardSkeleton /> : (
              <div className="space-y-3">
                <div className="grid gap-2.5">
                  {paginate(categoriesData).map((cat: any) => {
                    const CatIcon = categoryIconMap[cat.icon] || LayoutGrid;
                    return (
                      <ContentCard key={cat.id} icon={CatIcon} title={cat.title}
                        badges={[{ label: `${cat.folderCount ?? cat.folders?.length ?? 0} ${t("admin.folders")}` }, { label: `${cat.articleCount ?? 0} ${t("admin.articles")}`, variant: "outline" }]}
                        onDelete={() => handleDeleteCategory(cat.id)}
                        onClick={() => selectCategory(cat.id)} />
                    );
                  })}
                  {categoriesData.length === 0 && <EmptyState icon={LayoutGrid} message={t("admin.no_categories")} />}
                </div>
                <PaginationBar total={categoriesData.length} />
              </div>
            )}
          </div>
        );

      case "folders":
        return (
          <div className="space-y-8">
            <SectionHeader title={currentCategory?.title || ""} subtitle={t("admin.manage_subcategories")} />
            <AddItemBar placeholder={t("admin.new_folder_placeholder")} onAdd={handleAddFolder} buttonText={t("admin.add_folder")} />
            {foldersLoading ? <AdminCardSkeleton /> : (
              <div className="space-y-3">
                <div className="grid gap-2.5">
                  {paginate(currentFolders).map((folder: any) => (
                    <ContentCard key={folder.id} icon={FolderOpen} title={folder.title}
                      badges={[{ label: `${folder.articleCount ?? folder.articles?.length ?? 0} ${t("admin.articles")}` }]}
                      onDelete={() => handleDeleteFolder(folder.id)}
                      onClick={() => { if (selectedCategory) selectFolder(selectedCategory, folder.id); }} />
                  ))}
                  {currentFolders.length === 0 && <EmptyState icon={FolderOpen} message={t("admin.no_folders")} />}
                </div>
                <PaginationBar total={currentFolders.length} />
              </div>
            )}
          </div>
        );

      case "articles":
        return (
          <div className="space-y-8">
            <SectionHeader title={currentFolders.find((f: any) => f.id === selectedFolder)?.title || ""} subtitle={t("admin.manage_articles")} />
            <AddItemBar placeholder={t("admin.new_article_placeholder")} onAdd={handleAddArticle} buttonText={t("admin.add_article")} />
            {articlesLoading ? <AdminCardSkeleton /> : (
              <div className="space-y-3">
                <div className="grid gap-2.5">
                  {paginate(currentArticles).map((article: any) => (
                    <ContentCard key={article.id} icon={FileText} title={article.title}
                      subtitle={article.description || t("admin.no_description")}
                      onDelete={() => handleDeleteArticle(article.id)}
                      onClick={() => openEditArticle(article)}>
                      {article.isPublished === false && <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-300 mr-1">Draft</Badge>}
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 text-primary/60 hover:text-primary hover:bg-primary/8 premium-transition"
                        onClick={(e: any) => { e.stopPropagation(); openEditArticle(article); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    </ContentCard>
                  ))}
                  {currentArticles.length === 0 && <EmptyState icon={FileText} message={t("admin.no_articles")} />}
                </div>
                <PaginationBar total={currentArticles.length} />
              </div>
            )}
          </div>
        );

      case "edit-article":
        return (
          <div className="space-y-5 md:space-y-6 max-w-4xl animate-slide-up">
            <div className="flex items-center justify-between">
              <SectionHeader title={t("admin.edit_article")} subtitle={t("admin.edit_article_subtitle")} />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={editPublished} onCheckedChange={setEditPublished} />
                  <span className="text-xs font-medium text-muted-foreground">{editPublished ? <span className="flex items-center gap-1 text-primary"><Eye className="w-3.5 h-3.5" /> Published</span> : <span className="flex items-center gap-1 text-orange-500"><EyeOff className="w-3.5 h-3.5" /> Draft</span>}</span>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" onClick={() => setShowVersions(!showVersions)}>
                  <History className="w-3.5 h-3.5" /> History
                </Button>
              </div>
            </div>

            {/* Version history panel */}
            {showVersions && (
              <div className="p-4 rounded-xl border border-border/40 bg-muted/20 animate-fade-in">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Version History</h3>
                {versions.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {versions.map((v: any) => (
                      <div key={v.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-card premium-transition">
                        <div>
                          <p className="text-xs font-medium text-foreground">v{v.version} — {v.title}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-[10px] h-7 rounded-lg" onClick={() => handleRestoreVersion(v.id)}>Restore</Button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-muted-foreground/50">No versions yet. Save to create first version.</p>}
              </div>
            )}

            <div className="grid gap-4 md:gap-5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div><label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 block">{t("admin.title")}</label><Input value={editTitle} onChange={(e) => { setEditTitle(e.target.value); setEditSlug(toSlug(e.target.value)); }} className="h-11 rounded-xl border-border/50 bg-background" /></div>
                <div><label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 block">{t("admin.slug")} <span className="normal-case font-medium text-muted-foreground/40">({t("admin.slug_auto")})</span></label><Input value={editSlug} readOnly tabIndex={-1} className="h-11 rounded-xl font-mono text-sm border-border/50 bg-muted/30 text-muted-foreground cursor-default focus-visible:ring-0" /></div>
              </div>
              <div><label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2 block">{t("admin.description")}</label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder={t("admin.description_placeholder")} className="h-11 rounded-xl border-border/50 bg-background" /></div>
            </div>
            <div><label className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-3 block">{t("admin.content")}</label><RichTextEditor content={editContent} onChange={setEditContent} /></div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveArticle} className="h-11 px-6 rounded-xl gap-2 font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] premium-transition"><Save className="w-4 h-4" /> {t("admin.save")}</Button>
              <Button variant="outline" onClick={() => setActiveView("articles")} className="h-11 px-6 rounded-xl gap-2 font-medium border-border/50 hover:bg-accent/50"><X className="w-4 h-4" /> {t("admin.cancel")}</Button>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-8 animate-slide-up">
            <SectionHeader title="Analytics" subtitle="Content performance and search insights" />
            {analyticsLoading ? <AnalyticsSkeleton /> : analytics ? (
              <>
                {/* Hero stats — large cards with icon, value, and contextual breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  {[
                    {
                      label: "Categories",
                      value: analytics.categories ?? 0,
                      icon: LayoutGrid,
                      accent: "text-primary",
                      bg: "bg-primary/10",
                      hint: <>All organized</>,
                    },
                    {
                      label: "Articles",
                      value: analytics.articles ?? 0,
                      icon: FileText,
                      accent: "text-foreground",
                      bg: "bg-foreground/5",
                      hint: (
                        <span className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-primary"><FileCheck className="w-3.5 h-3.5" /> {analytics.published ?? 0} published</span>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="flex items-center gap-1.5 text-orange-500"><FileEdit className="w-3.5 h-3.5" /> {analytics.drafts ?? 0} drafts</span>
                        </span>
                      ),
                    },
                    {
                      label: "Total Views",
                      value: analytics.totalViews ?? 0,
                      icon: Eye,
                      accent: "text-sky-500",
                      bg: "bg-sky-500/10",
                      hint: <>Across all articles</>,
                    },
                    {
                      label: "Helpful Votes",
                      value: analytics.totalHelpful ?? 0,
                      icon: ThumbsUp,
                      accent: "text-emerald-500",
                      bg: "bg-emerald-500/10",
                      hint: (
                        <span className="flex items-center gap-1.5 text-destructive">
                          <ThumbsDown className="w-3.5 h-3.5" /> {analytics.totalNotHelpful ?? 0} not helpful
                        </span>
                      ),
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="group relative p-5 md:p-6 rounded-2xl border border-border/40 bg-card overflow-hidden premium-transition hover:border-border/80" style={{ boxShadow: "var(--card-shadow)" }}>
                        <div className="flex items-start justify-between">
                          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">{stat.label}</p>
                          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${stat.accent}`} />
                          </div>
                        </div>
                        <p className="text-4xl font-extrabold text-foreground mt-3 tabular-nums tracking-tight">{stat.value}</p>
                        <div className="mt-3 pt-3 border-t border-border/40 text-[11px] font-medium text-muted-foreground">
                          {stat.hint}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Insights — top articles and top searches */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
                  <div className="p-5 md:p-6 rounded-2xl border border-border/40 bg-card" style={{ boxShadow: "var(--card-shadow)" }}>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-primary" /></div>
                      <h3 className="text-sm font-bold text-foreground">Top Articles by Views</h3>
                    </div>
                    {topArticles.length > 0 ? (
                      <div className="space-y-1">
                        {topArticles.map((a: any, i: number) => (
                          <div key={a.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/40 premium-transition">
                            <span className={`text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center tabular-nums ${i < 3 ? "bg-primary/10 text-primary" : "text-muted-foreground/50"}`}>{i + 1}</span>
                            <p className="text-xs font-medium text-foreground flex-1 truncate">{a.title}</p>
                            <span className="text-xs font-semibold text-primary tabular-nums">{a.viewCount}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground/50 py-4 text-center">No data yet</p>}
                  </div>
                  <div className="p-5 md:p-6 rounded-2xl border border-border/40 bg-card" style={{ boxShadow: "var(--card-shadow)" }}>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center"><Search className="w-4 h-4 text-sky-500" /></div>
                      <h3 className="text-sm font-bold text-foreground">Top Search Terms</h3>
                    </div>
                    {topSearches.length > 0 ? (
                      <div className="space-y-1">
                        {topSearches.map((s: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/40 premium-transition">
                            <span className={`text-xs font-bold w-6 h-6 rounded-md flex items-center justify-center tabular-nums ${i < 3 ? "bg-sky-500/10 text-sky-500" : "text-muted-foreground/50"}`}>{i + 1}</span>
                            <p className="text-xs font-medium text-foreground flex-1 truncate">"{s.query}"</p>
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">{s.searches}x</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground/50 py-4 text-center">No searches yet</p>}
                  </div>
                </div>
              </>
            ) : <p className="text-sm text-muted-foreground">Connect backend to see analytics</p>}
          </div>
        );

      case "tickets": {
        const stats = ticketStats;
        const statusPill = (s: string) => {
          if (s === "open") return "bg-amber-500/15 text-amber-600";
          if (s === "in_progress") return "bg-sky-500/15 text-sky-600";
          if (s === "closed") return "bg-emerald-500/15 text-emerald-600";
          return "bg-muted text-muted-foreground";
        };
        const priorityPill = (p: string) => {
          if (p === "high") return "bg-destructive/15 text-destructive";
          if (p === "medium") return "bg-orange-500/15 text-orange-600";
          return "bg-muted text-muted-foreground";
        };
        return (
          <div className="space-y-8 animate-slide-up">
            <SectionHeader title="Support Tickets" subtitle="Customer questions that the AI couldn't resolve" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Open", value: stats?.open ?? 0, icon: Inbox, accent: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "In Progress", value: stats?.inProgress ?? 0, icon: AlertCircle, accent: "text-sky-500", bg: "bg-sky-500/10" },
                { label: "Closed", value: stats?.closed ?? 0, icon: CheckCircle2, accent: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Total", value: stats?.total ?? 0, icon: LifeBuoy, accent: "text-primary", bg: "bg-primary/10" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="p-4 rounded-2xl border border-border/40 bg-card" style={{ boxShadow: "var(--card-shadow)" }}>
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">{s.label}</p>
                      <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${s.accent}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-foreground mt-2 tabular-nums">{s.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "open", "in_progress", "closed"] as const).map((f) => (
                <Button
                  key={f}
                  variant={ticketStatusFilter === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTicketStatusFilter(f)}
                  className="h-8 rounded-lg text-xs font-semibold capitalize"
                >
                  {f.replace("_", " ")}
                </Button>
              ))}
            </div>

            {ticketsLoading ? (
              <AdminCardSkeleton />
            ) : tickets.length === 0 ? (
              <EmptyState icon={LifeBuoy} message="No tickets yet." />
            ) : (
              <div className="grid gap-2.5">
                {tickets.map((tk: any) => (
                  <div
                    key={tk.id}
                    onClick={() => { setSelectedTicket(tk); setTicketEdits({ status: tk.status, priority: tk.priority, adminNotes: tk.adminNotes ?? "" }); }}
                    className="group flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.06] premium-transition cursor-pointer animate-fade-in"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <LifeBuoy className="w-5 h-5 text-primary/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[14px] text-foreground truncate">{tk.subject}</p>
                        <p className="text-xs text-muted-foreground/60 truncate">{tk.name} · {tk.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${statusPill(tk.status)}`}>{tk.status.replace("_", " ")}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${priorityPill(tk.priority)}`}>{tk.priority}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary premium-transition" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Dialog open={!!selectedTicket} onOpenChange={(o) => !o && setSelectedTicket(null)}>
              <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                {selectedTicket && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold pr-6">{selectedTicket.subject}</DialogTitle>
                      <DialogDescription>
                        From <span className="font-semibold text-foreground">{selectedTicket.name}</span> ({selectedTicket.email})
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-2">
                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Description</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap rounded-xl bg-muted/30 p-3">{selectedTicket.description}</p>
                      </div>

                      {Array.isArray(selectedTicket.transcript) && selectedTicket.transcript.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Chat transcript</p>
                          <div className="rich-content space-y-2 rounded-xl border border-border/40 p-3 max-h-64 overflow-y-auto">
                            {selectedTicket.transcript.map((m: any, i: number) => (
                              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border/50 rounded-bl-sm"}`}>
                                  {m.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Status</p>
                          <select
                            value={ticketEdits.status ?? selectedTicket.status}
                            onChange={(e) => setTicketEdits({ ...ticketEdits, status: e.target.value })}
                            className="w-full h-10 rounded-xl bg-background border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In progress</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Priority</p>
                          <select
                            value={ticketEdits.priority ?? selectedTicket.priority}
                            onChange={(e) => setTicketEdits({ ...ticketEdits, priority: e.target.value })}
                            className="w-full h-10 rounded-xl bg-background border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Admin notes</p>
                        <textarea
                          value={ticketEdits.adminNotes ?? ""}
                          onChange={(e) => setTicketEdits({ ...ticketEdits, adminNotes: e.target.value })}
                          rows={3}
                          className="w-full rounded-xl bg-background border border-border/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          placeholder="Internal notes (not visible to customer)..."
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setSelectedTicket(null)}>Cancel</Button>
                        <Button
                          onClick={async () => {
                            await updateTicket.mutateAsync({ id: selectedTicket.id, data: ticketEdits });
                            toast.success("Ticket updated");
                            setSelectedTicket(null);
                          }}
                          disabled={updateTicket.isPending}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" /> Save
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
      }

      case "ai-settings":
        return (
          <div className="space-y-8 animate-slide-up">
            <SectionHeader title="AI Settings" subtitle="Configure the support chat bot's behavior" />
            {aiSettingsError ? (
              <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-3">
                <p className="font-semibold text-destructive">Couldn't load AI settings</p>
                <p className="text-sm text-foreground/80">{(aiSettingsError as Error)?.message || "Unknown error"}</p>
                <p className="text-xs text-muted-foreground">
                  Most likely: the <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">ai_settings</code> table hasn't been created yet. Check Railway build logs for the <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">drizzle-kit push</code> step, or run it manually against the production DB.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetchAiSettings()} className="gap-2">Retry</Button>
              </div>
            ) : aiSettingsLoading || !aiForm ? (
              <AdminCardSkeleton />
            ) : (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-border/40 bg-card flex items-center justify-between" style={{ boxShadow: "var(--card-shadow)" }}>
                  <div>
                    <p className="font-semibold text-foreground">Chat bot enabled</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Turn off to hide the chat widget from the public site.</p>
                  </div>
                  <Switch checked={aiForm.enabled} onCheckedChange={(v) => setAiForm({ ...aiForm, enabled: v })} />
                </div>

                <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4" style={{ boxShadow: "var(--card-shadow)" }}>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
                      Bot name <span className="text-muted-foreground/40 normal-case ml-1">— shown in the chat widget header</span>
                    </p>
                    <Input
                      value={aiForm.botName}
                      onChange={(e) => setAiForm({ ...aiForm, botName: e.target.value })}
                      placeholder="e.g. Aria"
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Model</p>
                    <select
                      value={aiForm.model}
                      onChange={(e) => setAiForm({ ...aiForm, model: e.target.value })}
                      className="w-full h-11 rounded-xl bg-background border border-border/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (balanced)</option>
                      <option value="claude-opus-4-7">Claude Opus 4.7 (most capable)</option>
                      <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (fastest)</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Welcome message</p>
                    <Input
                      value={aiForm.welcomeMessage}
                      onChange={(e) => setAiForm({ ...aiForm, welcomeMessage: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
                      Suggested prompts
                      <span className="text-muted-foreground/40 normal-case ml-1">— chip buttons shown before the first message (max 10)</span>
                    </p>
                    <div className="space-y-2">
                      {aiForm.suggestions.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={s}
                            onChange={(e) => {
                              const next = [...aiForm.suggestions];
                              next[i] = e.target.value;
                              setAiForm({ ...aiForm, suggestions: next });
                            }}
                            placeholder="e.g. How do I get started?"
                            className="h-10 rounded-xl flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const next = aiForm.suggestions.filter((_, j) => j !== i);
                              setAiForm({ ...aiForm, suggestions: next });
                            }}
                            className="h-10 w-10 rounded-xl text-destructive/60 hover:text-destructive hover:bg-destructive/8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {aiForm.suggestions.length < 10 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAiForm({ ...aiForm, suggestions: [...aiForm.suggestions, ""] })}
                          className="h-9 rounded-xl gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add suggestion
                        </Button>
                      )}
                      {aiForm.suggestions.length === 0 && (
                        <p className="text-xs text-muted-foreground/50">No suggestions yet. Customers will just see the chat input.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
                      System prompt <span className="text-muted-foreground/40 normal-case ml-1">— the bot's persona and rules</span>
                    </p>
                    <textarea
                      value={aiForm.systemPrompt}
                      onChange={(e) => setAiForm({ ...aiForm, systemPrompt: e.target.value })}
                      rows={10}
                      className="w-full rounded-xl bg-background border border-border/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[200px] font-mono"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
                      Max articles per query
                      <span className="text-muted-foreground/40 normal-case ml-1">— how many knowledge-base articles to include as context</span>
                    </p>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={aiForm.maxArticlesPerQuery}
                      onChange={(e) => setAiForm({ ...aiForm, maxArticlesPerQuery: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) })}
                      className="h-11 rounded-xl w-32"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (aiSettings) {
                        setAiForm({
                          enabled: aiSettings.enabled,
                          botName: aiSettings.botName ?? "Aria",
                          model: aiSettings.model,
                          welcomeMessage: aiSettings.welcomeMessage,
                          systemPrompt: aiSettings.systemPrompt,
                          suggestions: Array.isArray(aiSettings.suggestions) ? aiSettings.suggestions : [],
                          maxArticlesPerQuery: aiSettings.maxArticlesPerQuery ?? 5,
                        });
                      }
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={async () => {
                      // Drop empty suggestion rows before saving
                      const clean = { ...aiForm, suggestions: aiForm.suggestions.map((s) => s.trim()).filter(Boolean) };
                      await updateAiSettings.mutateAsync(clean);
                      toast.success("AI settings saved");
                    }}
                    disabled={updateAiSettings.isPending}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" /> Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case "email-settings":
        return (
          <div className="space-y-8 animate-slide-up">
            <SectionHeader title="Email Settings" subtitle="Notify customers automatically when their tickets are resolved" />
            {emailSettingsLoading || !emailForm ? (
              <AdminCardSkeleton />
            ) : (
              <div className="space-y-5">
                {!emailSettings?.smtpConfigured && (
                  <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-sm">
                    <p className="font-semibold text-amber-600">SMTP not configured on the server</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set the <code className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">SMTP_HOST</code>, <code className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">SMTP_PORT</code>, <code className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">SMTP_USER</code>, <code className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">SMTP_PASS</code>, and <code className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">EMAIL_FROM</code> env vars in Railway. Until those are set, emails will not be sent even when enabled.
                    </p>
                  </div>
                )}

                <div className="p-5 rounded-2xl border border-border/40 bg-card flex items-center justify-between" style={{ boxShadow: "var(--card-shadow)" }}>
                  <div>
                    <p className="font-semibold text-foreground">Send email when a ticket is closed</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Customers get notified automatically once you mark their ticket as closed.</p>
                  </div>
                  <Switch checked={emailForm.enabled} onCheckedChange={(v) => setEmailForm({ ...emailForm, enabled: v })} />
                </div>

                <div className="p-5 rounded-2xl border border-border/40 bg-card space-y-4" style={{ boxShadow: "var(--card-shadow)" }}>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
                      From name <span className="text-muted-foreground/40 normal-case ml-1">— shown as the sender</span>
                    </p>
                    <Input
                      value={emailForm.fromName}
                      onChange={(e) => setEmailForm({ ...emailForm, fromName: e.target.value })}
                      placeholder="Support Team"
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
                      Close-email subject
                    </p>
                    <Input
                      value={emailForm.closeSubject}
                      onChange={(e) => setEmailForm({ ...emailForm, closeSubject: e.target.value })}
                      className="h-11 rounded-xl font-mono text-sm"
                    />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">
                      Close-email body
                    </p>
                    <textarea
                      value={emailForm.closeBody}
                      onChange={(e) => setEmailForm({ ...emailForm, closeBody: e.target.value })}
                      rows={12}
                      className="w-full rounded-xl bg-background border border-border/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[220px] font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground/60 mt-2">
                      Available variables: <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">&#123;&#123;name&#125;&#125;</code>{" "}
                      <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">&#123;&#123;subject&#125;&#125;</code>{" "}
                      <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">&#123;&#123;ticketRef&#125;&#125;</code>{" "}
                      <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">&#123;&#123;adminNotes&#125;&#125;</code>{" "}
                      <code className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">&#123;&#123;fromName&#125;&#125;</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (emailSettings) {
                        setEmailForm({
                          enabled: emailSettings.enabled,
                          fromName: emailSettings.fromName,
                          closeSubject: emailSettings.closeSubject,
                          closeBody: emailSettings.closeBody,
                        });
                      }
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={async () => {
                      await updateEmailSettings.mutateAsync(emailForm);
                      toast.success("Email settings saved");
                    }}
                    disabled={updateEmailSettings.isPending}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" /> Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar
          categories={categoriesData}
          activeView={activeView}
          selectedCategory={selectedCategory}
          selectedFolder={selectedFolder}
          onSelectCategories={() => { setActiveView("categories"); setSelectedCategory(null); setSelectedFolder(null); setSelectedArticle(null); setCurrentPage(1); }}
          onSelectCategory={(id) => selectCategory(id)}
          onSelectFolder={(catId, folderId) => selectFolder(catId, folderId)}
          onSelectView={(view) => { setActiveView(view); setCurrentPage(1); }}
          ticketCount={ticketStats?.open}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 md:h-14 flex items-center gap-2 md:gap-4 border-b border-border/30 bg-background/60 backdrop-blur-2xl px-3 md:px-6 sticky top-0 z-10">
            <SidebarTrigger className="hover:bg-accent/60 rounded-lg premium-transition" />
            <div className="w-px h-5 bg-border/30" />
            <nav className="flex items-center gap-1 text-xs md:text-sm min-w-0 overflow-hidden">
              {getBreadcrumb().map((crumb, i, arr) => (
                <span key={i} className="flex items-center gap-1 shrink-0 last:shrink min-w-0">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/25 shrink-0" />}
                  {crumb.onClick && i < arr.length - 1 ? (
                    <button onClick={crumb.onClick} className="text-muted-foreground/50 hover:text-foreground premium-transition font-medium truncate hidden sm:inline">{crumb.label}</button>
                  ) : (
                    <span className="text-foreground font-bold truncate">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <button
                onClick={() => { setActiveView("tickets"); setCurrentPage(1); }}
                aria-label={`Tickets${ticketStats?.open ? ` (${ticketStats.open} open)` : ""}`}
                className={`relative p-2 rounded-lg premium-transition ${
                  activeView === "tickets" ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Bell className={`w-4 h-4 ${ticketStats?.open ? "animate-[wiggle_1.2s_ease-in-out_infinite]" : ""}`} />
                {ticketStats?.open ? (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 tabular-nums ring-2 ring-background">
                    {ticketStats.open > 99 ? "99+" : ticketStats.open}
                  </span>
                ) : null}
              </button>
              <Link to="/" className="text-xs text-muted-foreground/40 hover:text-foreground premium-transition flex items-center gap-1.5 font-semibold"><ArrowLeft className="w-3 h-3" /> {t("admin.back_to_site")}</Link>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-auto"><div className="max-w-5xl mx-auto">{renderContent()}</div></main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
