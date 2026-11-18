/**
 * HomePage — Public landing page for Mail Pilot.
 *
 * Designed to satisfy:
 *   - Google OAuth Application Branding guidelines
 *   - Clear application purpose, user workflow, and value proposition
 *   - Transparent Google API access justification and security disclosure
 */

import { Link } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  Zap,
  Filter,
  CheckCircle,
  Lock,
  ArrowRight,
  Database,
  RefreshCw,
  FolderOpen,
  Eye,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-18">
        {/* ── HERO SECTION ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold tracking-wide border border-blue-200 shadow-xs">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Verified Google Workspace Integration</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Take Control of Your <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Gmail Inbox
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Mail Pilot is an intelligent, rule-based email automation platform. Securely connect your Gmail account, define custom multi-condition filters, and automatically triage, label, and organize your messages with full audit transparency.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all hover:-translate-y-0.5"
                >
                  Start Automating Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-base border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition"
                >
                  Sign In to Dashboard
                </Link>
              </div>

              {/* Small Security Assurance */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-green-600" />
                  Google OAuth 2.0 Protocol
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                  No Credential Storage
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  Full Audit History
                </span>
              </div>
            </div>

            {/* Interactive Hero Preview Card */}
            <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl p-4 sm:p-6 transition hover:border-blue-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
                  <span className="text-xs font-mono text-slate-400 ml-2">mailpilot.app / automation-rules</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                  Engine Active
                </span>
              </div>

              {/* Sample Rule Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">1. Filter Trigger</p>
                  <p className="text-sm font-semibold text-slate-800">Match ALL Conditions</p>
                  <ul className="text-xs text-slate-600 mt-2 space-y-1">
                    <li>• <strong>Subject</strong> contains <span className="text-blue-600 font-mono">"Invoice"</span></li>
                    <li>• <strong>From</strong> contains <span className="text-blue-600 font-mono">"billing"</span></li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">2. Local Evaluation</p>
                  <p className="text-sm font-semibold text-slate-800">In-Memory Engine</p>
                  <p className="text-xs text-slate-600 mt-2">
                    Scans stored inbox records in PostgreSQL without exposing queries to external parsers.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3. Live Gmail Actions</p>
                  <p className="text-sm font-semibold text-slate-800">Two-Way Execution</p>
                  <ul className="text-xs text-slate-600 mt-2 space-y-1">
                    <li>• Mark as <strong>Read</strong></li>
                    <li>• Move to label <span className="text-purple-600 font-mono">"Financials"</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CORE FEATURES ───────────────────────────────────────────── */}
        <section id="features" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">
                Powerful Platform Features
              </h2>
              <p className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
                Built for Precision Inbox Management
              </p>
              <p className="mt-3 text-base text-slate-600">
                Everything you need to automate repetitive email categorization, archiving, and triage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Flexible Predicate Builder
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Combine multi-condition rules using <strong>ALL (AND)</strong> or <strong>ANY (OR)</strong> logic. Filter across Sender, Recipient, Subject, Body text, and relative dates.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  In-Memory Python Evaluation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Rules execute against your local PostgreSQL database rather than sending fragile query strings to Gmail. Ensures sub-second execution without quota exhaustion.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Live Two-Way Synchronization
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Actions modify your real Gmail mailbox via official Gmail REST API endpoints (`users.messages.modify`), ensuring web, mobile, and desktop stay perfectly in sync.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Label Routing & Organization
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Move matching emails to custom Gmail labels or folders, remove messages from Inbox, and toggle Read / Unread states with zero manual effort.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Comprehensive Audit Logging
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every automated run is recorded. Track exactly which emails matched, which actions succeeded, and inspect failure codes with complete auditability.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl border border-slate-200/70 bg-white hover:border-blue-300 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Strict Data Isolation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Multi-tenant security boundaries ensure users can only access their own synced messages and rules. Tokens are protected with cryptographic encryption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">
                Simple 3-Step Workflow
              </h2>
              <p className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
                How Mail Pilot Works
              </p>
              <p className="mt-3 text-base text-slate-600">
                Automate your inbox workflow in three straightforward steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
                <span className="text-4xl font-extrabold text-blue-100 absolute top-6 right-6">
                  01
                </span>
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Connect via Google OAuth
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sign in securely through Google’s official OAuth 2.0 consent window. Mail Pilot requests only the minimum permissions necessary (`gmail.modify`) to organize your inbox.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
                <span className="text-4xl font-extrabold text-blue-100 absolute top-6 right-6">
                  02
                </span>
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Build Custom Rules
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Create rules with our dynamic condition builder. Set predicates such as <em>"From contains stripe.com"</em> or <em>"Received older than 15 days"</em> and define corresponding actions.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs relative">
                <span className="text-4xl font-extrabold text-blue-100 absolute top-6 right-6">
                  03
                </span>
                <div className="w-10 h-10 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Automate & Audit
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Execute rules automatically or on-demand. Review execution logs to audit every matched message, applied label, and verify continuous sync integrity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECURITY & GOOGLE VERIFICATION DISCLOSURE ───────────────── */}
        <section id="security" className="py-20 bg-white border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Google API Policy Compliance</h3>
                  <p className="text-xs text-slate-300">Strict adherence to Google API Services User Data Policy</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  Mail Pilot is dedicated to the highest standards of data security and user privacy. We explicitly comply with the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the <strong>Limited Use</strong> requirements.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <p className="font-semibold text-white mb-1">✓ No Selling of Data</p>
                    <p className="text-slate-400">We never sell, rent, or monetize your personal information or email data.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <p className="font-semibold text-white mb-1">✓ Zero Advertising</p>
                    <p className="text-slate-400">Email data is never processed for advertisements or retargeting.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <p className="font-semibold text-white mb-1">✓ No Model Training</p>
                    <p className="text-slate-400">Your messages are never fed into AI or machine learning models.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <p className="font-semibold text-white mb-1">✓ Complete Revocability</p>
                    <p className="text-slate-400">Disconnect anytime from Mail Pilot or your Google Account settings.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <Link
                    to="/privacy-policy"
                    className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Read our Full Privacy Policy <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <span className="text-slate-400">Contact: privacy@mailpilot.app</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT & SUPPORT SECTION ───────────────────────────────── */}
        <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div>
              <h2 className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">
                Have Questions?
              </h2>
              <p className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
                We're Here to Help
              </p>
              <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
                Need support with Gmail integration, have privacy questions, or want help configuring email rules?
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-lg mx-auto">
              <Mail className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Official Support & Verification</h3>
              <p className="text-xs text-slate-500 mb-4">
                Inquiries regarding Google OAuth verification or support
              </p>
              <a
                href="mailto:support@mailpilot.app"
                className="inline-block px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-blue-700 font-semibold text-sm transition"
              >
                support@mailpilot.app
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
