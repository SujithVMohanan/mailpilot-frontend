/**
 * FormInput — Modern SaaS form input with optional icons & password toggle.
 */

import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function FormInput({
  id,
  label,
  error,
  type = "text",
  icon: Icon = null,
  required = false,
  className = "",
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          id={id}
          type={actualType}
          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 bg-white placeholder-slate-400 outline-none transition-all duration-150 shadow-subtle ${
            Icon ? "pl-10" : ""
          } ${isPassword ? "pr-10" : ""} ${
            error
              ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300"
          }`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-600 font-medium pt-0.5">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
