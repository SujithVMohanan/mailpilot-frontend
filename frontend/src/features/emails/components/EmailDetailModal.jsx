/**
 * EmailDetailModal — shows full email content inside a Modal.
 *
 * Props:
 *   emailId   — ID to fetch; null = nothing shown
 *   onClose   — fn
 */

import { useEffect, useState } from "react";
import { Mail, User, Calendar, Tag } from "lucide-react";
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
  const [email,   setEmail]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!emailId) return;
    setLoading(true);
    setError("");
    setEmail(null);
    fetchEmailDetail(emailId)
      .then(setEmail)
      .catch(() => setError("Failed to load email details."))
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
      {error   && <p className="text-sm text-red-600">{error}</p>}

      {email && (
        <div className="space-y-4 text-sm">
          {/* Meta row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">From</p>
                <p className="text-gray-800 font-medium">{email.sender || email.from || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">To</p>
                <p className="text-gray-800">{email.recipient || email.to || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                <p className="text-gray-800">{formatDate(email.received_at || email.date)}</p>
              </div>
            </div>

            {/* Labels */}
            {email.labels?.length > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Labels</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {email.labels.map((lbl) => (
                      <Badge key={lbl} label={lbl} variant="info" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Subject */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Subject</p>
            <p className="font-semibold text-gray-800 text-base">{email.subject || "(no subject)"}</p>
          </div>

          {/* Body */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Body</p>
            {email.body ? (
              /* Render as HTML if the backend sends HTML, else plain text */
              email.body.includes("<") ? (
                <div
                  className="prose prose-sm max-w-none text-gray-700 border border-gray-100 rounded-lg p-4 bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: email.body }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-gray-700 border border-gray-100 rounded-lg p-4 bg-gray-50">
                  {email.body}
                </pre>
              )
            ) : (
              <p className="text-gray-400 italic">No body content.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
