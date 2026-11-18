/**
 * EmailListPage — /emails
 *
 * Features:
 *   - Search bar (debounced 400 ms)
 *   - Label filter dropdown (populated from GET /api/mail/labels/)
 *   - Paginated email table
 *   - Click a row → EmailDetailModal
 *   - Empty state + error state
 */

import { useEffect, useState } from "react";
import { Search, Inbox, AlertCircle, Filter } from "lucide-react";
import useEmails from "../hooks/useEmails";
import EmailDetailModal from "../components/EmailDetailModal";
import Pagination from "../../../components/ui/Pagination";
import Spinner from "../../../components/ui/Spinner";
import Badge from "../../../components/ui/Badge";
import { fetchLabels } from "../services/emailService";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

export default function EmailListPage() {
  const {
    emails, total, loading, error,
    page, search, label, pageSize,
    setPage, setSearch, setLabel,
  } = useEmails();

  const [labels,          setLabels]          = useState([]);
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  // Load Gmail labels for the filter dropdown
  useEffect(() => {
    fetchLabels()
      .then((data) => {
        // Backend may return array of objects or strings
        if (Array.isArray(data)) setLabels(data);
      })
      .catch(() => {}); // labels are optional — silent fail
  }, []);

  // Helper: extract label name from object or string
  function labelName(lbl) {
    return typeof lbl === "string" ? lbl : (lbl.name || lbl.id || "");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-800">Emails</h1>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subject, sender…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Label filter */}
        {labels.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
            >
              <option value="">All labels</option>
              {labels.map((lbl) => (
                <option key={labelName(lbl)} value={labelName(lbl)}>
                  {labelName(lbl)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && <Spinner />}

      {/* ── Email table ───────────────────────────────────────────────────── */}
      {!loading && !error && (
        <>
          {emails.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Inbox className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-base font-medium">No emails found</p>
              <p className="text-sm">
                {search || label
                  ? "Try clearing your filters."
                  : "Sync your Gmail to get started."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 w-56">From</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Subject</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Labels</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell w-32">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {emails.map((email) => (
                      <tr
                        key={email.id}
                        onClick={() => setSelectedEmailId(email.id)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        {/* From */}
                        <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-[14rem]">
                          {email.sender || email.from || "—"}
                        </td>

                        {/* Subject */}
                        <td className="px-4 py-3 text-gray-700 truncate max-w-xs">
                          {email.subject || "(no subject)"}
                        </td>

                        {/* Labels */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {(email.labels || []).slice(0, 3).map((lbl) => (
                              <Badge key={lbl} label={lbl} variant="info" />
                            ))}
                            {(email.labels || []).length > 3 && (
                              <Badge label={`+${email.labels.length - 3}`} variant="default" />
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                          {formatDate(email.received_at || email.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 pb-4">
                <Pagination
                  page={page}
                  total={total}
                  pageSize={pageSize}
                  onPage={setPage}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Email Detail Modal ─────────────────────────────────────────────── */}
      <EmailDetailModal
        emailId={selectedEmailId}
        onClose={() => setSelectedEmailId(null)}
      />
    </div>
  );
}
