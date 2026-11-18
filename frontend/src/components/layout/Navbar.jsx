/**
 * Navbar — top application bar.
 *
 * Shows:
 *   - App name / logo (links to dashboard)
 *   - Logged-in user's email
 *   - Logout button
 *
 * Receives: nothing — reads user from AuthContext.
 */

import { Link, useNavigate } from "react-router-dom";
import { LogOut, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shadow-sm">
      {/* Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 font-bold text-blue-600 text-lg"
      >
        <Mail className="h-5 w-5" />
        MailPilot
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info */}
      {user && (
        <span className="text-sm text-gray-600 hidden sm:block">
          {user.email}
        </span>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        title="Logout"
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:block">Logout</span>
      </button>
    </nav>
  );
}
