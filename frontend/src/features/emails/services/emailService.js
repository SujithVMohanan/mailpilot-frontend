/**
 * emailService.js — Email API calls.
 *
 * Backend wraps all responses: { status, status_code, message, data: {...}, errors }
 * We defensively unwrap single or double-wrapped response payloads.
 */

import client from "../../../api/client";

/** GET /api/mail/ — paginated list */
export async function fetchEmails(params = {}) {
  const response = await client.get("/mail/", { params });
  return response.data?.data ?? response.data;
}

/** GET /api/mail/<id>/ */
export async function fetchEmailDetail(id) {
  const response = await client.get(`/mail/${id}/`);
  const raw = response.data;
  if (raw?.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    if (raw.data.data && typeof raw.data.data === "object") {
      return raw.data.data;
    }
    return raw.data;
  }
  return raw;
}

/** GET /api/mail/labels/ */
export async function fetchLabels() {
  const response = await client.get("/mail/labels/");
  const raw = response.data?.data ?? response.data;
  if (raw?.labels && Array.isArray(raw.labels)) {
    return raw.labels;
  }
  return raw;
}
