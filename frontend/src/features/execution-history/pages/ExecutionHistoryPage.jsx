/**
 * ExecutionHistoryPage — Modern audit logs workspace with expandable action traces.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { fetchExecutions } from "../services/executionService";
import { fetchRules } from "../../rules/services/ruleService";
import Pagination from "../../../components/ui/Pagination";
import SelectDropdown from "../../../components/ui/SelectDropdown";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonTable } from "../../../components/ui/Skeleton";

const PAGE_SIZE = 20;

function formatTimestamp(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
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
      return <Badge label="SUCCESS" variant="success" withDot />;
    case "FAILED":
      return <Badge label="FAILED" variant="error" withDot />;
    case "PARTIAL_SUCCESS":
    case "PARTIAL":
      return <Badge label="PARTIAL" variant="warning" withDot />;
    case "RUNNING":
      return <Badge label="RUNNING" variant="info" withDot />;
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
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to load execution audit logs."
      );
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

  const ruleOptions = [
    { value: "", label: "All Rules" },
    ...rules.map((r) => ({ value: r.id, label: r.name })),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Audit Execution History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete audit trail of automation runs, matched messages, and executed actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {rules.length > 0 && (
            <SelectDropdown
              options={ruleOptions}
              value={selectedRuleId}
              onChange={(val) => {
                setSelectedRuleId(val);
                setPage(1);
              }}
              icon={Filter}
              size="sm"
              className="min-w-[160px]"
            />
          )}

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={loadExecutions}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-subtle">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Audit Trail Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="xs" onClick={loadExecutions}>
            Retry
          </Button>
        </div>
      )}

      {/* ── Table of Executions ────────────────────────────────────── */}
      {loading ? (
        <SkeletonTable rows={7} cols={6} />
      ) : executions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No execution history on record"
          description={
            selectedRuleId
              ? "No execution logs match the selected rule. Try choosing 'All Rules'."
              : "Execute an automation rule from the Rules workspace to record your first execution audit."
          }
          actionLabel="View Automation Rules"
          onAction={() => (window.location.href = "/rules")}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3 w-10 text-center"></th>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4 w-32">Status</th>
                  <th className="py-3 px-4 w-36">Evaluated / Matched</th>
                  <th className="py-3 px-4 w-36">Actions Performed</th>
                  <th className="py-3 px-4 w-44">Executed At</th>
                  <th className="py-3 px-4 w-24 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {executions.map((exec) => {
                  const isExpanded = expandedId === exec.id;
                  const hasLogs = exec.logs && exec.logs.length > 0;

                  return (
                    <React.Fragment key={exec.id}>
                      <tr
                        onClick={() => hasLogs && toggleExpand(exec.id)}
                        className={`transition-colors duration-150 ${
                          hasLogs ? "cursor-pointer hover:bg-slate-50/80" : ""
                        } ${isExpanded ? "bg-slate-50/60" : ""}`}
                      >
                        {/* Expand Caret */}
                        <td className="py-3.5 px-3 text-center text-slate-400">
                          {hasLogs && (
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-slate-200 transition"
                              aria-label="Expand logs"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-blue-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </td>

                        {/* Rule Name */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {exec.rule_name_snapshot || (exec.rule?.name ?? `Rule #${exec.rule}`)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">{getStatusBadge(exec.status)}</td>

                        {/* Evaluated / Matched */}
                        <td className="py-3.5 px-4 text-slate-700">
                          <strong className="text-slate-900 font-bold">
                            {exec.total_matched ?? 0}
                          </strong>
                          <span className="text-slate-400 text-xs ml-1">
                            / {exec.total_evaluated ?? 0}
                          </span>
                        </td>

                        {/* Actions Succeeded / Failed */}
                        <td className="py-3.5 px-4">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {exec.actions_succeeded ?? 0} ok
                          </span>
                          {exec.actions_failed > 0 && (
                            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 ml-1.5">
                              {exec.actions_failed} err
                            </span>
                          )}
                        </td>

                        {/* Executed At */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap text-xs">
                          {formatTimestamp(exec.started_at)}
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-xs">
                          {calculateDuration(exec.started_at, exec.completed_at)}
                        </td>
                      </tr>

                      {/* Expanded Drawer for Per-Email Logs */}
                      {isExpanded && hasLogs && (
                        <tr className="bg-slate-50/90 border-t border-b border-slate-200">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  Granular Action Audit ({exec.logs.length} record{exec.logs.length === 1 ? "" : "s"})
                                </p>
                              </div>

                              <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                                <table className="w-full text-xs text-left">
                                  <thead>
                                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                                      <th className="py-2.5 px-3">Message Subject / ID</th>
                                      <th className="py-2.5 px-3">Action</th>
                                      <th className="py-2.5 px-3">Outcome</th>
                                      <th className="py-2.5 px-3">Timestamp / Details</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {exec.logs.map((log) => (
                                      <tr key={log.id} className="hover:bg-slate-50/70">
                                        <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-xs font-mono">
                                          {typeof log.email === "object"
                                            ? log.email?.subject || log.email?.id
                                            : log.email || "—"}
                                        </td>
                                        <td className="py-2 px-3">
                                          <Badge size="sm" variant="info">
                                            {log.action_type?.replace(/_/g, " ")}
                                          </Badge>
                                        </td>
                                        <td className="py-2 px-3">
                                          {log.status === "SUCCESS" ? (
                                            <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                                              <CheckCircle2 className="h-3.5 w-3.5" />
                                              Success
                                            </span>
                                          ) : (
                                            <span className="text-rose-700 font-bold inline-flex items-center gap-1">
                                              <XCircle className="h-3.5 w-3.5" />
                                              {log.status}
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-slate-500">
                                          {log.error_message ? (
                                            <span className="text-rose-600 font-medium">
                                              {log.error_message}
                                            </span>
                                          ) : (
                                            formatTimestamp(log.created_at)
                                          )}
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
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <Pagination
              page={page}
              total={total}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
