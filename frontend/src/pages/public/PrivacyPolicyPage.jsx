/**
 * PrivacyPolicyPage — Official Privacy Policy for Mail Pilot.
 *
 * Formatted and structured to satisfy Google OAuth Verification requirements,
 * including mandatory Google API Services User Data Policy "Limited Use" disclosures.
 */

import { Link } from "react-router-dom";
import { ShieldCheck, Mail, ArrowLeft, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import PublicNavbar from "../../components/public/PublicNavbar";
import PublicFooter from "../../components/public/PublicFooter";

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 18, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-4 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Last updated: <strong>{lastUpdated}</strong>
            </p>
          </div>

          {/* Official Google Limited Use Disclosure Box (Prominent) */}
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-6 sm:p-8 mb-10 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl flex-shrink-0 mt-0.5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-sm text-blue-950">
                <h3 className="font-bold text-base text-blue-900">
                  Google API Services User Data Policy Compliance
                </h3>
                <p className="leading-relaxed">
                  Mail Pilot's use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline text-blue-700 hover:text-blue-800"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the <strong>Limited Use</strong> requirements.
                </p>
                <p className="text-xs text-blue-800">
                  We explicitly do NOT use Google user data to train generalized artificial intelligence or machine learning models, nor do we sell or monetize your data.
                </p>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                1. Overview & Purpose
              </h2>
              <p>
                <strong>Mail Pilot</strong> ("we", "our", or "us") provides a web-based productivity application designed to help users organize, categorize, and automate their Gmail inbox messages through configurable filtering rules.
              </p>
              <p>
                This Privacy Policy outlines how Mail Pilot collects, uses, protects, and handles your information when you access our website and use our application services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                2. Information We Collect
              </h2>
              <p>
                When you use Mail Pilot, we collect only the minimum information necessary to provide email automation services:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Account Registration Data:</strong> When you register an account with Mail Pilot, we collect your email address and an encrypted password hash.
                </li>
                <li>
                  <strong>Google OAuth Data:</strong> When you connect your Gmail account, Google provides an OAuth 2.0 access token, refresh token, and your primary Gmail address. We do <em>not</em> receive or store your Google account password.
                </li>
                <li>
                  <strong>Email Metadata & Content:</strong> To evaluate your user-defined automation rules, our system synchronizes message headers (Sender, Recipient, Subject, Date/Time), label assignments, message snippets, and message body text.
                </li>
                <li>
                  <strong>Automation Rules & Execution History:</strong> We store the custom condition predicates (e.g., "From contains billing@stripe.com") and corresponding actions you define, alongside audit execution logs detailing timestamps and execution outcomes.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                3. How We Use Your Information
              </h2>
              <p>
                We use the collected information exclusively to deliver, maintain, and optimize Mail Pilot's core features:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Evaluating your configured email rules against stored messages locally in our engine.</li>
                <li>Executing actions you have explicitly authorized (such as marking a message as read or moving it to a designated label).</li>
                <li>Displaying synchronized inbox messages, dashboard analytics, and audit execution histories.</li>
                <li>Authenticating your user session and safeguarding multi-tenant account boundaries.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                4. Strict Limitations on Use of Google User Data
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <p className="font-semibold text-slate-800">
                  In compliance with Google's Limited Use Requirements:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>No Advertising:</strong> We never use or transfer your email data for serving advertisements.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>No Selling:</strong> We never sell, rent, or lease your personal information or email data to third parties.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>No AI/ML Training:</strong> Your email content is never used to train generalized artificial intelligence or LLM models.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>No Human Inspection:</strong> No human reads your email messages unless you have given explicit consent for debugging, or required by applicable law.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                5. Data Security & Storage
              </h2>
              <p>
                We implement robust technical and organizational security controls to protect your data:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Token Encryption:</strong> OAuth access and refresh tokens are encrypted at rest using strong symmetric cryptographic algorithms (`EncryptedTextField`).
                </li>
                <li>
                  <strong>Transmission Encryption:</strong> All client-server communications occur strictly over HTTPS using modern Transport Layer Security (TLS 1.3).
                </li>
                <li>
                  <strong>Isolation:</strong> Multi-tenant isolation at the database level prevents cross-account access.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                6. Data Retention & Deletion
              </h2>
              <p>
                You retain complete ownership and control over your data:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Disconnecting Gmail:</strong> You can disconnect your Gmail account at any time directly from the Mail Pilot Dashboard. Disconnecting immediately revokes our stored OAuth credentials and halts synchronization.
                </li>
                <li>
                  <strong>Revoking via Google:</strong> You can revoke Mail Pilot's access at any time through your{" "}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-medium"
                  >
                    Google Account Security Settings
                  </a>
                  .
                </li>
                <li>
                  <strong>Account Deletion:</strong> You may request complete deletion of your user account and all associated synchronized email records by emailing our privacy team.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                7. Third-Party Disclosures
              </h2>
              <p>
                Mail Pilot does not share, sell, or disclose your personal information or email data to external third parties, except as strictly required by law enforcement or regulatory authorities pursuant to valid legal processes.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                8. Contact Information
              </h2>
              <p>
                If you have questions, feedback, or concerns regarding this Privacy Policy or our data protection practices, please contact our designated privacy officer:
              </p>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-800">Mail Pilot Privacy & Security Team</p>
                <p>Email: <a href="mailto:privacy@mailpilot.app" className="text-blue-600 hover:underline">privacy@mailpilot.app</a></p>
                <p>Support: <a href="mailto:support@mailpilot.app" className="text-blue-600 hover:underline">support@mailpilot.app</a></p>
                <p>Website: <a href="https://mailpilot.app" className="text-blue-600 hover:underline">https://mailpilot.app</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
