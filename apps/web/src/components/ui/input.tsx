"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const input = (
      <input
        id={id}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-card placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
    );

    if (!label) return input;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={id}
          className="text-sm text-[color:var(--card-foreground)]"
        >
          {label}
        </label>
        {input}
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          helperText && (
            <p className="text-xs text-[color:var(--muted-foreground)]">
              {helperText}
            </p>
          )
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
