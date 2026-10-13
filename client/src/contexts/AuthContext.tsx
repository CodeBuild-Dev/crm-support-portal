import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

/** The signed-in admin. Only usable inside <AdminGate>. */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AdminGate>");
  return ctx;
};
