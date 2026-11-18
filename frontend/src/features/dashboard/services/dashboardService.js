/**
 * dashboardService.js
 *
 * Verified against backend source (apps/google_services/views.py + services/email_services.py)
 *
 * GET /api/mail/oauth/initiate/ → data: { authorization_url }   ← key is authorization_url
 * GET /api/mail/stats/          → data: {
 *     account: { connected, email_address, last_synced_at },
 *     total_emails, read_emails, unread_emails,
 *     total_rules, active_rules,
 *     recent_executions: [...]
 * }
 * POST /api/mail/sync/          → data: { synced_count, new_count, updated_count, failed_count, next_page_token }
 */

import client from "../../../api/client";

/** GET /api/mail/stats/ */
export async function fetchDashboardStats() {
  const response = await client.get("/mail/stats/");
  return response.data.data; // { account, total_emails, read_emails, unread_emails, total_rules, active_rules, recent_executions }
}

/**
 * GET /api/mail/oauth/initiate/
 * Returns { authorization_url } — redirect user to this URL.
 */
export async function initiateGmailOAuth() {
  const response = await client.get("/mail/oauth/initiate/");
  return response.data.data; // { authorization_url }
}

/**
 * POST /api/mail/oauth/callback/
 * Body: { code, state }
 */
export async function handleOAuthCallback(code, state) {
  const response = await client.post("/mail/oauth/callback/", { code, state });
  return response.data.data;
}

/** POST /api/mail/disconnect/ */
export async function disconnectGmail() {
  const response = await client.post("/mail/disconnect/");
  return response.data.data;
}

/**
 * POST /api/mail/sync/
 * Optional body: { max_results (1-100), page_token }
 * Returns: { synced_count, new_count, updated_count, failed_count, next_page_token }
 */
export async function syncEmails(maxResults = 50) {
  const response = await client.post("/mail/sync/", { max_results: maxResults });
  return response.data.data;
}
