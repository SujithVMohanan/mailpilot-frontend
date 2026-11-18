/**
 * Pagination — previous / next / page number controls.
 *
 * Props:
 *   page      — current page (1-based)
 *   total     — total record count
 *   pageSize  — records per page
 *   onPage    — fn(newPage)
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, total, pageSize, onPage }) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  if (totalPages <= 1) return null;

  // Build a compact page list: always show first, last, current ±1
  function getPages() {
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    return [...pages]
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }

  const pageList = getPages();

  return (
    <div className="flex items-center justify-between gap-2 mt-4 flex-wrap">
      {/* Info */}
      <p className="text-sm text-gray-500">
        Showing {from}–{to} of {total}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {pageList.map((p, i) => {
          const prev = pageList[i - 1];
          const showEllipsis = prev && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-gray-400 text-sm">…</span>
              )}
              <button
                onClick={() => onPage(p)}
                className={`min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-colors
                  ${p === page
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {p}
              </button>
            </span>
          );
        })}

        {/* Next */}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
