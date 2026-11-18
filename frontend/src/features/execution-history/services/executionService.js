/**
 * executionService.js — Execution History API service.
 *
 * Endpoint: GET /api/rules/executions/
 */

import client from "../../../api/client";

/**
 * Fetch paginated rule execution logs.
 * @param {Object} params — { rule, page, limit }
 */
export async function fetchExecutions(params = {}) {
  const response = await client.get("/rules/executions/", { params });
  return response.data?.data ?? response.data;
}
