import { Home, PawPrint, Calendar, Stethoscope, ShoppingBag, Bell, User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { icon: Home, label: "Dashboard", path: "/home" },
  { icon: PawPrint, label: "My Pets", path: "/pets" },
  { icon: Calendar, label: "Appointments", path: "/appointments" },
  { icon: Stethoscope, label: "Health", path: "/pets" },
  { icon: ShoppingBag, label: "Services", path: "/services" },
];

export function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="hidden md:block sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-header">
            <PawPrint className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-black text-foreground">Larana</span>
        </button>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || 
              (link.path !== "/home" && location.pathname.startsWith(link.path));
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/notifications")}
            className="relative"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
