/**
 * Sidebar — Left navigation panel with mobile responsive slide-in drawer.
 */

import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  ListFilter,
  ClipboardList,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/emails",    label: "Synced Emails", icon: Inbox },
  { to: "/rules",     label: "Automation Rules", icon: ListFilter },
  { to: "/executions",label: "Audit History", icon: ClipboardList },
];

export default function Sidebar({ isOpen, onClose }) {
  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Nav List */}
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Workspace
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4.5 w-4.5 flex-shrink-0 transition-colors ${
                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Info Card */}
      <div className="p-3 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Google API Verified</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Adheres strictly to Google's Limited Use Data Policy.
          </p>
          <NavLink
            to="/privacy-policy"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline pt-0.5"
          >
            Privacy Policy <ExternalLink className="h-3 w-3" />
          </NavLink>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:flex fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 flex-col py-4 shadow-subtle z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer (Slide-in with Backdrop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-down">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-base">Navigation</span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 py-4 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
