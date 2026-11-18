/**
 * ExecutionHistoryPage — /executions
 *
 * Implements:
 *   - Paginated list of rule execution audits
 *   - Status pills (SUCCESS, FAILED, PARTIAL, RUNNING)
 *   - Metrics: Evaluated, Matched, Actions succeeded/failed
 *   - Expandable row to view individual RuleExecutionLog entries
 *   - Filter executions by rule
 *   - Auto-refresh
 */

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
} from "lucide-react";
import { fetchExecutions } from "../services/executionService";
import { fetchRules } from "../../rules/services/ruleService";
import Pagination from "../../../components/ui/Pagination";
import Spinner from "../../../components/ui/Spinner";
import Badge from "../../../components/ui/Badge";

const PAGE_SIZE = 20;

function formatTimestamp(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function calculateDuration(start, end) {
  if (!start || !end) return "—";
  const diffMs = new Date(end) - new Date(start);
  if (diffMs < 1000) return `${diffMs}ms`;
  return `${(diffMs / 1000).toFixed(1)}s`;
}

function getStatusBadge(status) {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return <Badge label="SUCCESS" variant="success" />;
    case "FAILED":
      return <Badge label="FAILED" variant="error" />;
    case "PARTIAL_SUCCESS":
    case "PARTIAL":
      return <Badge label="PARTIAL" variant="warning" />;
    case "RUNNING":
      return <Badge label="RUNNING" variant="info" />;
    default:
      return <Badge label={status || "UNKNOWN"} variant="default" />;
  }
}

export default function ExecutionHistoryPage() {
  const [executions, setExecutions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rule filter
  const [rules, setRules] = useState([]);
  const [selectedRuleId, setSelectedRuleId] = useState("");

  // Expanded rows
  const [expandedId, setExpandedId] = useState(null);

  // Load available rules for filter
  useEffect(() => {
    fetchRules()
      .then((res) => {
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (res?.results) list = res.results;
        else if (res?.data?.results) list = res.data.results;
        setRules(list);
      })
      .catch(() => {});
  }, []);

  const loadExecutions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
      };
      if (selectedRuleId) params.rule = selectedRuleId;

      const res = await fetchExecutions(params);

      let list = [];
      let count = 0;

      if (Array.isArray(res)) {
        list = res;
        count = res.length;
      } else if (res?.results) {
        list = res.results;
        count = res.count ?? list.length;
      } else if (res?.data?.results) {
        list = res.data.results;
        count = res.data.count ?? list.length;
      }

      setExecutions(list);
      setTotal(count);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Failed to load execution logs.");
    } finally {
      setLoading(false);
    }
  }, [page, selectedRuleId]);

  useEffect(() => {
    loadExecutions();
  }, [loadExecutions]);

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rule Execution History</h1>
          <p className="text-sm text-gray-500">
            Audit logs detailing evaluated emails, matches, and applied actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Rule Filter */}
          {rules.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 shadow-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedRuleId}
                onChange={(e) => {
                  setSelectedRuleId(e.target.value);
                  setPage(1);
                }}
                className="text-sm outline-none bg-transparent cursor-pointer"
              >
                <option value="">All Rules</option>
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={loadExecutions}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Execution Logs Table */}
      {!loading && (
        <>
          {executions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">
              <ClipboardList className="h-12 w-12 mb-3 opacity-30 text-gray-400" />
              <p className="text-base font-semibold text-gray-700">No execution history found</p>
              <p className="text-sm text-gray-500 mt-1">
                Run an automation rule from the Rules page to generate execution audits.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                    <tr>
                      <th className="w-8"></th>
                      <th className="text-left px-4 py-3">Rule Name</th>
                      <th className="text-left px-4 py-3 w-28">Status</th>
                      <th className="text-left px-4 py-3 w-32">Evaluated / Matched</th>
                      <th className="text-left px-4 py-3 w-32">Actions Succeeded</th>
                      <th className="text-left px-4 py-3 w-40">Executed At</th>
                      <th className="text-left px-4 py-3 w-24">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {executions.map((exec) => {
                      const isExpanded = expandedId === exec.id;
                      const hasLogs = exec.logs && exec.logs.length > 0;

                      return (
                        <tbody key={exec.id}>
                          <tr
                            onClick={() => hasLogs && toggleExpand(exec.id)}
                            className={`hover:bg-blue-50/50 transition ${
                              hasLogs ? "cursor-pointer" : ""
                            }`}
                          >
                            {/* Expand Icon */}
                            <td className="pl-3 pr-1 text-gray-400">
                              {hasLogs ? (
                                isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )
                              ) : null}
                            </td>

                            {/* Rule Name */}
                            <td className="px-4 py-3.5 font-semibold text-gray-800">
                              {exec.rule_name_snapshot || (exec.rule?.name ?? `Rule #${exec.rule}`)}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              {getStatusBadge(exec.status)}
                            </td>

                            {/* Evaluated / Matched */}
                            <td className="px-4 py-3.5 text-gray-700">
                              <span className="font-medium">{exec.total_matched ?? 0}</span>
                              <span className="text-gray-400 text-xs"> / {exec.total_evaluated ?? 0}</span>
                            </td>

                            {/* Actions Succeeded / Failed */}
                            <td className="px-4 py-3.5 text-gray-700">
                              <span className="text-green-600 font-medium">
                                {exec.actions_succeeded ?? 0}
                              </span>
                              {exec.actions_failed > 0 && (
                                <span className="text-red-500 font-medium ml-1">
                                  ({exec.actions_failed} failed)
                                </span>
                              )}
                            </td>

                            {/* Timestamp */}
                            <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                              {formatTimestamp(exec.started_at)}
                            </td>

                            {/* Duration */}
                            <td className="px-4 py-3.5 text-gray-500 text-xs">
                              {calculateDuration(exec.started_at, exec.completed_at)}
                            </td>
                          </tr>

                          {/* Expanded Per-Email Logs Drawer */}
                          {isExpanded && hasLogs && (
                            <tr className="bg-gray-50/80">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    Action Logs ({exec.logs.length})
                                  </p>
                                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                    <table className="w-full text-xs">
                                      <thead className="bg-gray-100 text-gray-600 border-b border-gray-200">
                                        <tr>
                                          <th className="text-left px-3 py-2">Email</th>
                                          <th className="text-left px-3 py-2">Action</th>
                                          <th className="text-left px-3 py-2">Status</th>
                                          <th className="text-left px-3 py-2">Error / Note</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {exec.logs.map((log) => (
                                          <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-gray-800 font-mono">
                                              {typeof log.email === "object"
                                                ? log.email?.subject || log.email?.id
                                                : log.email || "—"}
                                            </td>
                                            <td className="px-3 py-2 font-medium">
                                              {log.action_type?.replace(/_/g, " ")}
                                            </td>
                                            <td className="px-3 py-2">
                                              {log.status === "SUCCESS" ? (
                                                <span className="text-green-600 font-medium">Success</span>
                                              ) : (
                                                <span className="text-red-600 font-medium">{log.status}</span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-red-500">
                                              {log.error_message || "—"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <Pagination
                  page={page}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onPage={setPage}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
