/**
 * Sidebar — left navigation panel.
 *
 * Links:
 *   Dashboard        /dashboard
 *   Emails           /emails
 *   Rules            /rules
 *   Execution History /executions
 *
 * Active link is highlighted automatically via NavLink.
 */

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  ListFilter,
  ClipboardList,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/emails",    label: "Emails",    icon: Inbox },
  { to: "/rules",     label: "Rules",     icon: ListFilter },
  { to: "/executions",label: "History",   icon: ClipboardList },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-56 bg-white border-r border-gray-200 flex flex-col py-4 gap-1 shadow-sm">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`
          }
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
