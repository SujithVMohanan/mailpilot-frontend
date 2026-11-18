/**
 * FormInput — reusable labelled input for auth forms.
 *
 * Props:
 *   id       — links <label> and <input>
 *   label    — visible label text
 *   error    — validation error string (shown in red when present)
 *   ...rest  — forwarded to <input> (type, value, onChange, placeholder, …)
 */

export default function FormInput({ id, label, error, ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
          focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
