import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | "accent";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
  muted: "bg-muted text-muted-foreground",
  accent: "bg-accent text-accent-foreground",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
