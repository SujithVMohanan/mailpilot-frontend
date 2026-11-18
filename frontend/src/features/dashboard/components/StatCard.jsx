/**
 * StatCard — Modern SaaS metric display card with icon container & hover interaction.
 */

import React from "react";

const COLOR_MAP = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    iconBg: "bg-blue-100 text-blue-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-100",
    iconBg: "bg-purple-100 text-purple-600",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value ?? "—"}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
