/**
 * dashboardService.js — Dashboard API calls.
 */

import client from "../../../api/client";

/** GET /api/mail/stats/ */
export async function fetchDashboardStats() {
  const { data } = await client.get("/mail/stats/");
  return data;
}

/** GET /api/mail/oauth/initiate/ — returns { auth_url } */
export async function initiateGmailOAuth() {
  const { data } = await client.get("/mail/oauth/initiate/");
  return data; // { auth_url: "https://accounts.google.com/..." }
}

/** POST /api/mail/oauth/callback/ — exchanges the Google code for tokens */
export async function handleOAuthCallback(code, state) {
  const { data } = await client.post("/mail/oauth/callback/", { code, state });
  return data;
}

/** POST /api/mail/disconnect/ */
export async function disconnectGmail() {
  const { data } = await client.post("/mail/disconnect/");
  return data;
}

/** POST /api/mail/sync/ */
export async function syncEmails() {
  const { data } = await client.post("/mail/sync/");
  return data;
}
