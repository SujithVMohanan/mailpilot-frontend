/**
 * RulesPage — Automation rules workspace with single & bulk execution.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListFilter,
  Plus,
  Play,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonCardList } from "../../../components/ui/Skeleton";
import {
  fetchRules,
  toggleRule,
  deleteRule,
  executeRule,
  executeAllRules,
} from "../services/ruleService";

export default function RulesPage() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Execution states
  const [executingRuleId, setExecutingRuleId] = useState(null);
  const [executingAll, setExecutingAll] = useState(false);

  const loadRules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchRules();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res?.results) list = res.results;
      else if (res?.data?.results) list = res.data.results;
      setRules(list);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to load automation rules."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // Toggle active state
  async function handleToggle(rule) {
    try {
      await toggleRule(rule.id);
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, is_active: !r.is_active } : r))
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to toggle rule state.");
    }
  }

  // Delete rule
  async function handleDelete(rule) {
    if (!window.confirm(`Are you sure you want to delete rule "${rule.name}"?`)) {
      return;
    }
    try {
      await deleteRule(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      setActionMsg(`Rule "${rule.name}" has been deleted.`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete rule.");
    }
  }

  // Execute single rule
  async function handleExecuteSingle(ruleId) {
    setExecutingRuleId(ruleId);
    setActionMsg("");
    setError("");
    try {
      const result = await executeRule(ruleId);
      const matched = result?.total_matched ?? 0;
      const succeeded = result?.actions_succeeded ?? 0;
      const failed = result?.actions_failed ?? 0;

      setActionMsg(
        `Execution finished: ${matched} email(s) matched. ${succeeded} action(s) executed successfully${
          failed > 0 ? `, ${failed} failed` : ""
        }.`
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Rule execution failed.");
    } finally {
      setExecutingRuleId(null);
    }
  }

  // Execute all active rules
  async function handleExecuteAll() {
    setExecutingAll(true);
    setActionMsg("");
    setError("");
    try {
      const results = await executeAllRules();
      const count = Array.isArray(results) ? results.length : 1;
      setActionMsg(`Batch execution completed for ${count} active rule(s).`);
    } catch (err) {
      setError(err?.response?.data?.message || "Batch rule execution failed.");
    } finally {
      setExecutingAll(false);
    }
  }

  function openCreate() {
    navigate("/rules/new");
  }

  function openEdit(rule) {
    navigate(`/rules/${rule.id}/edit`);
  }

  const hasActiveRules = rules.some((r) => r.is_active);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Automation Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build custom predicates to automatically route, label, and triage your inbox messages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {hasActiveRules && (
            <Button
              variant="outline"
              size="md"
              icon={Zap}
              loading={executingAll}
              disabled={executingAll}
              onClick={handleExecuteAll}
            >
              {executingAll ? "Running Rules…" : "Run All Active Rules"}
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openCreate}
          >
            New Rule
          </Button>
        </div>
      </div>

      {/* ── Feedback Banners ───────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-subtle">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-900">Rule Operation Error</p>
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

      {actionMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs sm:text-sm text-emerald-800 flex items-start gap-3 shadow-subtle animate-slide-down">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">Execution Result</p>
            <p className="mt-0.5">{actionMsg}</p>
          </div>
          <button
            onClick={() => setActionMsg("")}
            className="text-xs text-emerald-600 hover:underline font-semibold"
          >
            Close
          </button>
        </div>
      )}

      {/* ── Rules List ─────────────────────────────────────────────── */}
      {loading ? (
        <SkeletonCardList count={3} />
      ) : rules.length === 0 ? (
        <EmptyState
          icon={ListFilter}
          title="No automation rules configured"
          description="Create your first rule to automatically categorize client emails, highlight urgent messages, or archive outdated newsletters."
          actionLabel="Create First Rule"
          actionIcon={Plus}
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const isRunning = executingRuleId === rule.id;

            return (
              <div
                key={rule.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-200 ${
                  rule.is_active
                    ? "border-slate-200/90"
                    : "border-slate-200/60 opacity-60 bg-slate-50/40"
                }`}
              >
                {/* Rule Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(rule)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 mt-0.5 sm:mt-0 ${
                        rule.is_active ? "bg-blue-600" : "bg-slate-300"
                      }`}
                      role="switch"
                      aria-checked={rule.is_active}
                      title={rule.is_active ? "Deactivate rule" : "Activate rule"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          rule.is_active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                          {rule.name}
                        </h3>
                        <Badge
                          variant={rule.group_predicate === "ALL" ? "info" : "warning"}
                        >
                          {rule.group_predicate === "ALL" ? "Match ALL (AND)" : "Match ANY (OR)"}
                        </Badge>
                        {!rule.is_active && (
                          <Badge variant="default">Paused</Badge>
                        )}
                      </div>
                      {rule.description && (
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Run */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    <Button
                      variant="primary"
                      size="xs"
                      icon={Play}
                      loading={isRunning}
                      disabled={isRunning || !rule.is_active}
                      onClick={() => handleExecuteSingle(rule.id)}
                    >
                      {isRunning ? "Running…" : "Run Rule"}
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      icon={Edit2}
                      onClick={() => openEdit(rule)}
                      title="Edit rule"
                    >
                      Edit
                    </Button>

                    <Button
                      variant="dangerOutline"
                      size="xs"
                      icon={Trash2}
                      onClick={() => handleDelete(rule)}
                      title="Delete rule"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Conditions & Actions Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                  {/* Conditions Block */}
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-2">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Filter Predicates ({rule.conditions?.length || 0})
                    </p>
                    <div className="space-y-1.5">
                      {rule.conditions?.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-slate-700 flex-wrap"
                        >
                          <span className="font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 shadow-2xs">
                            {c.field}
                          </span>
                          <span className="text-slate-500 font-medium">
                            {c.predicate?.toLowerCase().replace(/_/g, " ")}
                          </span>
                          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs font-mono">
                            "{c.value}"{c.unit ? ` ${c.unit.toLowerCase()}` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-2">
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Automated Actions ({rule.actions?.length || 0})
                    </p>
                    <div className="space-y-1.5">
                      {rule.actions?.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 flex-wrap">
                          <Badge variant="success">
                            {a.action_type?.replace(/_/g, " ")}
                          </Badge>
                          {a.destination_label_name && (
                            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <strong className="text-slate-900">
                                {a.destination_label_name}
                              </strong>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
