/**
 * DashboardPage — /dashboard
 *
 * Shows:
 *   - Gmail connection status (connected email or "Connect Gmail" button)
 *   - Sync emails button
 *   - 4 stat cards: total emails, rules, executions, labeled emails
 *   - Disconnect link (when Gmail is connected)
 *
 * API calls:
 *   GET  /api/mail/stats/      — dashboard numbers + gmail_connected flag
 *   GET  /api/mail/oauth/initiate/ — get Google OAuth URL
 *   POST /api/mail/sync/       — trigger email sync
 *   POST /api/mail/disconnect/ — revoke Gmail access
 */

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ListFilter,
  ClipboardList,
  Tag,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import StatCard from "../components/StatCard";
import {
  fetchDashboardStats,
  initiateGmailOAuth,
  disconnectGmail,
  syncEmails,
} from "../services/dashboardService";
import Spinner from "../../../components/ui/Spinner";

export default function DashboardPage() {
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [syncing,    setSyncing]    = useState(false);
  const [syncMsg,    setSyncMsg]    = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // ── Load stats ─────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // ── Connect Gmail ──────────────────────────────────────────────────────────
  async function handleConnectGmail() {
    setConnecting(true);
    try {
      const { auth_url } = await initiateGmailOAuth();
      window.location.href = auth_url; // redirect to Google consent screen
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not initiate Gmail OAuth.");
      setConnecting(false);
    }
  }

  // ── Sync emails ────────────────────────────────────────────────────────────
  async function handleSync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await syncEmails();
      setSyncMsg(res?.message || "Sync complete!");
      await loadStats(); // refresh numbers
    } catch (err) {
      setSyncMsg(err?.response?.data?.detail || "Sync failed. Try again.");
    } finally {
      setSyncing(false);
    }
  }

  // ── Disconnect Gmail ───────────────────────────────────────────────────────
  async function handleDisconnect() {
    if (!window.confirm("Disconnect Gmail? This will remove your Gmail tokens.")) return;
    setDisconnecting(true);
    try {
      await disconnectGmail();
      await loadStats();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to disconnect Gmail.");
    } finally {
      setDisconnecting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        {stats?.gmail_connected && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {syncing
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <RefreshCw className="h-4 w-4" />}
            {syncing ? "Syncing…" : "Sync Emails"}
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Sync feedback */}
      {syncMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {syncMsg}
        </div>
      )}

      {/* Gmail connection card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {stats?.gmail_connected ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-800">Gmail connected</p>
                <p className="text-sm text-gray-500">{stats.gmail_email || "Account linked"}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-sm text-red-500 hover:underline disabled:opacity-60"
            >
              {disconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-gray-800">Connect your Gmail account</p>
              <p className="text-sm text-gray-500">
                Required to sync emails and apply automation rules.
              </p>
            </div>
            <button
              onClick={handleConnectGmail}
              disabled={connecting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
              {connecting ? "Redirecting…" : "Connect Gmail"}
            </button>
          </div>
        )}
      </div>

      {/* Stat cards — only show when Gmail is connected */}
      {stats?.gmail_connected && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Emails"
            value={stats.total_emails}
            icon={Mail}
            color="blue"
          />
          <StatCard
            title="Active Rules"
            value={stats.total_rules}
            icon={ListFilter}
            color="purple"
          />
          <StatCard
            title="Executions Run"
            value={stats.total_executions}
            icon={ClipboardList}
            color="green"
          />
          <StatCard
            title="Labeled Emails"
            value={stats.labeled_emails}
            icon={Tag}
            color="orange"
          />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/emails"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <Mail className="h-6 w-6 text-blue-500 mb-2" />
          <p className="font-medium text-gray-800">View Emails</p>
          <p className="text-sm text-gray-500">Browse and filter synced emails</p>
        </Link>
        <Link
          to="/rules"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-purple-300 hover:shadow-sm transition-all"
        >
          <ListFilter className="h-6 w-6 text-purple-500 mb-2" />
          <p className="font-medium text-gray-800">Manage Rules</p>
          <p className="text-sm text-gray-500">Create and edit automation rules</p>
        </Link>
        <Link
          to="/executions"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-green-300 hover:shadow-sm transition-all"
        >
          <ClipboardList className="h-6 w-6 text-green-500 mb-2" />
          <p className="font-medium text-gray-800">Execution History</p>
          <p className="text-sm text-gray-500">Track rule execution logs</p>
        </Link>
      </div>
    </div>
  );
}
