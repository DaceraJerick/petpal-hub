import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PawPrint, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User navigated to non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
        <PawPrint className="h-10 w-10 text-primary" />
      </div>
      <h1 className="font-heading text-6xl font-black text-primary">404</h1>
      <p className="mt-2 font-heading text-xl font-bold">Page Not Found</p>
      <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/home"><Home className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
