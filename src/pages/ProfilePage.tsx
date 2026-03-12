import { useNavigate } from "react-router-dom";
import { User, PawPrint, Calendar, Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const stats = [
  { label: "Pets", value: "3", icon: PawPrint },
  { label: "Appointments", value: "12", icon: Calendar },
  { label: "This Month", value: "4 visits", icon: Settings },
];

const menuItems = [
  { label: "Edit Profile", icon: User },
  { label: "Notification Settings", icon: Settings },
  { label: "Privacy & Security", icon: Settings },
  { label: "Help & Support", icon: Settings },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({ title: "Logged out", description: "See you next time! 🐾" });
    navigate("/");
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-4 md:py-6">
      {/* Profile Header */}
      <Card className="shadow-card">
        <CardContent className="p-5 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-4xl">
            👤
          </div>
          <h1 className="font-heading text-xl font-black">Pet Lover</h1>
          <p className="text-sm text-muted-foreground">petlover@example.com</p>
          <p className="text-xs text-muted-foreground mt-1">Member since March 2026</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="p-3 text-center">
              <stat.icon className="mx-auto h-5 w-5 text-primary mb-1" />
              <p className="font-heading text-lg font-black text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Menu */}
      <Card className="mt-4 shadow-card">
        <CardContent className="p-0">
          {menuItems.map((item, i) => (
            <div key={item.label}>
              <button className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              {i < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="mt-6 w-full rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" /> Log Out
      </Button>
    </div>
  );
}
