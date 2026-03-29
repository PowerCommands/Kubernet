import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

type SeparatorProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      orientation={orientation}
      {...props}
    />
  );
}
