/**
 * PublicNavbar — Navigation bar for the public landing page & privacy policy.
 * Designed to satisfy Google OAuth Branding verification criteria.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                Mail Pilot
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                Gmail Automation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="/#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="/#security" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Security & Privacy
            </a>
            <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <a href="/#contact" className="hover:text-blue-600 transition-colors">
              Contact
            </a>
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
          >
            How It Works
          </a>
          <a
            href="/#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
          >
            Security & Privacy
          </a>
          <Link
            to="/privacy-policy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
          >
            Privacy Policy
          </Link>
          <a
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
          >
            Contact
          </a>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
