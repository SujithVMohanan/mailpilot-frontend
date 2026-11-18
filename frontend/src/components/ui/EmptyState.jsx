/**
 * EmptyState — Reusable empty, no-results, or initial state graphic.
 */

import React from "react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-slate-200/80 shadow-subtle ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-500 flex items-center justify-center mb-4 shadow-subtle">
          <Icon className="h-7 w-7 text-slate-400" />
        </div>
      )}

      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed mb-6">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button
              variant="primary"
              size="sm"
              icon={actionIcon}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
