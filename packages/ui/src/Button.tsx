import React, { forwardRef } from "react";
import { clsx } from "clsx";
import { Spinner } from "./Spinner";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      children,
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      type = "button",
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
      "transition-colors transition-shadow duration-150",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px",
      fullWidth && "w-full"
    );

    const variantClasses = {
      primary:
        "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 focus-visible:ring-purple-500 shadow-sm hover:shadow-md border border-transparent",
      secondary:
        "bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-500 shadow-sm hover:shadow border border-gray-300",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm hover:shadow-md border border-transparent",
      ghost:
        "text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400 border border-transparent",
    } as const;

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-3 text-base",
    } as const;

    const contentDisabled = disabled || isLoading;

    const spinnerColor =
      variant === "primary" || variant === "danger"
        ? "text-white"
        : "text-gray-700";

    const buttonStyles = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<any>;

      const passthroughProps: Record<string, unknown> = {
        className: clsx(buttonStyles, child.props?.className),
        "aria-busy": isLoading || undefined,
        "aria-disabled": contentDisabled || undefined,
        tabIndex: contentDisabled ? -1 : child.props?.tabIndex,
      };

      const possibleHandlers = [
        "onClick",
        "onMouseDown",
        "onKeyDown",
        "onFocus",
        "onBlur",
      ] as const;
      for (const handler of possibleHandlers) {
        const value = (props as any)?.[handler];
        if (value) (passthroughProps as any)[handler] = value;
      }

      if (contentDisabled) {
        (passthroughProps as any).onClick = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
        };
      }

      const childContents = (
        <>
          {isLoading && (
            <Spinner
              className={spinnerColor}
              size={size === "lg" ? "md" : "sm"}
            />
          )}
          {!isLoading && leftIcon}
          <span>{child.props?.children}</span>
          {!isLoading && rightIcon}
        </>
      );

      return React.cloneElement(child, passthroughProps, childContents);
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-busy={isLoading || undefined}
        disabled={contentDisabled}
        className={buttonStyles}
        {...props}
      >
        {isLoading && (
          <Spinner
            className={spinnerColor}
            size={size === "lg" ? "md" : "sm"}
          />
        )}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
