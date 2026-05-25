import { Home, Utensils, Plus, Calendar, User, Stethoscope, ClipboardList } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ownerNavItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Utensils, label: "Feed", path: "/pets" },
  { icon: Plus, label: "Add", path: "/pets/new", isCenter: true },
  { icon: Calendar, label: "Appts", path: "/appointments" },
  { icon: User, label: "Profile", path: "/profile" },
];

const doctorNavItems = [
  { icon: Stethoscope, label: "Panel", path: "/doctor" },
  { icon: ClipboardList, label: "Requests", path: "/doctor" },
  { icon: Plus, label: "Home", path: "/home", isCenter: true },
  { icon: Calendar, label: "Schedule", path: "/doctor" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: roles = [] } = useQuery({
    queryKey: ["user-roles-nav", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      return (data ?? []).map((r: any) => r.role);
    },
    enabled: !!user,
  });

  const isDoctor = roles.includes("vet");
  const navItems = isDoctor ? doctorNavItems : ownerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex -mt-5 h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated transition-transform hover:scale-105 active:scale-95"
                aria-label={item.label}
              >
                <Icon className="h-6 w-6" />
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="font-body text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
