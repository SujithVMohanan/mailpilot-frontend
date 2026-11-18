/**
 * OAuthCallback — /oauth/callback
 *
 * Google redirects the user here after granting Gmail access.
 * URL looks like: /oauth/callback?code=xxx&state=yyy
 *
 * What this page does:
 *   1. Reads `code` and `state` from the URL query string.
 *   2. POSTs them to POST /api/mail/oauth/callback/ to exchange for Gmail tokens.
 *   3. On success → redirects to /dashboard with a success message.
 *   4. On failure → shows an error message with a "Try again" link.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { handleOAuthCallback } from "../services/dashboardService";

export default function OAuthCallback() {
  const [searchParams]  = useSearchParams();
  const navigate         = useNavigate();
  const calledRef        = useRef(false); // prevent double call in React StrictMode

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code  = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      setStatus("error");
      setErrorMsg("No authorization code received from Google. Please try again.");
      return;
    }

    handleOAuthCallback(code, state)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 1500);
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to connect Gmail. Please try again.";
        setStatus("error");
        setErrorMsg(msg);
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Connecting Gmail…</h2>
            <p className="text-sm text-gray-500 mt-1">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Gmail connected!</h2>
            <p className="text-sm text-gray-500 mt-1">Redirecting to dashboard…</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-800">Connection failed</h2>
            <p className="text-sm text-red-600 mt-1">{errorMsg}</p>
            <Link
              to="/dashboard"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
