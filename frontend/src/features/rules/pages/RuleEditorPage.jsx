/**
 * RuleEditorPage — Dedicated full-page editor for creating and updating automation rules.
 *
 * Replaces the popup modal with a spacious, user-friendly SaaS form page.
 * Supports both /rules/new (create) and /rules/:id/edit (edit).
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ListFilter,
  Sparkles,
  SlidersHorizontal,
  Tag,
  Save,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Spinner from "../../../components/ui/Spinner";
import { fetchLabels } from "../../emails/services/emailService";
import {
  fetchRuleDetail,
  createRule,
  updateRule,
} from "../services/ruleService";

const FIELD_OPTIONS = [
  { value: "FROM", label: "From (Sender)" },
  { value: "TO", label: "To (Recipient)" },
  { value: "SUBJECT", label: "Subject" },
  { value: "BODY", label: "Body Content" },
  { value: "RECEIVED_DATE", label: "Received Date" },
];

const STRING_PREDICATES = [
  { value: "CONTAINS", label: "Contains" },
  { value: "NOT_CONTAINS", label: "Does not contain" },
  { value: "EQUALS", label: "Equals" },
  { value: "NOT_EQUALS", label: "Does not equal" },
];

const DATE_PREDICATES = [
  { value: "LESS_THAN", label: "Less than (within last)" },
  { value: "GREATER_THAN", label: "Greater than (older than)" },
];

const ACTION_TYPES = [
  { value: "MARK_AS_READ", label: "Mark as Read" },
  { value: "MARK_AS_UNREAD", label: "Mark as Unread" },
  { value: "MOVE_MESSAGE", label: "Move to Label / Folder" },
];

export default function RuleEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Loading initial data for edit mode
  const [loadingInitial, setLoadingInitial] = useState(isEditing);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupPredicate, setGroupPredicate] = useState("ALL");
  const [isActive, setIsActive] = useState(true);

  const [conditions, setConditions] = useState([
    { field: "SUBJECT", predicate: "CONTAINS", value: "", unit: "" },
  ]);

  const [actions, setActions] = useState([
    { action_type: "MARK_AS_READ", destination_label_id: "", destination_label_name: "" },
  ]);

  const [labels, setLabels] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load Gmail labels for destination folder dropdown
  useEffect(() => {
    fetchLabels()
      .then((data) => {
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (data?.labels) list = data.labels;
        else if (data?.results) list = data.results;
        else if (data?.data?.labels) list = data.data.labels;
        setLabels(list);
      })
      .catch(() => {});
  }, []);

  // If in edit mode, fetch existing rule
  useEffect(() => {
    if (!id) return;
    setLoadingInitial(true);
    fetchRuleDetail(id)
      .then((data) => {
        const rule = data?.data || data;
        if (rule) {
          setName(rule.name || "");
          setDescription(rule.description || "");
          setGroupPredicate(rule.group_predicate || "ALL");
          setIsActive(rule.is_active ?? true);
          setConditions(
            rule.conditions?.length
              ? rule.conditions.map((c) => ({
                  field: c.field,
                  predicate: c.predicate,
                  value: c.value,
                  unit: c.unit || "",
                }))
              : [{ field: "SUBJECT", predicate: "CONTAINS", value: "", unit: "" }]
          );
          setActions(
            rule.actions?.length
              ? rule.actions.map((a) => ({
                  action_type: a.action_type,
                  destination_label_id: a.destination_label_id || "",
                  destination_label_name: a.destination_label_name || "",
                }))
              : [{ action_type: "MARK_AS_READ", destination_label_id: "", destination_label_name: "" }]
          );
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load rule details.");
      })
      .finally(() => {
        setLoadingInitial(false);
      });
  }, [id]);

  // Condition handlers
  function handleConditionFieldChange(index, newField) {
    const updated = [...conditions];
    const isDate = newField === "RECEIVED_DATE";
    updated[index] = {
      field: newField,
      predicate: isDate ? "LESS_THAN" : "CONTAINS",
      value: "",
      unit: isDate ? "DAYS" : "",
    };
    setConditions(updated);
  }

  function updateCondition(index, key, val) {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [key]: val };
    setConditions(updated);
  }

  function addCondition() {
    setConditions([
      ...conditions,
      { field: "FROM", predicate: "CONTAINS", value: "", unit: "" },
    ]);
  }

  function removeCondition(index) {
    if (conditions.length <= 1) return;
    setConditions(conditions.filter((_, i) => i !== index));
  }

  // Action handlers
  function handleActionTypeChange(index, type) {
    const updated = [...actions];
    updated[index] = {
      action_type: type,
      destination_label_id: "",
      destination_label_name: "",
    };
    setActions(updated);
  }

  function handleLabelSelect(index, labelId) {
    const selected = labels.find((l) => (l.id || l) === labelId);
    const labelName = typeof selected === "object" ? selected.name || selected.id : selected;
    const updated = [...actions];
    updated[index] = {
      ...updated[index],
      destination_label_id: labelId,
      destination_label_name: labelName || labelId,
    };
    setActions(updated);
  }

  function addAction() {
    setActions([
      ...actions,
      { action_type: "MARK_AS_READ", destination_label_id: "", destination_label_name: "" },
    ]);
  }

  function removeAction(index) {
    if (actions.length <= 1) return;
    setActions(actions.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Rule name is required.");
      return;
    }

    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];
      if (!c.value.trim()) {
        setError(`Condition #${i + 1} requires a comparison value.`);
        return;
      }
      if (c.field === "RECEIVED_DATE" && !c.unit) {
        setError(`Condition #${i + 1} requires a time unit (Days or Months).`);
        return;
      }
    }

    for (let i = 0; i < actions.length; i++) {
      const a = actions[i];
      if (a.action_type === "MOVE_MESSAGE" && !a.destination_label_id) {
        setError(`Action #${i + 1} (Move message) requires a destination label.`);
        return;
      }
    }

    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      is_active: isActive,
      group_predicate: groupPredicate,
      conditions: conditions.map((c) => ({
        field: c.field,
        predicate: c.predicate,
        value: c.value.trim(),
        unit: c.field === "RECEIVED_DATE" ? c.unit : "",
      })),
      actions: actions.map((a) => ({
        action_type: a.action_type,
        destination_label_id: a.destination_label_id || "",
        destination_label_name: a.destination_label_name || "",
      })),
    };

    try {
      if (isEditing) {
        await updateRule(id, payload);
      } else {
        await createRule(payload);
      }
      navigate("/rules");
    } catch (err) {
      const resp = err?.response?.data;
      const msg =
        resp?.message ||
        resp?.detail ||
        (resp?.errors ? JSON.stringify(resp.errors) : null) ||
        "Failed to save rule.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loadingInitial) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Loading rule settings…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* ── Top Navigation & Back Link ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/rules"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Automation Rules</span>
        </Link>

        <Badge variant={isActive ? "success" : "default"} withDot>
          {isActive ? "Active Rule" : "Paused"}
        </Badge>
      </div>

      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="pb-3 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isEditing ? `Edit Rule: ${name || "Untitled"}` : "Create Automation Rule"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure rule predicates and specify corresponding triage actions on your inbox.
        </p>
      </div>

      {/* ── Error Banner ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800 flex items-center gap-3 shadow-subtle">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Card 1: Basic Information ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-7 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">1. Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Rule Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Move Stripe Invoices to Billing Label"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="Brief description explaining what this rule automates"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Group Predicate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Match Mode
                </label>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setGroupPredicate("ALL")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      groupPredicate === "ALL"
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Match ALL Conditions (AND)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupPredicate("ANY")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      groupPredicate === "ANY"
                        ? "bg-white text-blue-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Match ANY Condition (OR)
                  </button>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex flex-col justify-end">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Rule Status
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      isActive ? "bg-blue-600" : "bg-slate-300"
                    }`}
                    role="switch"
                    aria-checked={isActive}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-800">
                    {isActive ? "Active (Rule runs during evaluations)" : "Paused"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Card 2: Match Conditions ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ListFilter className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                2. Filter Predicates ({conditions.length})
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              icon={Plus}
              onClick={addCondition}
            >
              Add Condition
            </Button>
          </div>

          <div className="space-y-3 pt-1">
            {conditions.map((cond, index) => {
              const isDate = cond.field === "RECEIVED_DATE";
              const predicateOptions = isDate ? DATE_PREDICATES : STRING_PREDICATES;

              return (
                <div
                  key={index}
                  className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>

                  {/* Field Selector */}
                  <div className="w-full md:w-44 flex-shrink-0">
                    <select
                      value={cond.field}
                      onChange={(e) => handleConditionFieldChange(index, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    >
                      {FIELD_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Predicate Selector */}
                  <div className="w-full md:w-44 flex-shrink-0">
                    <select
                      value={cond.predicate}
                      onChange={(e) => updateCondition(index, "predicate", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    >
                      {predicateOptions.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Value Input */}
                  <div className="flex-1 min-w-[150px]">
                    <input
                      type={isDate ? "number" : "text"}
                      placeholder={isDate ? "Number of days (e.g. 7)" : "Search term or address…"}
                      value={cond.value}
                      onChange={(e) => updateCondition(index, "value", e.target.value)}
                      min={isDate ? "1" : undefined}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                      required
                    />
                  </div>

                  {/* Date Unit */}
                  {isDate && (
                    <div className="w-28 flex-shrink-0">
                      <select
                        value={cond.unit}
                        onChange={(e) => updateCondition(index, "unit", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        required
                      >
                        <option value="DAYS">Days</option>
                        <option value="MONTHS">Months</option>
                      </select>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    disabled={conditions.length <= 1}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer self-end md:self-auto"
                    title="Remove condition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Card 3: Automated Actions ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                3. Automated Actions ({actions.length})
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              icon={Plus}
              onClick={addAction}
            >
              Add Action
            </Button>
          </div>

          <div className="space-y-3 pt-1">
            {actions.map((act, index) => {
              const isMove = act.action_type === "MOVE_MESSAGE";

              return (
                <div
                  key={index}
                  className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>

                  {/* Action Type */}
                  <div className="w-full md:w-56 flex-shrink-0">
                    <select
                      value={act.action_type}
                      onChange={(e) => handleActionTypeChange(index, e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    >
                      {ACTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Label if Move */}
                  {isMove && (
                    <div className="flex-1 min-w-[180px]">
                      {labels.length > 0 ? (
                        <select
                          value={act.destination_label_id}
                          onChange={(e) => handleLabelSelect(index, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs font-medium"
                          required
                        >
                          <option value="">Select Destination Label…</option>
                          {labels.map((lbl) => {
                            const lblId = lbl.id || lbl;
                            const labelName = lbl.name || lbl;
                            return (
                              <option key={lblId} value={lblId}>
                                {labelName}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Label name (e.g., Invoices)"
                          value={act.destination_label_name || act.destination_label_id}
                          onChange={(e) => {
                            const updated = [...actions];
                            updated[index] = {
                              ...updated[index],
                              destination_label_id: e.target.value,
                              destination_label_name: e.target.value,
                            };
                            setActions(updated);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                          required
                        />
                      )}
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    disabled={actions.length <= 1}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer self-end md:self-auto"
                    title="Remove action"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Form Actions Bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => navigate("/rules")}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            loading={saving}
            disabled={saving}
          >
            {saving ? "Saving Rule…" : isEditing ? "Update Rule" : "Create Rule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
