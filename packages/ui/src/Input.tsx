import React from "react";
import { clsx } from "clsx";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "soft";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftAddon,
  rightAddon,
  startIcon,
  endIcon,
  size = "md",
  variant = "outline",
  className,
  ...props
}) => {
  const sizeStyles =
    size === "lg"
      ? "h-12 text-base px-4"
      : size === "sm"
      ? "h-9 text-sm px-3"
      : "h-10 text-sm px-3";

  const inputBase = clsx(
    "flex-1 bg-white placeholder:text-gray-400 focus:outline-none",
    "rounded-md",
    sizeStyles,
    variant === "soft"
      ? "border border-gray-300 focus:border-gray-500"
      : "border border-gray-400 focus:border-gray-600",
    error && "border-red-400 focus:border-red-500"
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Group container to support addons/icons */}
      <div className="flex items-stretch rounded-md overflow-hidden">
        {leftAddon && (
          <span className="inline-flex items-center px-3 bg-gray-50 text-gray-600 border border-r-0 border-gray-300">
            {leftAddon}
          </span>
        )}
        {startIcon && (
          <span className="inline-flex items-center px-2 border border-r-0 border-gray-300 bg-white text-gray-500">
            {startIcon}
          </span>
        )}
        <input className={clsx(inputBase, className)} {...props} />
        {endIcon && (
          <span className="inline-flex items-center px-2 border border-l-0 border-gray-300 bg-white text-gray-500">
            {endIcon}
          </span>
        )}
        {rightAddon && (
          <span className="inline-flex items-center px-3 bg-gray-50 text-gray-600 border border-l-0 border-gray-300">
            {rightAddon}
          </span>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
