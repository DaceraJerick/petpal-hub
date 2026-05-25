import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function DoctorRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();

  if (loading || (user && role === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "doctor") return <Navigate to="/home" replace />;
  return <>{children}</>;
}
