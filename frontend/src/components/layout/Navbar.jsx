/**
 * Navbar — Top application bar with responsive mobile trigger & profile menu.
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  Mail,
  User,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // Generate user initial
  const userInitial = user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-subtle">
      {/* Left: Mobile Toggle & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Mail className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
            Mail Pilot
          </span>
        </Link>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3">
        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            aria-expanded={profileOpen}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shadow-2xs">
              {userInitial}
            </div>

            {/* Email on desktop */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">
                {user?.email || "Account"}
              </p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 font-medium">Active</span>
              </div>
            </div>

            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform hidden sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-dropdown py-2 z-50 animate-slide-down">
              {/* Profile Card Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Signed in as
                </p>
                <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              {/* Links */}
              <div className="py-1">
                <Link
                  to="/privacy-policy"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  Privacy & Google Compliance
                </Link>

                <a
                  href="/#security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                    Public Documentation
                  </span>
                </a>
              </div>

              {/* Logout Button */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
