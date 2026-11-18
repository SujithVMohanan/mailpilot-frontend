/**
 * EmailDetailModal — shows full email content inside a Modal.
 *
 * Backend EmailDetailSchema fields:
 *   id, gmail_message_id, thread_id, sender, recipient, subject,
 *   snippet, body_text, body_html, received_datetime, is_read, label_ids, created_at
 */

import { useEffect, useState } from "react";
import { Mail, User, Calendar, Tag, CheckCheck, Clock } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Spinner from "../../../components/ui/Spinner";
import Badge from "../../../components/ui/Badge";
import { fetchEmailDetail } from "../services/emailService";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EmailDetailModal({ emailId, onClose }) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!emailId) return;
    setLoading(true);
    setError("");
    setEmail(null);

    fetchEmailDetail(emailId)
      .then((data) => {
        // Safe unwrap if needed
        setEmail(data?.data || data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.response?.data?.detail || "Failed to load email details.");
      })
      .finally(() => setLoading(false));
  }, [emailId]);

  return (
    <Modal
      isOpen={!!emailId}
      onClose={onClose}
      title={email?.subject || "Email Detail"}
      size="xl"
    >
      {loading && <Spinner />}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {email && (
        <div className="space-y-5 text-sm">
          {/* Metadata header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-start gap-2.5">
              <User className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</p>
                <p className="text-gray-900 font-medium break-all">{email.sender || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</p>
                <p className="text-gray-900 break-all">{email.recipient || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Received</p>
                <p className="text-gray-800">{formatDate(email.received_datetime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCheck className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                <div className="mt-0.5">
                  <Badge
                    label={email.is_read ? "Read" : "Unread"}
                    variant={email.is_read ? "default" : "warning"}
                  />
                </div>
              </div>
            </div>

            {/* Labels */}
            {email.label_ids?.length > 0 && (
              <div className="sm:col-span-2 flex items-start gap-2.5 pt-1">
                <Tag className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Labels</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {email.label_ids.map((lbl) => (
                      <Badge key={lbl} label={lbl} variant="info" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{email.subject || "(No Subject)"}</h3>
            {email.gmail_message_id && (
              <p className="text-xs text-gray-400 mt-0.5">ID: {email.gmail_message_id}</p>
            )}
          </div>

          {/* Body */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white overflow-hidden">
            {email.body_html ? (
              <div
                className="prose prose-sm max-w-none text-gray-800 overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: email.body_html }}
              />
            ) : email.body_text ? (
              <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm">
                {email.body_text}
              </pre>
            ) : email.snippet ? (
              <p className="text-gray-700 italic">{email.snippet}</p>
            ) : (
              <p className="text-gray-400 italic">No content available for this message.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
