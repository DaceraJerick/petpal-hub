import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
