/**
 * EmailListPage — Modern SaaS Card List with inline expanding message viewer.
 *
 * Implements:
 *   - Card-based listing ("inside the card list card") instead of rigid tables
 *   - Instant metadata display with zero delay
 *   - Inline expandable message details with safe HTML & Plain Text viewers
 *   - Memory caching of fetched bodies for instantaneous re-expansion
 *   - Debounced search & read/unread filter dropdowns
 *   - Distinct empty states for initial sync vs filter searches
 */

import React, { useState } from "react";
import {
  Search,
  Inbox,
  AlertCircle,
  Filter,
  ArrowUpDown,
  RefreshCw,
  X,
  Layers,
} from "lucide-react";
import useEmails from "../hooks/useEmails";
import EmailCard from "../components/EmailCard";
import Pagination from "../../../components/ui/Pagination";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonCardList } from "../../../components/ui/Skeleton";
import { fetchEmailDetail } from "../services/emailService";

const READ_OPTIONS = [
  { value: "", label: "All Messages" },
  { value: "false", label: "Unread Only" },
  { value: "true", label: "Read Only" },
];

const ORDER_OPTIONS = [
  { value: "-received_datetime", label: "Newest First" },
  { value: "received_datetime", label: "Oldest First" },
  { value: "subject", label: "Subject (A → Z)" },
  { value: "-subject", label: "Subject (Z → A)" },
];

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
    reload,
  } = useEmails();

  // Active expanded email card ID
  const [expandedEmailId, setExpandedEmailId] = useState(null);

  // Cached detailed payloads (keyed by email.id)
  const [detailsCache, setDetailsCache] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [detailErrors, setDetailErrors] = useState({});

  const hasActiveFilters = Boolean(search || isReadFilter !== "");

  function handleClearFilters() {
    setSearch("");
    setIsReadFilter("");
    setPage(1);
  }

  // Toggle card expansion and fetch full body if not already cached
  async function handleToggleExpand(email) {
    if (expandedEmailId === email.id) {
      // Collapse
      setExpandedEmailId(null);
      return;
    }

    // Expand
    setExpandedEmailId(email.id);

    // If already in memory cache, no need to re-fetch
    if (detailsCache[email.id]) return;

    setLoadingDetails((prev) => ({ ...prev, [email.id]: true }));
    setDetailErrors((prev) => ({ ...prev, [email.id]: "" }));

    try {
      const fullDetail = await fetchEmailDetail(email.id);
      const unwrapped = fullDetail?.data?.data || fullDetail?.data || fullDetail;
      if (unwrapped && typeof unwrapped === "object") {
        setDetailsCache((prev) => ({ ...prev, [email.id]: unwrapped }));
      }
    } catch (err) {
      setDetailErrors((prev) => ({
        ...prev,
        [email.id]:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          "Could not fetch full message content.",
      }));
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [email.id]: false }));
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Synced Emails
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and inspect your synchronized Gmail messages with inline detail preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={reload}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Search & Filter Controls Bar ────────────────────────────── */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject, sender, body…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 transition"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Read Status Dropdown */}
          <SelectDropdown
            options={READ_OPTIONS}
            value={isReadFilter}
            onChange={setIsReadFilter}
            icon={Filter}
            size="sm"
            className="min-w-[130px]"
          />

          {/* Sort Ordering Dropdown */}
          <SelectDropdown
            options={ORDER_OPTIONS}
            value={ordering}
            onChange={setOrdering}
            icon={ArrowUpDown}
            size="sm"
            className="min-w-[145px]"
          />

          {/* Clear Filters Reset */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-slate-500 hover:text-rose-600 text-xs"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-subtle">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Unable to load messages</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="xs" onClick={reload}>
            Retry
          </Button>
        </div>
      )}

      {/* ── Modern Card Listing (Inline Expandable) ──────────────────── */}
      {loading ? (
        <SkeletonCardList count={5} />
      ) : emails.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={Search}
            title="No matching emails found"
            description={`No stored messages match "${search}" with the selected filters. Try broadening your criteria.`}
            actionLabel="Clear Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title="No synchronized emails yet"
            description="Your inbox has not been synchronized into the local database. Connect your Gmail account and trigger a sync to populate this workspace."
            actionLabel="Go to Dashboard"
            onAction={() => (window.location.href = "/dashboard")}
          />
        )
      ) : (
        <div className="space-y-4">
          {/* Card List of Emails */}
          <div className="space-y-3.5">
            {emails.map((email) => {
              const isExpanded = expandedEmailId === email.id;

              return (
                <EmailCard
                  key={email.id}
                  email={email}
                  isExpanded={isExpanded}
                  onToggleExpand={() => handleToggleExpand(email)}
                  detailData={detailsCache[email.id]}
                  loadingDetail={loadingDetails[email.id]}
                  detailError={detailErrors[email.id]}
                  onRetryDetail={() => handleToggleExpand(email)}
                />
              );
            })}
          </div>

          {/* Table / List Pagination */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-card">
            <Pagination
              page={page}
              total={total}
              pageSize={pageSize}
              onPage={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
