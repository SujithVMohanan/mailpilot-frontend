/**
 * RuleModal — Polished modal dialog for creating and updating automation rules.
 */

import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle, Sparkles, SlidersHorizontal } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { fetchLabels } from "../../emails/services/emailService";
import { createRule, updateRule } from "../services/ruleService";

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

export default function RuleModal({ isOpen, onClose, ruleToEdit, onSaved }) {
  const isEditing = Boolean(ruleToEdit);

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

  // Load Gmail labels for MOVE_MESSAGE dropdown
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  // Reset or initialize form
  useEffect(() => {
    if (ruleToEdit) {
      setName(ruleToEdit.name || "");
      setDescription(ruleToEdit.description || "");
      setGroupPredicate(ruleToEdit.group_predicate || "ALL");
      setIsActive(ruleToEdit.is_active ?? true);
      setConditions(
        ruleToEdit.conditions?.length
          ? ruleToEdit.conditions.map((c) => ({
              field: c.field,
              predicate: c.predicate,
              value: c.value,
              unit: c.unit || "",
            }))
          : [{ field: "SUBJECT", predicate: "CONTAINS", value: "", unit: "" }]
      );
      setActions(
        ruleToEdit.actions?.length
          ? ruleToEdit.actions.map((a) => ({
              action_type: a.action_type,
              destination_label_id: a.destination_label_id || "",
              destination_label_name: a.destination_label_name || "",
            }))
          : [{ action_type: "MARK_AS_READ", destination_label_id: "", destination_label_name: "" }]
      );
    } else {
      setName("");
      setDescription("");
      setGroupPredicate("ALL");
      setIsActive(true);
      setConditions([{ field: "SUBJECT", predicate: "CONTAINS", value: "", unit: "" }]);
      setActions([{ action_type: "MARK_AS_READ", destination_label_id: "", destination_label_name: "" }]);
    }
    setError("");
  }, [ruleToEdit, isOpen]);

  // Condition helpers
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

  // Action helpers
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
        await updateRule(ruleToEdit.id, payload);
      } else {
        await createRule(payload);
      }
      onSaved();
      onClose();
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Automation Rule" : "Create Automation Rule"}
      subtitle="Define match conditions and corresponding Gmail inbox actions."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs sm:text-sm text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Section 1: Basic Information ───────────────────────── */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Rule Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Categorize Stripe Invoices & Receipts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-subtle transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Brief description of when this automation executes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-subtle transition"
            />
          </div>

          {/* Logic Toggle Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Match Logic Combination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  groupPredicate === "ALL"
                    ? "bg-blue-50/70 border-blue-400 shadow-2xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/60"
                }`}
              >
                <input
                  type="radio"
                  name="group_predicate"
                  value="ALL"
                  checked={groupPredicate === "ALL"}
                  onChange={() => setGroupPredicate("ALL")}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">
                    Match ALL conditions (AND)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    Every condition specified below must evaluate to true.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  groupPredicate === "ANY"
                    ? "bg-blue-50/70 border-blue-400 shadow-2xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/60"
                }`}
              >
                <input
                  type="radio"
                  name="group_predicate"
                  value="ANY"
                  checked={groupPredicate === "ANY"}
                  onChange={() => setGroupPredicate("ANY")}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">
                    Match ANY condition (OR)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    At least one condition matching triggers the actions.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── Section 2: Conditions Builder ──────────────────────── */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Trigger Conditions
              </h4>
              <p className="text-[11px] text-slate-500">
                Filters evaluated locally against stored email records.
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              icon={Plus}
              onClick={addCondition}
            >
              Add Condition
            </Button>
          </div>

          <div className="space-y-2.5">
            {conditions.map((cond, index) => {
              const isDate = cond.field === "RECEIVED_DATE";
              const predicates = isDate ? DATE_PREDICATES : STRING_PREDICATES;

              return (
                <div
                  key={index}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/90"
                >
                  {/* Field Selector */}
                  <select
                    value={cond.field}
                    onChange={(e) => handleConditionFieldChange(index, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  >
                    {FIELD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Predicate Selector */}
                  <select
                    value={cond.predicate}
                    onChange={(e) => updateCondition(index, "predicate", e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  >
                    {predicates.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>

                  {/* Value Input */}
                  <input
                    type={isDate ? "number" : "text"}
                    min={isDate ? "1" : undefined}
                    placeholder={isDate ? "Offset count" : "Value to match…"}
                    value={cond.value}
                    onChange={(e) => updateCondition(index, "value", e.target.value)}
                    className="flex-1 min-w-[120px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />

                  {/* Date Unit */}
                  {isDate && (
                    <select
                      value={cond.unit}
                      onChange={(e) => updateCondition(index, "unit", e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    >
                      <option value="DAYS">Days</option>
                      <option value="MONTHS">Months</option>
                    </select>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    disabled={conditions.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
                    title="Remove condition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Actions Builder ─────────────────────────── */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Automated Actions
              </h4>
              <p className="text-[11px] text-slate-500">
                Actions applied to matching emails in Gmail and local database.
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              icon={Plus}
              onClick={addAction}
            >
              Add Action
            </Button>
          </div>

          <div className="space-y-2.5">
            {actions.map((act, index) => {
              const isMove = act.action_type === "MOVE_MESSAGE";

              return (
                <div
                  key={index}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/90"
                >
                  {/* Action Selector */}
                  <select
                    value={act.action_type}
                    onChange={(e) => handleActionTypeChange(index, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  >
                    {ACTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {/* Destination Label if Move */}
                  {isMove && (
                    <div className="flex-1 min-w-[140px]">
                      {labels.length > 0 ? (
                        <select
                          value={act.destination_label_id}
                          onChange={(e) => handleLabelSelect(index, e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        >
                          <option value="">Select Destination Label…</option>
                          {labels.map((lbl) => {
                            const id = lbl.id || lbl;
                            const labelName = lbl.name || lbl;
                            return (
                              <option key={id} value={id}>
                                {labelName}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Label name (e.g., Reports)"
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
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                        />
                      )}
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    disabled={actions.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
                    title="Remove action"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Modal Footer ────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={saving}
            disabled={saving}
          >
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Rule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
