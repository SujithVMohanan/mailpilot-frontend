/**
 * App.jsx — Root component.
 *
 * Responsibilities:
 *   1. Wraps the whole app in <AuthProvider> so every component can read auth state.
 *   2. Defines the entire client-side route map using React Router v6.
 *
 * Route structure:
 *   /                  → HomePage       (public - Google OAuth Verification landing)
 *   /privacy-policy    → PrivacyPolicy  (public - Google OAuth Verification policy)
 *   /privacy           → PrivacyPolicy  (public redirect)
 *   /login             → LoginPage      (public)
 *   /register          → RegisterPage   (public)
 *   /oauth/callback    → OAuthCallback  (public — Google redirects here)
 *   /app               → <ProtectedLayout> (requires login)
 *     /dashboard       → DashboardPage
 *     /emails          → EmailListPage
 *     /rules           → RulesPage
 *     /executions      → ExecutionHistoryPage
 *   * (catch-all)      → redirect to /
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Public Marketing & Legal Pages (for Google OAuth verification)
import HomePage          from "./pages/public/HomePage";
import PrivacyPolicyPage from "./pages/public/PrivacyPolicyPage";

// Layout
import ProtectedLayout from "./components/layout/ProtectedLayout";

// Auth pages
import LoginPage    from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";

// OAuth callback (public — Google lands here after consent)
import OAuthCallback from "./features/dashboard/pages/OAuthCallback";

// Protected pages
import DashboardPage        from "./features/dashboard/pages/DashboardPage";
import EmailListPage        from "./features/emails/pages/EmailListPage";
import RulesPage            from "./features/rules/pages/RulesPage";
import ExecutionHistoryPage from "./features/execution-history/pages/ExecutionHistoryPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Website & Verification Pages ────────────────── */}
          <Route path="/"               element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy"        element={<PrivacyPolicyPage />} />

          {/* ── Auth routes ────────────────────────────────────────── */}
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* ── Protected App Routes (require authentication) ──────── */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/emails"     element={<EmailListPage />} />
            <Route path="/rules"      element={<RulesPage />} />
            <Route path="/executions" element={<ExecutionHistoryPage />} />
          </Route>

          {/* ── Catch-all ──────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
