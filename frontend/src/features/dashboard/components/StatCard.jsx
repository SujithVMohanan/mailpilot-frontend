/**
 * StatCard — displays a single dashboard metric.
 *
 * Props:
 *   title   — metric label (e.g. "Total Emails")
 *   value   — numeric value
 *   icon    — Lucide icon component
 *   color   — Tailwind color key: "blue" | "green" | "purple" | "orange"
 */

const COLOR_MAP = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-100" },
  green:  { bg: "bg-green-50",  icon: "text-green-600",  border: "border-green-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-100" },
};

export default function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 flex items-center gap-4`}>
      <div className={`${c.icon} flex-shrink-0`}>
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}
