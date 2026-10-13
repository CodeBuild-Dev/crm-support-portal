import { createContext, useContext, useState } from "react";

export type Lang = "en" | "de";

const translations = {
  en: {
    // Header
    "nav.home": "Home",
    "nav.admin": "Admin",

    // Hero
    "hero.title": "How can we help?",
    "hero.subtitle": "Search our knowledge base for guides, tutorials, and answers.",
    "hero.search_placeholder": "Search for articles...",
    "hero.no_results": "No articles found for",

    // Popular Articles
    "popular.title": "Popular Articles",
    "popular.view_all": "View all",

    // Category Page
    "category.search_placeholder": "Search in this category...",
    "category.no_results": "No articles found matching",
    "category.more_articles": "more articles",

    // Article Page
    "article.search_placeholder": "Search articles...",
    "article.no_results": "No results",
    "article.print": "Print",
    "article.sidebar_title": "Articles in this Folder",
    "article.coming_soon": "Article content coming soon.",

    // Admin
    "admin.categories": "Categories",
    "admin.categories_subtitle": "Manage your knowledge base categories",
    "admin.folders": "folders",
    "admin.articles": "articles",
    "admin.add_category": "Add Category",
    "admin.add_folder": "Add Folder",
    "admin.add_article": "Add Article",
    "admin.new_category_placeholder": "New category name...",
    "admin.new_folder_placeholder": "New sub-category name...",
    "admin.new_article_placeholder": "New article title...",
    "admin.manage_subcategories": "Manage sub-categories",
    "admin.manage_articles": "Manage articles",
    "admin.edit_article": "Edit Article",
    "admin.edit_article_subtitle": "Update article details and content",
    "admin.title": "Title",
    "admin.slug": "Slug",
    "admin.slug_auto": "auto",
    "admin.description": "Description",
    "admin.description_placeholder": "Brief description of the article...",
    "admin.content": "Content",
    "admin.save": "Save Article",
    "admin.cancel": "Cancel",
    "admin.back_to_site": "Back to Site",
    "admin.no_categories": "No categories yet. Create one above.",
    "admin.no_folders": "No sub-categories yet. Create one above.",
    "admin.no_articles": "No articles yet. Create one above.",
    "admin.no_description": "No description",
    "admin.category_created": "Category created",
    "admin.category_deleted": "Category deleted",
    "admin.folder_created": "Sub-category created",
    "admin.folder_deleted": "Sub-category deleted",
    "admin.article_created": "Article created",
    "admin.article_deleted": "Article deleted",
    "admin.article_saved": "Article saved successfully",
    "admin.error_category_name": "Please enter a category name",
    "admin.error_folder_name": "Please enter a sub-category name",
    "admin.error_article_title": "Please enter an article title",

    // Sidebar
    "sidebar.title": "Knowledge Base",
    "sidebar.subtitle": "Admin Console",
    "sidebar.navigation": "Navigation",
    "sidebar.all_categories": "All Categories",
    "sidebar.content": "Content",
    "sidebar.no_content": "No content yet",

    // Theme
    "theme.title": "Choose Theme",
    "theme.subtitle": "Applied to the entire site",
    "theme.button": "Theme",

    // Language
    "lang.button": "Language",
    "lang.title": "Choose Language",
    "lang.subtitle": "Applied to the entire site",

    // Editor
    "editor.insert_link": "Insert Link",
    "editor.insert_link_desc": "Add a URL to the selected text",
    "editor.link_placeholder": "https://example.com",
    "editor.embed_youtube": "Embed YouTube Video",
    "editor.embed_youtube_desc": "Paste a YouTube video URL",
    "editor.youtube_placeholder": "https://www.youtube.com/watch?v=...",
    "editor.insert_image": "Insert Image",
    "editor.insert_image_desc": "Paste an image URL",
    "editor.image_placeholder": "https://example.com/image.png",
    "editor.insert": "Insert",
    "editor.placeholder": "Start writing your article content...",
    "editor.words": "words",

    // Chat widget
    "chat.button": "Chat with us",
    "chat.title": "Support chat",
    "chat.subtitle": "AI assistant — answers from our knowledge base",
    "chat.placeholder": "Ask a question...",
    "chat.send": "Send",
    "chat.thinking": "Thinking…",
    "chat.error": "Something went wrong. Please try again.",
    "chat.didnt_help": "Didn't help?",
    "chat.raise_ticket": "Raise a ticket",
    "chat.back_to_chat": "Back to chat",
    "chat.ticket.title": "Raise a support ticket",
    "chat.ticket.subtitle": "Our team will get back to you by email.",
    "chat.ticket.name": "Your name",
    "chat.ticket.email": "Email address",
    "chat.ticket.subject": "Subject",
    "chat.ticket.description": "What do you need help with?",
    "chat.ticket.submit": "Submit ticket",
    "chat.ticket.submitting": "Submitting…",
    "chat.ticket.submitted": "Ticket received",
    "chat.ticket.confirm": "We'll email you at",
    "chat.ticket.ref": "Reference",
    "chat.ticket.close": "Close",

    // 404
    "notfound.title": "404",
    "notfound.message": "Oops! Page not found.",
    "notfound.back": "Return to Home",
  },
  de: {
    // Header
    "nav.home": "Startseite",
    "nav.admin": "Admin",

    // Hero
    "hero.title": "Wie können wir helfen?",
    "hero.subtitle": "Durchsuche unsere Wissensdatenbank nach Anleitungen und Antworten.",
    "hero.search_placeholder": "Artikel suchen...",
    "hero.no_results": "Keine Artikel gefunden für",

    // Popular Articles
    "popular.title": "Beliebte Artikel",
    "popular.view_all": "Alle anzeigen",

    // Category Page
    "category.search_placeholder": "In dieser Kategorie suchen...",
    "category.no_results": "Keine Artikel gefunden für",
    "category.more_articles": "weitere Artikel",

    // Article Page
    "article.search_placeholder": "Artikel suchen...",
    "article.no_results": "Keine Ergebnisse",
    "article.print": "Drucken",
    "article.sidebar_title": "Artikel in diesem Ordner",
    "article.coming_soon": "Artikelinhalt kommt bald.",

    // Admin
    "admin.categories": "Kategorien",
    "admin.categories_subtitle": "Verwalte deine Wissensdatenbank-Kategorien",
    "admin.folders": "Ordner",
    "admin.articles": "Artikel",
    "admin.add_category": "Kategorie hinzufügen",
    "admin.add_folder": "Ordner hinzufügen",
    "admin.add_article": "Artikel hinzufügen",
    "admin.new_category_placeholder": "Neuer Kategoriename...",
    "admin.new_folder_placeholder": "Neuer Unterkategoriename...",
    "admin.new_article_placeholder": "Neuer Artikeltitel...",
    "admin.manage_subcategories": "Unterkategorien verwalten",
    "admin.manage_articles": "Artikel verwalten",
    "admin.edit_article": "Artikel bearbeiten",
    "admin.edit_article_subtitle": "Artikeldetails und Inhalt aktualisieren",
    "admin.title": "Titel",
    "admin.slug": "Slug",
    "admin.slug_auto": "auto",
    "admin.description": "Beschreibung",
    "admin.description_placeholder": "Kurze Beschreibung des Artikels...",
    "admin.content": "Inhalt",
    "admin.save": "Artikel speichern",
    "admin.cancel": "Abbrechen",
    "admin.back_to_site": "Zurück zur Seite",
    "admin.no_categories": "Noch keine Kategorien. Erstelle eine oben.",
    "admin.no_folders": "Noch keine Unterkategorien. Erstelle eine oben.",
    "admin.no_articles": "Noch keine Artikel. Erstelle einen oben.",
    "admin.no_description": "Keine Beschreibung",
    "admin.category_created": "Kategorie erstellt",
    "admin.category_deleted": "Kategorie gelöscht",
    "admin.folder_created": "Unterkategorie erstellt",
    "admin.folder_deleted": "Unterkategorie gelöscht",
    "admin.article_created": "Artikel erstellt",
    "admin.article_deleted": "Artikel gelöscht",
    "admin.article_saved": "Artikel erfolgreich gespeichert",
    "admin.error_category_name": "Bitte gib einen Kategorienamen ein",
    "admin.error_folder_name": "Bitte gib einen Unterkategorienamen ein",
    "admin.error_article_title": "Bitte gib einen Artikeltitel ein",

    // Sidebar
    "sidebar.title": "Wissensdatenbank",
    "sidebar.subtitle": "Admin-Konsole",
    "sidebar.navigation": "Navigation",
    "sidebar.all_categories": "Alle Kategorien",
    "sidebar.content": "Inhalt",
    "sidebar.no_content": "Noch kein Inhalt",

    // Theme
    "theme.title": "Design wählen",
    "theme.subtitle": "Wird auf die gesamte Seite angewendet",
    "theme.button": "Design",

    // Language
    "lang.button": "Sprache",
    "lang.title": "Sprache wählen",
    "lang.subtitle": "Wird auf die gesamte Seite angewendet",

    // Editor
    "editor.insert_link": "Link einfügen",
    "editor.insert_link_desc": "URL zum markierten Text hinzufügen",
    "editor.link_placeholder": "https://beispiel.de",
    "editor.embed_youtube": "YouTube-Video einbetten",
    "editor.embed_youtube_desc": "YouTube-Video-URL einfügen",
    "editor.youtube_placeholder": "https://www.youtube.com/watch?v=...",
    "editor.insert_image": "Bild einfügen",
    "editor.insert_image_desc": "Bild-URL einfügen",
    "editor.image_placeholder": "https://beispiel.de/bild.png",
    "editor.insert": "Einfügen",
    "editor.placeholder": "Beginne hier mit dem Schreiben...",
    "editor.words": "Wörter",

    // Chat widget
    "chat.button": "Mit uns chatten",
    "chat.title": "Support-Chat",
    "chat.subtitle": "KI-Assistent — Antworten aus unserer Wissensdatenbank",
    "chat.placeholder": "Stelle eine Frage...",
    "chat.send": "Senden",
    "chat.thinking": "Denke nach…",
    "chat.error": "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    "chat.didnt_help": "Nicht hilfreich?",
    "chat.raise_ticket": "Ticket erstellen",
    "chat.back_to_chat": "Zurück zum Chat",
    "chat.ticket.title": "Support-Ticket erstellen",
    "chat.ticket.subtitle": "Unser Team meldet sich per E-Mail bei dir.",
    "chat.ticket.name": "Dein Name",
    "chat.ticket.email": "E-Mail-Adresse",
    "chat.ticket.subject": "Betreff",
    "chat.ticket.description": "Wobei brauchst du Hilfe?",
    "chat.ticket.submit": "Ticket senden",
    "chat.ticket.submitting": "Wird gesendet…",
    "chat.ticket.submitted": "Ticket erhalten",
    "chat.ticket.confirm": "Wir antworten per E-Mail an",
    "chat.ticket.ref": "Referenz",
    "chat.ticket.close": "Schließen",

    // 404
    "notfound.title": "404",
    "notfound.message": "Seite nicht gefunden.",
    "notfound.back": "Zurück zur Startseite",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("crm-portal-lang");
    return (saved as Lang) || "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("crm-portal-lang", l);
    document.documentElement.lang = l;
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
