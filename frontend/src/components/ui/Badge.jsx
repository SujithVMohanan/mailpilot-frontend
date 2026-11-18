/**
 * Badge — Modern pill indicator with support for dots and variants.
 */

import React from "react";

const VARIANTS = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  warning: "bg-amber-50 text-amber-700 border-amber-200/80",
  error:   "bg-rose-50 text-rose-700 border-rose-200/80",
  info:    "bg-blue-50 text-blue-700 border-blue-200/80",
  purple:  "bg-purple-50 text-purple-700 border-purple-200/80",
  default: "bg-slate-100 text-slate-700 border-slate-200/80",
};

const DOTS = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error:   "bg-rose-500",
  info:    "bg-blue-500",
  purple:  "bg-purple-500",
  default: "bg-slate-400",
};

export default function Badge({
  label,
  variant = "default",
  withDot = false,
  size = "md",
  className = "",
  children,
}) {
  const content = label || children;
  const variantClass = VARIANTS[variant] || VARIANTS.default;
  const dotColor = DOTS[variant] || DOTS.default;

  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-0.5 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold select-none tracking-wide ${variantClass} ${sizeClass} ${className}`}
    >
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
      )}
      <span className="truncate">{content}</span>
    </span>
  );
}
