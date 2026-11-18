/**
 * RegisterPage — /register
 *
 * Features:
 *   - Email + password + confirm-password form
 *   - Client-side validation (required, email format, password match, min length)
 *   - Calls POST /api/users/register/ via authService
 *   - On success: stores tokens via AuthContext.login() → navigates to /dashboard
 *   - On failure: maps backend field errors to individual form fields
 *   - Link back to /login
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { registerUser } from "../services/authService";
import FormInput from "../components/FormInput";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm]     = useState({ email: "", password: "", confirm_password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  }

  function validate() {
    const errs = {};
    if (!form.email.trim())       errs.email     = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
    if (!form.password)           errs.password  = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (!form.confirm_password)          errs.confirm_password = "Please confirm your password.";
    else if (form.password !== form.confirm_password) errs.confirm_password = "Passwords do not match.";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      const data = await registerUser(form.email, form.password, form.confirm_password);
      await login(data);
      navigate("/dashboard");
    } catch (err) {
      const serverErrors = err?.response?.data;

      if (serverErrors && typeof serverErrors === "object") {
        // Map backend field errors onto form fields
        const mapped = {};
        if (serverErrors.email)            mapped.email            = serverErrors.email[0];
        if (serverErrors.password)         mapped.password         = serverErrors.password[0];
        if (serverErrors.confirm_password) mapped.confirm_password = serverErrors.confirm_password[0];
        if (Object.keys(mapped).length) {
          setErrors(mapped);
          return;
        }
        // Generic non-field error
        setApiError(serverErrors.detail || serverErrors.non_field_errors?.[0] || "Registration failed. Please try again.");
      } else {
        setApiError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Mail className="h-7 w-7" />
            <span className="text-2xl font-bold">MailPilot</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Create your account</h1>
          <p className="text-sm text-gray-500">Start automating your Gmail inbox</p>
        </div>

        {/* API-level error banner */}
        {apiError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormInput
            id="email"
            name="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
            autoFocus
          />

          <FormInput
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
          />

          <FormInput
            id="confirm_password"
            name="confirm_password"
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            value={form.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
