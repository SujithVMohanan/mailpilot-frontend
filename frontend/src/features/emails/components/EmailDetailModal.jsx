/**
 * EmailDetailModal — Complete, reliable message viewer with safe HTML / Text preview.
 *
 * Designed to eliminate blank detail views:
 *   - Immediately renders passed email object (subject, sender, recipient, date, status, labels, snippet)
 *   - Fetches full bodies (body_html, body_text) in background and merges smoothly
 *   - Renders HTML emails inside an isolated, sandboxed preview iframe to prevent CSS bleeding
 *   - Fallback cascading: Formatted HTML → Plain Text → Snippet Preview → Empty indicator
 *   - Copy Subject & Copy Body actions with user feedback
 */

import React, { useEffect, useState, useMemo } from "react";
import {
  Mail,
  User,
  Calendar,
  Tag,
  CheckCheck,
  Clock,
  Copy,
  Check,
  Code,
  FileText,
  AlertCircle,
  Hash,
  Sparkles,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Spinner from "../../../components/ui/Spinner";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { fetchEmailDetail } from "../services/emailService";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function cleanSenderName(senderStr) {
  if (!senderStr) return "Unknown";
  const match = senderStr.match(/^"?([^"<]+)"?\s*<?/);
  if (match && match[1].trim()) {
    return match[1].trim();
  }
  return senderStr.split("@")[0] || senderStr;
}

/**
 * Strip executable scripts, event handlers, and active content from raw email HTML.
 * Real email clients (Gmail, Outlook) do this to protect the user.
 */
function sanitizeEmailHtml(rawHtml) {
  if (!rawHtml) return "";
  return rawHtml
    // Remove all <script>...</script> tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove all <noscript>...</noscript> tags and contents
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    // Remove inline event handlers like onload, onerror, onclick, etc.
    .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\s+on\w+\s*=\s*[^>\s]+/gi, "")
    // Neutralize javascript: pseudo-protocol in href/src
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"');
}

/**
 * Sandboxed HTML viewer: wraps the email's raw HTML in a clean, isolated
 * document with standard base typography to prevent styling leaks or dark/light mode clashes.
 */
function HtmlEmailFrame({ html }) {
  const sanitizedDoc = useMemo(() => {
    if (!html) return "";
    const cleanHtml = sanitizeEmailHtml(html);

    const resetStyles = `
      <style>
        html, body {
          margin: 0 !important;
          padding: 16px !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #1e293b !important;
          background-color: #ffffff !important;
          word-break: break-word !important;
        }
        img { max-width: 100% !important; height: auto !important; }
        table { max-width: 100% !important; }
        a { color: #2563eb !important; text-decoration: underline !important; }
        pre, code { white-space: pre-wrap !important; word-break: break-all !important; }
      </style>
    `;

    // If already a complete HTML document, inject reset inside head
    if (/<!DOCTYPE|<html/i.test(cleanHtml)) {
      if (/<head[^>]*>/i.test(cleanHtml)) {
        return cleanHtml.replace(/<head[^>]*>/i, `$&${resetStyles}`);
      }
      return `${resetStyles}${cleanHtml}`;
    }

    // Otherwise wrap as a full clean HTML document
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${resetStyles}
  </head>
  <body>${cleanHtml}</body>
</html>`;
  }, [html]);

  return (
    <iframe
      srcDoc={sanitizedDoc}
      title="Email content"
      className="w-full min-h-[360px] h-[55vh] rounded-xl border border-slate-100 bg-white shadow-2xs"
      sandbox="allow-popups allow-popups-to-escape-sandbox"
    />
  );
}

export default function EmailDetailModal({ email: initialEmail, emailId, onClose }) {
  const activeId = initialEmail?.id || emailId;
  const isOpen = Boolean(activeId);

  const [email, setEmail] = useState(initialEmail || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("html"); // "html" | "text"
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Sync state whenever initialEmail or activeId changes
  useEffect(() => {
    if (!activeId) {
      setEmail(null);
      setError("");
      setLoading(false);
      return;
    }

    // Populate immediately with initial email data if available
    if (initialEmail) {
      setEmail(initialEmail);
    }

    setLoading(true);
    setError("");

    fetchEmailDetail(activeId)
      .then((data) => {
        // Defensively unwrap response data
        const unwrapped = data?.data?.data || data?.data || data;
        if (unwrapped && typeof unwrapped === "object") {
          setEmail((prev) => ({
            ...(prev || {}),
            ...unwrapped,
          }));

          // Pick the best default view mode based on returned content
          if (unwrapped.body_html && unwrapped.body_html.trim()) {
            setViewMode("html");
          } else if (unwrapped.body_text && unwrapped.body_text.trim()) {
            setViewMode("text");
          }
        }
      })
      .catch((err) => {
        // If we don't even have initialEmail, surface the error
        if (!initialEmail) {
          setError(
            err?.response?.data?.message ||
            err?.response?.data?.detail ||
            "Failed to load email message details."
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeId, initialEmail]);

  function handleCopySubject() {
    if (email?.subject) {
      navigator.clipboard.writeText(email.subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 1500);
    }
  }

  function handleCopyBody() {
    const content = email?.body_text || email?.snippet || email?.body_html || "";
    if (content) {
      navigator.clipboard.writeText(content);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 1500);
    }
  }

  const hasHtml = Boolean(email?.body_html && email.body_html.trim());
  const hasText = Boolean(email?.body_text && email.body_text.trim());
  const hasSnippet = Boolean(email?.snippet && email.snippet.trim());

  // Sender details
  const senderName = cleanSenderName(email?.sender);
  const senderInitial = senderName[0]?.toUpperCase() || "M";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={email?.subject || "Email Details"}
      size="xl"
    >
      {/* If loading without any cached/initial data */}
      {loading && !email ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Fetching message details…
          </p>
        </div>
      ) : error && !email ? (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">Unable to load email</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      ) : email ? (
        <div className="space-y-6 text-sm">
          {/* ── Metadata Header Card ───────────────────────────────── */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {senderInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    From
                  </p>
                  <p className="font-semibold text-slate-900 truncate" title={email.sender}>
                    {email.sender || "—"}
                  </p>
                </div>
              </div>

              {/* To */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    To
                  </p>
                  <p className="font-medium text-slate-800 truncate" title={email.recipient}>
                    {email.recipient || "—"}
                  </p>
                </div>
              </div>

              {/* Received Date */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Date Received
                  </p>
                  <p className="text-slate-700 font-medium">
                    {formatDate(email.received_datetime)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <Badge
                    variant={email.is_read ? "default" : "warning"}
                    withDot
                    className="mt-0.5"
                  >
                    {email.is_read ? "Read" : "Unread"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Labels */}
            {email.label_ids?.length > 0 && (
              <div className="pt-2.5 border-t border-slate-200/60 flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 mr-1">
                  Gmail Labels:
                </span>
                {email.label_ids.map((lbl) => (
                  <Badge
                    key={lbl}
                    size="sm"
                    variant={lbl === "INBOX" ? "info" : "default"}
                  >
                    {lbl}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* ── Subject & View Controls Bar ────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {email.subject || "(No Subject)"}
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Copy Subject */}
              <Button
                variant="ghost"
                size="xs"
                icon={copiedSubject ? Check : Copy}
                onClick={handleCopySubject}
                className="text-slate-500 hover:text-slate-900"
              >
                {copiedSubject ? "Copied Subject" : "Copy Subject"}
              </Button>

              {/* Copy Body */}
              <Button
                variant="ghost"
                size="xs"
                icon={copiedBody ? Check : Copy}
                onClick={handleCopyBody}
                className="text-slate-500 hover:text-slate-900"
              >
                {copiedBody ? "Copied Body" : "Copy Body"}
              </Button>

              {/* HTML / Text toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("html")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    viewMode === "html"
                      ? "bg-white text-blue-600 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("text")}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    viewMode === "text"
                      ? "bg-white text-blue-600 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Plain Text
                </button>
              </div>
            </div>
          </div>

          {/* ── Email Body Preview Container ───────────────────────── */}
          <div className="border border-slate-200 rounded-2xl bg-white p-4 sm:p-5 shadow-subtle min-h-[220px] overflow-hidden relative">
            {/* Background fetching indicator */}
            {loading && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold animate-pulse z-10 shadow-xs">
                <Spinner size="xs" />
                <span>Loading full message…</span>
              </div>
            )}

            {viewMode === "html" && hasHtml ? (
              /* Isolated Sandboxed HTML View */
              <HtmlEmailFrame html={email.body_html} />
            ) : viewMode === "text" && hasText ? (
              /* Plain Text View */
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed font-normal overflow-x-auto max-h-[55vh]">
                {email.body_text}
              </pre>
            ) : hasHtml ? (
              /* If text view requested but only HTML exists */
              <HtmlEmailFrame html={email.body_html} />
            ) : hasText ? (
              /* If html view requested but only text exists */
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed font-normal overflow-x-auto max-h-[55vh]">
                {email.body_text}
              </pre>
            ) : hasSnippet ? (
              /* Fallback to Snippet */
              <div className="space-y-3 py-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Snippet Preview</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                  "{email.snippet}"
                </p>
                <p className="text-xs text-slate-400">
                  Full message body was not returned by Gmail for this message.
                </p>
              </div>
            ) : (
              /* Completely Empty Notice */
              <div className="py-12 text-center text-slate-400 space-y-1">
                <Mail className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No message body found</p>
                <p className="text-xs">This email contains no text or HTML payload.</p>
              </div>
            )}
          </div>

          {/* ── Audit Footnote (Message & Thread IDs) ───────────────── */}
          {(email.gmail_message_id || email.thread_id) && (
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                {email.gmail_message_id && (
                  <span>
                    Gmail ID: <code className="text-slate-600 font-mono bg-slate-100 px-1 py-0.5 rounded">{email.gmail_message_id}</code>
                  </span>
                )}
                {email.thread_id && (
                  <span>
                    Thread ID: <code className="text-slate-600 font-mono bg-slate-100 px-1 py-0.5 rounded">{email.thread_id}</code>
                  </span>
                )}
              </div>
              <span>Mail Pilot Automation</span>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
