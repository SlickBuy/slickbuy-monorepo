"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default:
          "bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md",
        secondary:
          "bg-card text-foreground hover:bg-muted border border-border shadow-sm hover:shadow",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-sm hover:shadow-md",
        ghost: "text-foreground hover:bg-muted/70 border border-transparent",
        outline:
          "bg-transparent text-foreground border border-[color:var(--primary)] text-[color:var(--primary)] hover:bg-[color:var(--primary)]/10",
      },
      size: {
        sm: "h-8 px-3 py-1.5",
        default: "h-9 px-4 py-2",
        lg: "h-11 px-5 py-3 text-base",
        icon: "h-9 w-9",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const contentDisabled = disabled || isLoading;

    const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

    return (
      <button
        ref={ref}
        className={classes}
        disabled={contentDisabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <span className="inline-flex">
            <span className="size-4 animate-spin rounded-full border-[2px] border-white/60 border-r-transparent" />
          </span>
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
