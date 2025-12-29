import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      role="status"
    >
      <span
        className={cn(
          "animate-spin rounded-full border-2 border-foreground/30 border-r-transparent",
          sizeMap[size]
        )}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
