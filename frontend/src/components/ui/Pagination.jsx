/**
 * Pagination — Responsive, accessible page navigation controls.
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, total, pageSize, onPage }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (totalPages <= 1 && total === 0) return null;

  function getPages() {
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    return [...pages]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }

  const pageList = getPages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
      {/* Count Info */}
      <div className="font-medium">
        Showing <span className="text-slate-900 font-semibold">{from}</span> to{" "}
        <span className="text-slate-900 font-semibold">{to}</span> of{" "}
        <span className="text-slate-900 font-semibold">{total}</span> items
      </div>

      {/* Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-subtle"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageList.map((p, i) => {
            const prev = pageList[i - 1];
            const showEllipsis = prev && p - prev > 1;
            return (
              <span key={p} className="flex items-center gap-1">
                {showEllipsis && <span className="px-1 text-slate-400">…</span>}
                <button
                  onClick={() => onPage(p)}
                  className={`min-w-[2rem] h-8 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    p === page
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-subtle"
                  }`}
                >
                  {p}
                </button>
              </span>
            );
          })}

          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-subtle"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
