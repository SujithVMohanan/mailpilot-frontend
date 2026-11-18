/**
 * emailService.js — Email API calls.
 *
 * Backend wraps all responses: { status, status_code, message, data: {...}, errors }
 * We always unwrap: response.data.data
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
  return response.data?.data ?? response.data;
}

/** GET /api/mail/labels/ */
export async function fetchLabels() {
  const response = await client.get("/mail/labels/");
  return response.data?.data ?? response.data;
}
