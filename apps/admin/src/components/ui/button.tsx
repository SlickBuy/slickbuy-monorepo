"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default:
          "bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 focus-visible:ring-teal-500 shadow-sm hover:shadow-md",
        secondary:
          "bg-background text-foreground hover:bg-muted border border-border shadow-sm hover:shadow",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-sm hover:shadow-md",
        ghost: "text-foreground hover:bg-muted border border-transparent",
        outline:
          "bg-transparent text-foreground border border-border hover:bg-muted",
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

    const commonClass = cn(
      buttonVariants({ variant, size, fullWidth }),
      className
    );

    const content = (
      <>
        {isLoading && (
          <span className="inline-flex">
            <span className="size-4 animate-spin rounded-full border-[2px] border-white/60 border-r-transparent" />
          </span>
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </>
    );

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<
        React.HTMLAttributes<HTMLElement>
      >;
      const childContent = child.props?.children;

      return React.cloneElement(child, {
        className: cn(commonClass, child.props.className),
        "aria-busy": isLoading || undefined,
        "aria-disabled": contentDisabled || undefined,
        tabIndex: contentDisabled ? -1 : child.props.tabIndex,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          if (contentDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (typeof child.props.onClick === "function") {
            child.props.onClick(e as React.MouseEvent<HTMLElement>);
          }
        },
        children: (
          <>
            {isLoading && (
              <span className="inline-flex">
                <span className="size-4 animate-spin rounded-full border-[2px] border-white/60 border-r-transparent" />
              </span>
            )}
            {!isLoading && leftIcon}
            <span>{childContent}</span>
            {!isLoading && rightIcon}
          </>
        ),
      });
    }

    return (
      <button
        ref={ref}
        className={commonClass}
        disabled={contentDisabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {content}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
