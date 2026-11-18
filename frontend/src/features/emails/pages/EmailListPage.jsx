/**
 * EmailListPage — /emails
 *
 * Fully integrated with backend EmailListView:
 *   - Search (subject, sender, recipient, snippet, body)
 *   - Filter by Read status (All / Unread / Read)
 *   - Sort by Date (newest/oldest) or Subject (A-Z / Z-A)
 *   - Paginated list of emails
 *   - Detail modal on click
 */

import { useState } from "react";
import { Search, Inbox, AlertCircle, ArrowUpDown, Filter } from "lucide-react";
import useEmails from "../hooks/useEmails";
import EmailDetailModal from "../components/EmailDetailModal";
import Pagination from "../../../components/ui/Pagination";
import Spinner from "../../../components/ui/Spinner";
import Badge from "../../../components/ui/Badge";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EmailListPage() {
  const {
    emails,
    total,
    loading,
    error,
    page,
    search,
    isReadFilter,
    ordering,
    pageSize,
    setPage,
    setSearch,
    setIsReadFilter,
    setOrdering,
  } = useEmails();

  const [selectedEmailId, setSelectedEmailId] = useState(null);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Page Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Synced Emails</h1>
          <p className="text-sm text-gray-500">
            Total records stored locally in PostgreSQL: {total}
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject, sender, body…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Read / Unread Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={isReadFilter}
            onChange={(e) => setIsReadFilter(e.target.value)}
            className="text-sm outline-none bg-transparent cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="false">Unread Only</option>
            <option value="true">Read Only</option>
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="text-sm outline-none bg-transparent cursor-pointer"
          >
            <option value="-received_datetime">Newest First</option>
            <option value="received_datetime">Oldest First</option>
            <option value="subject">Subject (A-Z)</option>
            <option value="-subject">Subject (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Emails Table */}
      {!loading && !error && (
        <>
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200">
              <Inbox className="h-12 w-12 mb-3 opacity-40 text-gray-400" />
              <p className="text-base font-semibold text-gray-700">No emails found</p>
              <p className="text-sm text-gray-500 mt-1">
                {search || isReadFilter
                  ? "Try resetting your search or filter criteria."
                  : "Sync your Gmail account from the dashboard to import emails."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                    <tr>
                      <th className="text-left px-4 py-3 w-52">From</th>
                      <th className="text-left px-4 py-3">Subject & Snippet</th>
                      <th className="text-left px-4 py-3 w-28 hidden md:table-cell">Status</th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">Labels</th>
                      <th className="text-left px-4 py-3 w-40 hidden sm:table-cell">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {emails.map((email) => (
                      <tr
                        key={email.id}
                        onClick={() => setSelectedEmailId(email.id)}
                        className={`hover:bg-blue-50 cursor-pointer transition ${
                          !email.is_read ? "font-semibold bg-blue-50/20" : ""
                        }`}
                      >
                        {/* From */}
                        <td className="px-4 py-3 text-gray-900 truncate max-w-[13rem]">
                          {email.sender || "—"}
                        </td>

                        {/* Subject + Snippet */}
                        <td className="px-4 py-3">
                          <p className="text-gray-900 truncate max-w-md">
                            {email.subject || "(no subject)"}
                          </p>
                          {email.snippet && (
                            <p className="text-xs text-gray-500 truncate max-w-md font-normal mt-0.5">
                              {email.snippet}
                            </p>
                          )}
                        </td>

                        {/* Read Status */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge
                            label={email.is_read ? "Read" : "Unread"}
                            variant={email.is_read ? "default" : "warning"}
                          />
                        </td>

                        {/* Labels */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(email.label_ids || []).slice(0, 2).map((lbl) => (
                              <Badge key={lbl} label={lbl} variant="info" />
                            ))}
                            {(email.label_ids || []).length > 2 && (
                              <Badge label={`+${email.label_ids.length - 2}`} variant="default" />
                            )}
                          </div>
                        </td>

                        {/* Received Date */}
                        <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell whitespace-nowrap">
                          {formatDate(email.received_datetime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
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

      {/* Email Detail Modal */}
      <EmailDetailModal
        emailId={selectedEmailId}
        onClose={() => setSelectedEmailId(null)}
      />
    </div>
  );
}
