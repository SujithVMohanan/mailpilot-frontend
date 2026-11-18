/**
 * emailService.js — Email API calls.
 *
 * Endpoints:
 *   GET /api/mail/          — paginated email list (search, label, page)
 *   GET /api/mail/<id>/     — single email detail
 *   GET /api/mail/labels/   — Gmail label list
 */

import client from "../../../api/client";

/**
 * Fetch paginated email list.
 * @param {Object} params — { search, label, page }
 */
export async function fetchEmails(params = {}) {
  const { data } = await client.get("/mail/", { params });
  return data; // { count, next, previous, results: [...] }
}

/** Fetch a single email by ID. */
export async function fetchEmailDetail(id) {
  const { data } = await client.get(`/mail/${id}/`);
  return data;
}

/** Fetch Gmail labels for the filter dropdown. */
export async function fetchLabels() {
  const { data } = await client.get("/mail/labels/");
  return data; // array of label objects or strings
}
