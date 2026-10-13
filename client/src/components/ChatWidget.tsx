import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, LifeBuoy, ArrowLeft, Check, Sparkles, Minus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePublicAiSettings, useCreateTicket } from "@/hooks/useData";
import { useLanguage } from "@/contexts/LanguageContext";

type Message = { role: "user" | "assistant"; content: string; at: number };
type Mode = "chat" | "ticket-form" | "ticket-done";

const DEFAULT_SUGGESTIONS = [
  "How do I get started?",
  "How do I set up my account?",
  "What features are available?",
  "How do I contact support?",
];

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWidget = () => {
  const { t } = useLanguage();
  const { data: settings } = usePublicAiSettings();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [ticket, setTicket] = useState({ name: "", email: "", subject: "", description: "" });
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const enabled = settings?.enabled !== false;
  const botName = settings?.botName || "Aria";
  const welcome = settings?.welcomeMessage || "Hi! Ask me anything about using the platform.";
  // Fall back to sensible defaults if the backend hasn't been seeded yet.
  const suggestions = settings?.suggestions && settings.suggestions.length > 0
    ? settings.suggestions
    : DEFAULT_SUGGESTIONS;

  // Seed the welcome message when the widget first opens.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: welcome, at: Date.now() }]);
    }
  }, [open, welcome, messages.length]);

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, mode]);

  const sendMutation = useMutation({
    mutationFn: (history: Message[]) => api.chat.send(history.map(({ role, content }) => ({ role, content }))),
    onSuccess: (result) => {
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply, at: Date.now() }]);
    },
    onError: (err: Error) => {
      const detail = err?.message && err.message !== "Failed to fetch" ? ` (${err.message})` : "";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `${t("chat.error")}${detail}`, at: Date.now() },
      ]);
    },
  });

  const createTicket = useCreateTicket();

  const lastUserMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content;
    }
    return "";
  }, [messages]);

  const handleSend = (overrideText?: string) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || sendMutation.isPending) return;
    const next: Message[] = [...messages, { role: "user", content: trimmed, at: Date.now() }];
    setMessages(next);
    setInput("");
    sendMutation.mutate(next);
  };

  const openTicketForm = async () => {
    // Seed the form with quick fallbacks (user queries) so the user sees
    // something immediately, then replace Description with an AI summary
    // when it comes back. The full transcript still ships with the
    // ticket and is rendered separately in the admin view.
    const userQueries = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content.trim())
      .filter(Boolean);
    setTicket({
      name: "",
      email: "",
      subject: lastUserMessage.slice(0, 120) || "Support request",
      description: userQueries.join("\n\n"),
    });
    setMode("ticket-form");

    // Only summarize if there's at least one user message in the chat.
    if (messages.some((m) => m.role === "user")) {
      setSummarizing(true);
      try {
        const { summary } = await api.chat.summarize(
          messages.map(({ role, content }) => ({ role, content })),
        );
        if (summary) {
          setTicket((t) => ({ ...t, description: summary }));
        }
      } catch {
        // Leave the fallback user-queries description in place
      } finally {
        setSummarizing(false);
      }
    }
  };

  const handleSubmitTicket = async () => {
    if (!ticket.name.trim() || !ticket.email.trim() || !ticket.subject.trim() || !ticket.description.trim()) return;
    try {
      const created = await createTicket.mutateAsync({
        name: ticket.name.trim(),
        email: ticket.email.trim(),
        subject: ticket.subject.trim(),
        description: ticket.description.trim(),
        transcript: messages.map(({ role, content }) => ({ role, content })),
      });
      setSubmittedTicketId(created?.id ?? null);
      setMode("ticket-done");
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("chat.error"), at: Date.now() }]);
    }
  };

  const resetAfterTicket = () => {
    setOpen(false);
    setTimeout(() => {
      setMode("chat");
      setMessages([]);
      setSubmittedTicketId(null);
      setTicket({ name: "", email: "", subject: "", description: "" });
    }, 200);
  };

  if (!enabled) return null;

  // ------- Closed: floating bubble -------
  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 animate-fade-in">
        <button
          onClick={() => setOpen(true)}
          aria-label={t("chat.button")}
          className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary to-purple-600 text-primary-foreground shadow-xl hover:shadow-2xl hover:shadow-primary/30 premium-transition flex items-center justify-center hover:scale-110 active:scale-95"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-600 blur-xl opacity-40 group-hover:opacity-60 premium-transition" />
          <MessageCircle className="w-6 h-6 relative z-10" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-background">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
          </span>
        </button>
      </div>
    );
  }

  // ------- Open: panel -------
  return (
    <div className="fixed inset-x-2 bottom-2 md:inset-x-auto md:bottom-6 md:right-6 z-50 md:w-[400px] animate-slide-up">
      <div
        className="flex flex-col bg-card rounded-3xl border border-border/50 overflow-hidden h-[min(620px,88vh)] backdrop-blur-2xl"
        style={{ boxShadow: "0 30px 80px -20px rgba(80, 60, 200, 0.25), 0 10px 30px -10px rgba(0,0,0,0.15)" }}
      >
        {/* Header — premium gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-purple-600" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

          <div className="relative flex items-center justify-between px-4 py-3.5 text-white">
            {mode === "ticket-form" ? (
              <button
                onClick={() => setMode("chat")}
                className="flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white premium-transition"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("chat.back_to_chat")}
              </button>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-tight truncate">{botName}</p>
                  <p className="text-[11px] text-white/70 leading-tight truncate flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    {t("chat.subtitle")}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1">
              {mode === "chat" && (
                <button
                  onClick={openTicketForm}
                  aria-label={t("chat.raise_ticket")}
                  title={t("chat.raise_ticket")}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 premium-transition"
                >
                  <LifeBuoy className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label={t("chat.ticket.close")}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 premium-transition"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Body — CHAT */}
        {mode === "chat" && (
          <>
            <div
              ref={scrollerRef}
              className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-gradient-to-b from-background/30 to-background/60"
            >
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const showAvatar = !prev || prev.role !== m.role;
                const isUser = m.role === "user";
                return (
                  <div key={i} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
                    {!isUser && (
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 ring-2 ring-background ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
                      <div
                        className={`px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words ${
                          isUser
                            ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground rounded-2xl rounded-br-md shadow-md shadow-primary/20"
                            : "bg-card border border-border/60 text-foreground rounded-2xl rounded-bl-md shadow-sm"
                        }`}
                      >
                        {m.content}
                      </div>
                      <p className={`text-[10px] text-muted-foreground/50 mt-1 px-1 tabular-nums ${isUser ? "" : ""}`}>
                        {formatTime(m.at)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {sendMutation.isPending && (
                <div className="flex items-end gap-2 justify-start animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 ring-2 ring-background">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-card border border-border/60 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestion chips — shown before the first user message */}
              {!messages.some((m) => m.role === "user") && !sendMutation.isPending && (
                <div className="pt-2 space-y-2 animate-fade-in">
                  <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider px-1">Suggested</p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s)}
                        className="group text-left text-[13px] px-3.5 py-2.5 rounded-xl border border-border/50 bg-card/50 hover:bg-primary/5 hover:border-primary/40 hover:text-primary premium-transition flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{s}</span>
                        <Send className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 premium-transition shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inline escape hatch after any user question */}
              {messages.some((m) => m.role === "user") && !sendMutation.isPending && (
                <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>{t("chat.didnt_help")}</span>
                  <button
                    onClick={openTicketForm}
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    <LifeBuoy className="w-3 h-3" />
                    {t("chat.raise_ticket")}
                  </button>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border/40 p-3 bg-card">
              <div className="flex items-end gap-2 rounded-2xl bg-background border border-border/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 premium-transition p-1.5">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder={t("chat.placeholder")}
                  className="flex-1 resize-none bg-transparent px-2.5 py-2 text-sm focus:outline-none placeholder:text-muted-foreground/50 max-h-28"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || sendMutation.isPending}
                  aria-label={t("chat.send")}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-primary-foreground flex items-center justify-center hover:shadow-lg hover:shadow-primary/25 premium-transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                Powered by AI · answers from our knowledge base
              </p>
            </div>
          </>
        )}

        {/* Body — TICKET FORM */}
        {mode === "ticket-form" && (
          <div ref={scrollerRef} className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-gradient-to-b from-background/30 to-background/60">
            <div className="flex items-start gap-3 pb-1">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <LifeBuoy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-foreground">{t("chat.ticket.title")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("chat.ticket.subtitle")}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  value={ticket.name}
                  onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
                  placeholder={t("chat.ticket.name")}
                  className="w-full h-11 rounded-xl bg-card border border-border/50 px-3.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 premium-transition"
                />
                <input
                  type="email"
                  value={ticket.email}
                  onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                  placeholder={t("chat.ticket.email")}
                  className="w-full h-11 rounded-xl bg-card border border-border/50 px-3.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 premium-transition"
                />
              </div>
              <input
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                placeholder={t("chat.ticket.subject")}
                className="w-full h-11 rounded-xl bg-card border border-border/50 px-3.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 premium-transition"
              />
              <div className="relative">
                <textarea
                  value={ticket.description}
                  onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                  placeholder={t("chat.ticket.description")}
                  rows={6}
                  disabled={summarizing}
                  className="w-full resize-none rounded-xl bg-card border border-border/50 px-3.5 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 premium-transition disabled:opacity-60"
                />
                {summarizing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/60 backdrop-blur-sm rounded-xl pointer-events-none">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Summarizing with AI…
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleSubmitTicket}
              disabled={
                createTicket.isPending ||
                !ticket.name.trim() ||
                !ticket.email.trim() ||
                !ticket.subject.trim() ||
                !ticket.description.trim()
              }
              className="w-full h-11 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-primary-foreground text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 premium-transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {createTicket.isPending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {t("chat.ticket.submitting")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t("chat.ticket.submit")}
                </>
              )}
            </button>
          </div>
        )}

        {/* Body — TICKET CONFIRMED */}
        {mode === "ticket-done" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-background/30 to-background/60 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-2xl" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{t("chat.ticket.submitted")}</p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {t("chat.ticket.confirm")} <span className="font-semibold text-foreground">{ticket.email}</span>
              </p>
            </div>
            {submittedTicketId && (
              <div className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40">
                <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                  {t("chat.ticket.ref")}: {submittedTicketId.slice(0, 8)}
                </p>
              </div>
            )}
            <button
              onClick={resetAfterTicket}
              className="mt-2 h-10 px-6 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-primary-foreground text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 premium-transition active:scale-[0.98]"
            >
              {t("chat.ticket.close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
