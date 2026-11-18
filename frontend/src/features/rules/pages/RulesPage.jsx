/**
 * RulesPage — /rules
 *
 * Implements:
 *   - List all email rules with condition and action summaries
 *   - Create and Edit rules via RuleModal
 *   - Toggle rule active status
 *   - Run individual rule
 *   - Run all active rules
 *   - Delete rule
 */

import { useState, useEffect, useCallback } from "react";
import {
  ListFilter,
  Plus,
  Play,
  RotateCcw,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react";
import RuleModal from "../components/RuleModal";
import Spinner from "../../../components/ui/Spinner";
import Badge from "../../../components/ui/Badge";
import {
  fetchRules,
  toggleRule,
  deleteRule,
  executeRule,
  executeAllRules,
} from "../services/ruleService";

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null);

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
      setError(err?.response?.data?.message || err?.response?.data?.detail || "Failed to load rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // ── Actions ─────────────────────────────────────────────────────────────────
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

  async function handleDelete(rule) {
    if (!window.confirm(`Are you sure you want to delete rule "${rule.name}"?`)) return;
    try {
      await deleteRule(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      setActionMsg(`Rule "${rule.name}" deleted.`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete rule.");
    }
  }

  async function handleExecuteSingle(ruleId) {
    setExecutingRuleId(ruleId);
    setActionMsg("");
    setError("");
    try {
      const result = await executeRule(ruleId);
      const matched = result?.total_matched ?? 0;
      const succeeded = result?.actions_succeeded ?? 0;
      setActionMsg(`Execution complete: ${matched} matched, ${succeeded} actions performed.`);
    } catch (err) {
      setError(err?.response?.data?.message || "Rule execution failed.");
    } finally {
      setExecutingRuleId(null);
    }
  }

  async function handleExecuteAll() {
    setExecutingAll(true);
    setActionMsg("");
    setError("");
    try {
      const results = await executeAllRules();
      const count = Array.isArray(results) ? results.length : 1;
      setActionMsg(`Executed ${count} active rule(s) successfully.`);
    } catch (err) {
      setError(err?.response?.data?.message || "Bulk rule execution failed.");
    } finally {
      setExecutingAll(false);
    }
  }

  function openCreate() {
    setRuleToEdit(null);
    setIsModalOpen(true);
  }

  function openEdit(rule) {
    setRuleToEdit(rule);
    setIsModalOpen(true);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Automation Rules</h1>
          <p className="text-sm text-gray-500">
            Define multi-condition predicates to automatically organize and triage your emails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {rules.some((r) => r.is_active) && (
            <button
              onClick={handleExecuteAll}
              disabled={executingAll}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60 shadow-sm"
            >
              {executingAll ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <Zap className="h-4 w-4 text-amber-500" />
              )}
              {executingAll ? "Running Rules…" : "Run All Active Rules"}
            </button>
          )}

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Rule
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {actionMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {actionMsg}
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Rules list */}
      {!loading && (
        <>
          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-200 shadow-sm">
              <ListFilter className="h-12 w-12 mb-3 opacity-30 text-gray-400" />
              <p className="text-base font-semibold text-gray-700">No automation rules configured</p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm text-center">
                Create rules to automatically mark messages as read/unread or route them to specific labels.
              </p>
              <button
                onClick={openCreate}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="h-4 w-4" />
                Create First Rule
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => {
                const isRunning = executingRuleId === rule.id;

                return (
                  <div
                    key={rule.id}
                    className={`bg-white rounded-xl border p-5 shadow-sm transition ${
                      rule.is_active ? "border-gray-200" : "border-gray-100 opacity-60 bg-gray-50/50"
                    }`}
                  >
                    {/* Top Row: Name, Match Logic, Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(rule)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            rule.is_active ? "bg-blue-600" : "bg-gray-300"
                          }`}
                          role="switch"
                          aria-checked={rule.is_active}
                          title={rule.is_active ? "Deactivate rule" : "Activate rule"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              rule.is_active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800 text-base">{rule.name}</h3>
                            <Badge
                              label={rule.group_predicate === "ALL" ? "Match ALL" : "Match ANY"}
                              variant={rule.group_predicate === "ALL" ? "info" : "warning"}
                            />
                            {!rule.is_active && (
                              <Badge label="Inactive" variant="default" />
                            )}
                          </div>
                          {rule.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{rule.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExecuteSingle(rule.id)}
                          disabled={isRunning || !rule.is_active}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:opacity-40"
                          title="Execute rule against stored emails"
                        >
                          {isRunning ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          {isRunning ? "Running…" : "Run Rule"}
                        </button>

                        <button
                          onClick={() => openEdit(rule)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                          title="Edit rule"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(rule)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Conditions & Actions Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                      {/* Conditions */}
                      <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
                        <p className="font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Conditions ({rule.conditions?.length || 0})
                        </p>
                        <div className="space-y-1.5">
                          {rule.conditions?.map((c, i) => (
                            <div key={i} className="flex items-center gap-1 text-gray-700">
                              <span className="font-medium bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                {c.field}
                              </span>
                              <span className="text-gray-500">{c.predicate?.toLowerCase().replace("_", " ")}</span>
                              <span className="font-semibold text-gray-900 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                "{c.value}" {c.unit ? c.unit.toLowerCase() : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
                        <p className="font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Actions ({rule.actions?.length || 0})
                        </p>
                        <div className="space-y-1.5">
                          {rule.actions?.map((a, i) => (
                            <div key={i} className="flex items-center gap-1 text-gray-700">
                              <Badge
                                label={a.action_type.replace(/_/g, " ")}
                                variant="success"
                              />
                              {a.destination_label_name && (
                                <span className="text-gray-600">
                                  → <strong>{a.destination_label_name}</strong>
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
        </>
      )}

      {/* Modal */}
      <RuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleToEdit={ruleToEdit}
        onSaved={loadRules}
      />
    </div>
  );
}
