/**
 * Button — Modern SaaS reusable button component.
 *
 * Variants:
 *   - primary   (Solid brand blue with subtle shadow)
 *   - secondary (Soft slate/blue tint)
 *   - outline   (Bordered with hover fill)
 *   - ghost     (Transparent with soft hover)
 *   - danger    (Red for destructive actions)
 */

import React from "react";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-500/20 border border-transparent",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-transparent",
  outline:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-subtle",
  ghost:
    "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 border border-transparent",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-500/20 border border-transparent",
  dangerOutline:
    "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 active:bg-rose-100 shadow-subtle",
};

const SIZES = {
  xs: "px-2.5 py-1 text-xs rounded-md gap-1 font-medium",
  sm: "px-3 py-1.5 text-xs sm:text-sm rounded-lg gap-1.5 font-medium",
  md: "px-4 py-2 text-sm rounded-lg gap-2 font-semibold",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2 font-semibold",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon = null,
  rightIcon: RightIcon = null,
  className = "",
  type = "button",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center transition-all duration-150 ease-in-out cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="h-4 w-4 flex-shrink-0" />
      ) : null}

      <span>{children}</span>

      {!loading && RightIcon && (
        <RightIcon className="h-4 w-4 flex-shrink-0" />
      )}
    </button>
  );
}
