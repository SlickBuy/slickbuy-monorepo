"use client";

import React from "react";
import { clsx } from "clsx";

type BadgeColor =
  | "green"
  | "red"
  | "blue"
  | "sky"
  | "indigo"
  | "emerald"
  | "rose"
  | "gray";

type BadgeVariant = "solid" | "soft" | "outline";
type BadgeSize = "xs" | "sm";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftIcon?: React.ReactNode;
}

const colorMap: Record<
  BadgeColor,
  { soft: string; solid: string; outline: string }
> = {
  green: {
    soft: "text-green-800 bg-green-100",
    solid: "text-white bg-green-600",
    outline: "text-green-700 bg-transparent",
  },
  emerald: {
    soft: "text-emerald-800 bg-emerald-100",
    solid: "text-white bg-emerald-600",
    outline: "text-emerald-700 bg-transparent",
  },
  red: {
    soft: "text-red-800 bg-red-100",
    solid: "text-white bg-red-600",
    outline: "text-red-700 bg-transparent",
  },
  rose: {
    soft: "text-rose-800 bg-rose-100",
    solid: "text-white bg-rose-600",
    outline: "text-rose-700 bg-transparent",
  },
  blue: {
    soft: "text-blue-800 bg-blue-100",
    solid: "text-white bg-blue-600",
    outline: "text-blue-700 bg-transparent",
  },
  sky: {
    soft: "text-sky-800 bg-sky-100",
    solid: "text-white bg-sky-600",
    outline: "text-sky-700 bg-transparent",
  },
  indigo: {
    soft: "text-indigo-800 bg-indigo-100",
    solid: "text-white bg-indigo-600",
    outline: "text-indigo-700 bg-transparent",
  },
  gray: {
    soft: "text-gray-700 bg-gray-100",
    solid: "text-white bg-gray-700",
    outline: "text-gray-700 bg-transparent",
  },
};

export const Badge: React.FC<BadgeProps> = ({
  color = "gray",
  variant = "soft",
  size = "sm",
  leftIcon,
  className,
  children,
  ...rest
}) => {
  const sizeClasses =
    size === "xs" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const palette = colorMap[color]?.[variant] ?? colorMap.gray.soft;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full shadow-md border-0 px-2 py-1.5 opacity-90",
        sizeClasses,
        palette,
        className
      )}
      {...rest}
    >
      {leftIcon ? (
        <span className="mr-1 flex items-center">{leftIcon}</span>
      ) : null}
      {children}
    </span>
  );
};
