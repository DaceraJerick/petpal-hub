import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const pillVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium font-body transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-light text-primary",
        accent: "bg-accent/15 text-accent",
        success: "bg-success/15 text-success",
        warning: "bg-warning/20 text-warning-foreground",
        destructive: "bg-destructive/15 text-destructive",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface PillBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof pillVariants> {}

export function PillBadge({ className, variant, ...props }: PillBadgeProps) {
  return <span className={cn(pillVariants({ variant }), className)} {...props} />;
}
