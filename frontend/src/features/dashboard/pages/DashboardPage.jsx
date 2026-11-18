/**
 * DashboardPage — Main overview dashboard with live Gmail synchronization panel.
 *
 * Adheres strictly to:
 *   - Real backend data (stats.account.last_synced_at)
 *   - Skeleton loaders instead of blank screens
 *   - Clear synchronization status indicators (Synced, Syncing, Failed, Disconnected)
 *   - Duplicate sync prevention with loading animations
 */

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ListFilter,
  ClipboardList,
  Inbox,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import StatCard from "../components/StatCard";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { SkeletonStats } from "../../../components/ui/Skeleton";
import {
  fetchDashboardStats,
  initiateGmailOAuth,
  disconnectGmail,
  syncEmails,
} from "../services/dashboardService";

function formatSyncTime(dateStr) {
  if (!dateStr) return "Never synced";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Never synced";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync states
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // "idle" | "syncing" | "success" | "error"
  const [syncMessage, setSyncMessage] = useState("");

  // OAuth states
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError("");
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to load dashboard metrics."
      );
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Connect Gmail
  async function handleConnectGmail() {
    setConnecting(true);
    setError("");
    try {
      const data = await initiateGmailOAuth();
      const targetUrl = data?.authorization_url || data?.auth_url;
      if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        setError("Authorization URL missing from server.");
        setConnecting(false);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Could not initiate Google authorization."
      );
      setConnecting(false);
    }
  }

  // Trigger Sync
  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setSyncStatus("syncing");
    setSyncMessage("");
    setError("");

    try {
      const res = await syncEmails(50);
      const newCount = res?.new_count ?? res?.synced_count ?? 0;
      setSyncStatus("success");
      setSyncMessage(
        newCount > 0
          ? `Synchronization complete: ${newCount} new email(s) imported.`
          : "Inbox is up-to-date. No new messages."
      );
      // Reload stats silently to update last_synced_at & counts
      await loadStats(true);
    } catch (err) {
      setSyncStatus("error");
      setSyncMessage(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Synchronization failed. Please check connection and retry."
      );
    } finally {
      setSyncing(false);
    }
  }

  // Disconnect Gmail
  async function handleDisconnect() {
    if (
      !window.confirm(
        "Are you sure you want to disconnect Gmail? This will revoke stored access tokens and halt automated actions."
      )
    ) {
      return;
    }
    setDisconnecting(true);
    setError("");
    try {
      await disconnectGmail();
      await loadStats();
      setSyncMessage("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to disconnect Gmail."
      );
    } finally {
      setDisconnecting(false);
    }
  }

  const isConnected = Boolean(stats?.account?.connected);
  const connectedEmail = stats?.account?.email_address;
  const lastSyncedAt = stats?.account?.last_synced_at;
  const relativeSync = getRelativeTime(lastSyncedAt);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time inbox synchronization status and rule execution metrics.
          </p>
        </div>


      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-subtle">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Operation Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-xs text-rose-600 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Sync Feedback Message ──────────────────────────────────── */}
      {syncMessage && (
        <div
          className={`rounded-xl border p-4 text-xs sm:text-sm flex items-start gap-3 shadow-subtle animate-slide-down ${
            syncStatus === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {syncStatus === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {syncStatus === "success" ? "Sync Completed" : "Sync Failed"}
            </p>
            <p className="mt-0.5">{syncMessage}</p>
          </div>
          <button
            onClick={() => setSyncMessage("")}
            className="text-xs hover:underline font-medium opacity-80"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Gmail Synchronization Panel ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-7 relative overflow-hidden">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-44 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-72 bg-slate-100 animate-pulse rounded" />
              </div>
              <div className="h-9 w-28 bg-slate-200 animate-pulse rounded-lg" />
            </div>
          </div>
        ) : isConnected ? (
          /* Connected State */
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Gmail Synchronization
                  </h3>
                  <Badge
                    variant={syncing ? "info" : "success"}
                    withDot
                  >
                    {syncing ? "Syncing in progress…" : "Synced & Active"}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Connected Account:{" "}
                  <strong className="text-slate-900 font-semibold">{connectedEmail}</strong>
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    Last synced:{" "}
                    <strong className="text-slate-700">
                      {formatSyncTime(lastSyncedAt)}
                    </strong>
                    {relativeSync && (
                      <span className="text-slate-400 ml-1">({relativeSync})</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Sync Controls */}
            <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                loading={syncing}
                disabled={syncing}
                onClick={handleSync}
              >
                {syncing ? "Syncing…" : "Sync Now"}
              </Button>

              <Button
                variant="dangerOutline"
                size="sm"
                loading={disconnecting}
                disabled={disconnecting || syncing}
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          /* Disconnected State */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-subtle">
                <Mail className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Connect your Gmail Account
                  </h3>
                  <Badge variant="warning" withDot>
                    Not Connected
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
                  Authorize Mail Pilot using Google OAuth 2.0 to securely synchronize your inbox messages and execute automated filtering rules.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              loading={connecting}
              disabled={connecting}
              onClick={handleConnectGmail}
              className="flex-shrink-0"
            >
              {connecting ? "Redirecting to Google…" : "Connect Gmail"}
            </Button>
          </div>
        )}
      </div>

      {/* ── Metric Cards ───────────────────────────────────────────── */}
      {loading ? (
        <SkeletonStats count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Total Synced Emails"
            value={stats?.total_emails?.toLocaleString() ?? 0}
            icon={Mail}
            color="blue"
            subtitle="Stored locally in PostgreSQL"
          />
          <StatCard
            title="Unread Messages"
            value={stats?.unread_emails?.toLocaleString() ?? 0}
            icon={Inbox}
            color="amber"
            subtitle={`${stats?.read_emails ?? 0} marked as read`}
          />
          <StatCard
            title="Active Automation Rules"
            value={stats?.active_rules ?? 0}
            icon={ListFilter}
            color="purple"
            subtitle={`${stats?.total_rules ?? 0} total rules configured`}
          />
          <StatCard
            title="Recent Executions"
            value={stats?.recent_executions?.length ?? 0}
            icon={ClipboardList}
            color="emerald"
            subtitle="Audit logs on record"
          />
        </div>
      )}

      {/* ── Quick Workspaces ───────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/emails"
            className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Synced Inbox
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Browse stored emails, search content, filter by read status, and inspect raw message bodies.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 pt-4">
              <span>View Messages</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/rules"
            className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover hover:border-purple-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ListFilter className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Automation Rules
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Configure custom condition predicates and actions (Mark read, unread, or route to Gmail labels).
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 pt-4">
              <span>Manage Rules</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/executions"
            className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Audit Logs
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Review execution timestamps, success/failure rates, and inspect per-email execution traces.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 pt-4">
              <span>View Audit Trail</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
