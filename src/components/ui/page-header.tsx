import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
  gradient?: boolean;
}

export function PageHeader({ title, subtitle, className, children, gradient = false }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "px-4 py-6 md:px-0 md:py-8",
        gradient && "gradient-header text-primary-foreground -mx-4 px-8 md:mx-0 md:rounded-xl",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black md:text-3xl">{title}</h1>
          {subtitle && (
            <p className={cn("mt-1 text-sm font-body", gradient ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
