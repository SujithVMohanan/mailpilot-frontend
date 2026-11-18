/**
 * DashboardPage — /dashboard
 *
 * Shows:
 *   - Gmail connection status (account.connected, account.email_address)
 *   - Sync emails button
 *   - 4 stat cards: total emails, unread emails, active rules, recent executions
 *   - Disconnect link (when Gmail is connected)
 *
 * API calls:
 *   GET  /api/mail/stats/          — { account, total_emails, read_emails, unread_emails, total_rules, active_rules, recent_executions }
 *   GET  /api/mail/oauth/initiate/ — returns { authorization_url }
 *   POST /api/mail/sync/           — triggers email sync
 *   POST /api/mail/disconnect/     — revokes Gmail access
 */

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ListFilter,
  ClipboardList,
  Inbox,
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
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
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Failed to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ── Connect Gmail ──────────────────────────────────────────────────────────
  async function handleConnectGmail() {
    setConnecting(true);
    try {
      const data = await initiateGmailOAuth();
      const targetUrl = data?.authorization_url || data?.auth_url;
      if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        setError("Authorization URL missing from server response.");
        setConnecting(false);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Could not initiate Gmail OAuth.");
      setConnecting(false);
    }
  }

  // ── Sync emails ────────────────────────────────────────────────────────────
  async function handleSync() {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await syncEmails();
      const count = res?.new_count ?? res?.synced_count;
      setSyncMsg(count !== undefined ? `Synced successfully! (${count} new)` : "Sync complete!");
      await loadStats();
    } catch (err) {
      setSyncMsg(err?.response?.data?.message || err?.response?.data?.detail || "Sync failed. Try again.");
    } finally {
      setSyncing(false);
    }
  }

  // ── Disconnect Gmail ───────────────────────────────────────────────────────
  async function handleDisconnect() {
    if (!window.confirm("Disconnect Gmail? This will remove your Gmail integration.")) return;
    setDisconnecting(true);
    try {
      await disconnectGmail();
      await loadStats();
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Failed to disconnect Gmail.");
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) return <Spinner size="lg" />;

  const isConnected = stats?.account?.connected;
  const connectedEmail = stats?.account?.email_address;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your inbox and rule automations</p>
        </div>
        {isConnected && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {isConnected ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Gmail Connected</p>
                <p className="text-sm text-gray-500">{connectedEmail || "Active Account"}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-60"
            >
              {disconnecting ? "Disconnecting…" : "Disconnect Account"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-gray-800">Connect your Gmail Account</p>
              <p className="text-sm text-gray-500">
                Grant permission so MailPilot can fetch and automate rule actions on your emails.
              </p>
            </div>
            <button
              onClick={handleConnectGmail}
              disabled={connecting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm"
            >
              {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
              {connecting ? "Redirecting to Google…" : "Connect Gmail"}
            </button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Synced Emails"
          value={stats?.total_emails ?? 0}
          icon={Mail}
          color="blue"
        />
        <StatCard
          title="Unread Emails"
          value={stats?.unread_emails ?? 0}
          icon={Inbox}
          color="orange"
        />
        <StatCard
          title="Active Rules"
          value={stats ? `${stats.active_rules ?? 0} / ${stats.total_rules ?? 0}` : "0"}
          icon={ListFilter}
          color="purple"
        />
        <StatCard
          title="Recent Executions"
          value={stats?.recent_executions?.length ?? 0}
          icon={ClipboardList}
          color="green"
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/emails"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow transition"
        >
          <Mail className="h-6 w-6 text-blue-500 mb-2" />
          <p className="font-semibold text-gray-800">Inbox Messages</p>
          <p className="text-sm text-gray-500">View and inspect synchronized emails</p>
        </Link>
        <Link
          to="/rules"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-purple-300 hover:shadow transition"
        >
          <ListFilter className="h-6 w-6 text-purple-500 mb-2" />
          <p className="font-semibold text-gray-800">Rule Automations</p>
          <p className="text-sm text-gray-500">Configure and execute custom filters</p>
        </Link>
        <Link
          to="/executions"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-green-300 hover:shadow transition"
        >
          <ClipboardList className="h-6 w-6 text-green-500 mb-2" />
          <p className="font-semibold text-gray-800">Audit History</p>
          <p className="text-sm text-gray-500">Review execution logs and affected emails</p>
        </Link>
      </div>
    </div>
  );
}
