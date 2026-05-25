import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "owner" | "doctor" | "client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: AppRole | null;
  isDoctor: boolean;
  isClient: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  role: null,
  isDoctor: false,
  isClient: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => fetchRole(session.user.id), 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) fetchRole(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("role")
      .limit(1)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        role,
        isDoctor: role === "doctor",
        isClient: role === "client" || role === "owner",
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
