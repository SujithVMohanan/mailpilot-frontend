/**
 * dashboardService.js — Dashboard API calls.
 *
 * Backend wraps all responses: { status, status_code, message, data: {...}, errors }
 * We always unwrap: response.data.data
 */

import client from "../../../api/client";

/** GET /api/mail/stats/ */
export async function fetchDashboardStats() {
  const response = await client.get("/mail/stats/");
  return response.data?.data ?? response.data;
}

/** GET /api/mail/oauth/initiate/ — returns { auth_url } */
export async function initiateGmailOAuth() {
  const response = await client.get("/mail/oauth/initiate/");
  return response.data?.data ?? response.data;
}

/** POST /api/mail/oauth/callback/ */
export async function handleOAuthCallback(code, state) {
  const response = await client.post("/mail/oauth/callback/", { code, state });
  return response.data?.data ?? response.data;
}

/** POST /api/mail/disconnect/ */
export async function disconnectGmail() {
  const response = await client.post("/mail/disconnect/");
  return response.data?.data ?? response.data;
}

/** POST /api/mail/sync/ */
export async function syncEmails() {
  const response = await client.post("/mail/sync/");
  return response.data?.data ?? response.data;
}
