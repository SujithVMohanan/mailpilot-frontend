/**
 * EmailCard — Modern, interactive email card with inline expandable detail view.
 *
 * Designed to satisfy user requirement:
 *   "make it differnt UI it shwing like if clike detal its inside the card list card make it better UI"
 *
 * Features:
 *   - Clean SaaS card design with sender avatar, read status, snippet, and labels
 *   - Explicit "View Details" / "Collapse" toggle with rotating chevron
 *   - Expands inline directly inside the card list
 *   - Displays metadata grid: From, To, Date Received, Status, Gmail IDs
 *   - Dual view mode: Sandboxed HTML preview or Plain Text
 *   - Sanitized HTML to prevent script execution warnings
 *   - Copy Subject & Copy Body actions with feedback
 */

import React, { useState, useMemo } from "react";
import {
  Mail,
  User,
  Calendar,
  Tag,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";

/** Human-friendly date formatting */
function formatEmailDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Parses sender string into name and clean email address */
function parseSender(senderStr) {
  if (!senderStr) return { name: "Unknown", email: "" };
  const match = senderStr.match(/^"?([^"<]+)"?\s*(?:<([^>]+)>)?/);
  if (match) {
    const name = match[1]?.trim() || "";
    const email = match[2]?.trim() || "";
    return {
      name: name || email.split("@")[0] || senderStr,
      email: email || (name.includes("@") ? name : ""),
    };
  }
  return { name: senderStr.split("@")[0] || senderStr, email: senderStr };
}

/** Strips active scripts and inline event handlers from email HTML */
function sanitizeEmailHtml(rawHtml) {
  if (!rawHtml) return "";
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\s+on\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"');
}

/** Sandboxed HTML viewer inside the expanded card */
function HtmlEmailViewer({ html }) {
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

    if (/<!DOCTYPE|<html/i.test(cleanHtml)) {
      if (/<head[^>]*>/i.test(cleanHtml)) {
        return cleanHtml.replace(/<head[^>]*>/i, `$&${resetStyles}`);
      }
      return `${resetStyles}${cleanHtml}`;
    }

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
      className="w-full min-h-[300px] h-[48vh] rounded-xl border border-slate-200/80 bg-white shadow-2xs"
      sandbox="allow-popups allow-popups-to-escape-sandbox"
    />
  );
}

export default function EmailCard({
  email,
  isExpanded,
  onToggleExpand,
  detailData,
  loadingDetail,
  detailError,
  onRetryDetail,
}) {
  const isUnread = !email.is_read;
  const { name: senderName, email: senderEmail } = parseSender(email.sender);
  const senderInitial = senderName[0]?.toUpperCase() || "M";

  // Active merged data (detailData has full body_html, body_text)
  const fullEmail = detailData ? { ...email, ...detailData } : email;

  const [viewMode, setViewMode] = useState("html"); // "html" | "text"
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  function handleCopySubject(e) {
    e.stopPropagation();
    if (fullEmail.subject) {
      navigator.clipboard.writeText(fullEmail.subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 1500);
    }
  }

  function handleCopyBody(e) {
    e.stopPropagation();
    const content = fullEmail.body_text || fullEmail.snippet || fullEmail.body_html || "";
    if (content) {
      navigator.clipboard.writeText(content);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 1500);
    }
  }

  const hasHtml = Boolean(fullEmail.body_html && fullEmail.body_html.trim());
  const hasText = Boolean(fullEmail.body_text && fullEmail.body_text.trim());
  const hasSnippet = Boolean(fullEmail.snippet && fullEmail.snippet.trim());

  return (
    <div
      className={`transition-all duration-150 overflow-hidden ${
        isExpanded
          ? "border-l-4 border-l-blue-600 border border-blue-300 ring-2 ring-blue-500/10 bg-white shadow-sm rounded-xl"
          : isUnread
          ? "border-l-4 border-l-blue-500 border border-blue-100 bg-blue-50/60 hover:bg-blue-50 hover:border-blue-200 rounded-lg"
          : "border-l-4 border-l-slate-200 border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 rounded-lg"
      }`}
    >
      {/* ── COMPACT ROW (Always Visible & Clickable) ─────────────────── */}
      <div
        onClick={onToggleExpand}
        className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
      >
        {/* Unread / Read dot */}
        <div className="flex-shrink-0 w-2 flex justify-center">
          {isUnread ? (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0" title="Unread" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" title="Read" />
          )}
        </div>

        {/* Sender Initial Avatar — small */}
        <div
          className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center flex-shrink-0 font-bold ${
            isUnread
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          {senderInitial}
        </div>

        {/* Sender name — fixed narrow width */}
        <span
          className={`flex-shrink-0 w-32 truncate text-xs ${
            isUnread ? "font-bold text-slate-900" : "font-medium text-slate-600"
          }`}
          title={senderName}
        >
          {senderName}
        </span>

        {/* Subject + snippet — takes remaining space */}
        <span className="flex-1 min-w-0 text-xs truncate">
          <span
            className={isUnread ? "font-semibold text-slate-900" : "font-normal text-slate-700"}
          >
            {email.subject || "(No Subject)"}
          </span>
          {email.snippet && (
            <span className="text-slate-400 ml-2">— {email.snippet}</span>
          )}
        </span>

        {/* Labels (compact, hidden on small screens) */}
        {email.label_ids?.length > 0 && (
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {email.label_ids.slice(0, 2).map((lbl) => (
              <span
                key={lbl}
                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  lbl === "INBOX"
                    ? "bg-blue-100 text-blue-700"
                    : lbl === "UNREAD"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {lbl}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <span
          className={`flex-shrink-0 text-[11px] whitespace-nowrap ${
            isUnread ? "font-semibold text-slate-700" : "text-slate-400"
          }`}
        >
          {formatEmailDate(email.received_datetime)}
        </span>

        {/* Expand button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
            isExpanded
              ? "bg-blue-600 text-white"
              : isUnread
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* ── EXPANDED DETAIL VIEW (Inside Card List Card) ─────────────── */}
      {isExpanded && (
        <div className="border-t border-slate-200/90 bg-slate-50/50 p-4 sm:p-6 space-y-5 animate-slide-down">
          {/* Metadata Grid inside Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-subtle space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* From */}
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Sender
                </p>
                <p className="font-semibold text-slate-900 truncate" title={email.sender}>
                  {email.sender || "—"}
                </p>
              </div>

              {/* To */}
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Recipient (To)
                </p>
                <p className="font-medium text-slate-800 truncate" title={email.recipient}>
                  {email.recipient || "—"}
                </p>
              </div>

              {/* Received Date */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Received Time
                </p>
                <p className="font-medium text-slate-700">
                  {formatEmailDate(email.received_datetime)}
                </p>
              </div>

              {/* Message ID */}
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Gmail Message ID
                </p>
                <p className="font-mono text-xs text-slate-600 truncate bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  {email.gmail_message_id || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* HTML / Plain Text Toggle */}
              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("html")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    viewMode === "html"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  HTML Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("text")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    viewMode === "text"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Plain Text
                </button>
              </div>

              {/* Copy Subject */}
              <Button
                variant="ghost"
                size="xs"
                icon={copiedSubject ? Check : Copy}
                onClick={handleCopySubject}
                className="text-slate-600 hover:text-slate-900"
              >
                {copiedSubject ? "Copied" : "Copy Subject"}
              </Button>

              {/* Copy Body */}
              <Button
                variant="ghost"
                size="xs"
                icon={copiedBody ? Check : Copy}
                onClick={handleCopyBody}
                className="text-slate-600 hover:text-slate-900"
              >
                {copiedBody ? "Copied Body" : "Copy Body"}
              </Button>
            </div>

            {/* Collapse action */}
            <Button
              variant="outline"
              size="xs"
              icon={ChevronUp}
              onClick={onToggleExpand}
            >
              Close Details
            </Button>
          </div>

          {/* ── Email Message Body Container ────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-card min-h-[220px] relative">
            {/* Loading detailed body */}
            {loadingDetail && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-pulse z-10 shadow-xs">
                <Spinner size="xs" />
                <span>Fetching complete message body…</span>
              </div>
            )}

            {/* If Detail Fetch Failed */}
            {detailError ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                  <span>Could not fetch full body: {detailError}. Showing snippet.</span>
                </div>
                {onRetryDetail && (
                  <Button variant="outline" size="xs" onClick={onRetryDetail}>
                    Retry
                  </Button>
                )}
              </div>
            ) : null}

            {/* Body Content View */}
            {viewMode === "html" && hasHtml ? (
              <HtmlEmailViewer html={fullEmail.body_html} />
            ) : viewMode === "text" && hasText ? (
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed font-normal overflow-x-auto max-h-[50vh] p-2">
                {fullEmail.body_text}
              </pre>
            ) : hasHtml ? (
              <HtmlEmailViewer html={fullEmail.body_html} />
            ) : hasText ? (
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed font-normal overflow-x-auto max-h-[50vh] p-2">
                {fullEmail.body_text}
              </pre>
            ) : hasSnippet ? (
              <div className="space-y-3 py-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Message Snippet Preview</span>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed italic bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                  "{fullEmail.snippet}"
                </p>
                <p className="text-xs text-slate-400">
                  Full message body was not provided by Gmail for this message summary.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-1">
                <Mail className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No message body found</p>
                <p className="text-xs">This email contains no text or HTML payload.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
