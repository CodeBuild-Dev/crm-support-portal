import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthContext } from "@/contexts/AuthContext";
import { api, ApiError, SESSION_EXPIRED_EVENT } from "@/lib/api";
import SEOHead from "@/components/SEOHead";

const ME_KEY = ["auth", "me"];

/** Shows the login form until the visitor has an admin session, then renders children. */
const AdminGate = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [expired, setExpired] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: () =>
      api.auth.me().catch((err) => {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }),
    retry: false,
    staleTime: Infinity,
  });

  // Drop back to the login form if any admin request reports an expired session.
  useEffect(() => {
    const onExpired = () => {
      if (queryClient.getQueryData(ME_KEY)) setExpired(true);
      queryClient.setQueryData(ME_KEY, null);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => undefined);
    setExpired(false);
    queryClient.clear();
    queryClient.setQueryData(ME_KEY, null);
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm
        expired={expired}
        onSuccess={(u) => {
          setExpired(false);
          queryClient.setQueryData(ME_KEY, u);
        }}
      />
    );
  }

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

const LoginForm = ({
  expired,
  onSuccess,
}: {
  expired: boolean;
  onSuccess: (user: Awaited<ReturnType<typeof api.auth.login>>) => void;
}) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      onSuccess(await api.auth.login(email, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEOHead title={t("auth.title")} />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("auth.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          {(error || expired) && (
            <p role="alert" className="text-sm rounded-lg bg-destructive/10 text-destructive px-3 py-2">
              {error ?? t("auth.expired")}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? t("auth.submitting") : t("auth.submit")}
          </Button>
        </form>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground premium-transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("auth.back")}
        </Link>
      </div>
    </div>
  );
};

export default AdminGate;
