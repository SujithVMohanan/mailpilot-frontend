/**
 * RuleModal — Modal form to create or edit an Email Automation Rule.
 *
 * Implements:
 *   - Name, Description, Group Predicate (ALL / ANY)
 *   - Dynamic Conditions builder (field, predicate, value, unit)
 *   - Dynamic Actions builder (MARK_AS_READ, MARK_AS_UNREAD, MOVE_MESSAGE)
 *   - Gmail labels selector for MOVE_MESSAGE
 */

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import Modal from "../../../components/ui/Modal";
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
          if (Array.isArray(data)) setLabels(data);
          else if (data?.results) setLabels(data.results);
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

  // ── Condition helpers ───────────────────────────────────────────────────────
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

  // ── Action helpers ──────────────────────────────────────────────────────────
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
    const labelName = typeof selected === "object" ? (selected.name || selected.id) : selected;
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

  // ── Validation & Submission ─────────────────────────────────────────────────
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
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Rule Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Categorize Invoices from Stripe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="Brief summary of what this automation does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Logic combination */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Condition Match Logic
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="group_predicate"
                  value="ALL"
                  checked={groupPredicate === "ALL"}
                  onChange={() => setGroupPredicate("ALL")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                Match <strong>ALL</strong> conditions (AND)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer">
                <input
                  type="radio"
                  name="group_predicate"
                  value="ANY"
                  checked={groupPredicate === "ANY"}
                  onChange={() => setGroupPredicate("ANY")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                Match <strong>ANY</strong> condition (OR)
              </label>
            </div>
          </div>
        </div>

        {/* Conditions Builder */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Conditions
            </h4>
            <button
              type="button"
              onClick={addCondition}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Condition
            </button>
          </div>

          <div className="space-y-3">
            {conditions.map((cond, index) => {
              const isDate = cond.field === "RECEIVED_DATE";
              const predicates = isDate ? DATE_PREDICATES : STRING_PREDICATES;

              return (
                <div
                  key={index}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  {/* Field */}
                  <select
                    value={cond.field}
                    onChange={(e) => handleConditionFieldChange(index, e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {FIELD_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Predicate */}
                  <select
                    value={cond.predicate}
                    onChange={(e) => updateCondition(index, "predicate", e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {predicates.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>

                  {/* Value */}
                  <input
                    type={isDate ? "number" : "text"}
                    min={isDate ? "1" : undefined}
                    placeholder={isDate ? "Number" : "Value to match…"}
                    value={cond.value}
                    onChange={(e) => updateCondition(index, "value", e.target.value)}
                    className="flex-1 min-w-[100px] px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  {/* Date Unit */}
                  {isDate && (
                    <select
                      value={cond.unit}
                      onChange={(e) => updateCondition(index, "unit", e.target.value)}
                      className="px-2 py-1.5 bg-white border border-gray-300 rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="DAYS">Days</option>
                      <option value="MONTHS">Months</option>
                    </select>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    disabled={conditions.length <= 1}
                    className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Builder */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Actions
            </h4>
            <button
              type="button"
              onClick={addAction}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Action
            </button>
          </div>

          <div className="space-y-3">
            {actions.map((act, index) => {
              const isMove = act.action_type === "MOVE_MESSAGE";

              return (
                <div
                  key={index}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  {/* Action Type */}
                  <select
                    value={act.action_type}
                    onChange={(e) => handleActionTypeChange(index, e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500"
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
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select Target Label…</option>
                          {labels.map((lbl) => {
                            const id = lbl.id || lbl;
                            const name = lbl.name || lbl;
                            return (
                              <option key={id} value={id}>
                                {name}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="Label ID / Name (e.g., INVOICE)"
                          value={act.destination_label_name || act.destination_label_id}
                          onChange={(e) =>
                            updateCondition(index, "destination_label_id", e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs sm:text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    disabled={actions.length <= 1}
                    className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-60 shadow-sm"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : isEditing ? "Update Rule" : "Create Rule"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
