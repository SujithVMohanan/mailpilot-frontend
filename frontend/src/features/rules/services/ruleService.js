/**
 * ruleService.js — Rules API service.
 *
 * All endpoints match apps/rule/views.py
 */

import client from "../../../api/client";

/** GET /api/rules/ */
export async function fetchRules(params = {}) {
  const response = await client.get("/rules/", { params });
  return response.data?.data ?? response.data;
}

/** GET /api/rules/<id>/ */
export async function fetchRuleDetail(id) {
  const response = await client.get(`/rules/${id}/`);
  return response.data?.data ?? response.data;
}

/** POST /api/rules/ */
export async function createRule(payload) {
  const response = await client.post("/rules/", payload);
  return response.data?.data ?? response.data;
}

/** PUT /api/rules/<id>/ */
export async function updateRule(id, payload) {
  const response = await client.put(`/rules/${id}/`, payload);
  return response.data?.data ?? response.data;
}

/** DELETE /api/rules/<id>/ */
export async function deleteRule(id) {
  const response = await client.delete(`/rules/${id}/`);
  return response.data?.data ?? response.data;
}

/** POST /api/rules/<id>/toggle/ */
export async function toggleRule(id) {
  const response = await client.post(`/rules/${id}/toggle/`);
  return response.data?.data ?? response.data;
}

/** POST /api/rules/<id>/execute/ */
export async function executeRule(id) {
  const response = await client.post(`/rules/${id}/execute/`);
  return response.data?.data ?? response.data;
}

/** POST /api/rules/execute-all/ */
export async function executeAllRules() {
  const response = await client.post("/rules/execute-all/");
  return response.data?.data ?? response.data;
}
