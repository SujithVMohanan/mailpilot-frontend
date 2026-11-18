/**
 * Complete Backend API Reference (source-verified)
 * =================================================
 *
 * ENVELOPE — every response:
 *   { status, status_code, message, data: <payload>, errors: {} }
 *   → actual payload is always at response.data.data
 *
 * PAGINATION — paginated responses wrap data as:
 *   response.data.data = {
 *     links: { next, previous },
 *     count: <number>,
 *     results: [...]
 *   }
 *   params: page (number), limit (number, default 20, max 100)
 *
 * ── AUTH (/api/users/) ────────────────────────────────────────────────────────
 * POST /api/users/register/  { email, full_name?, password, confirm_password }
 * POST /api/users/login/     { email, password }
 *   Both return data: { token_type, access, refresh, user: { uid, full_name, email, is_active, date_joined } }
 *
 * POST /api/users/refresh/   { refresh }
 *   Returns data: { token_type, access, refresh }
 *
 * POST /api/users/logout/    { refresh }   (Bearer required)
 * GET  /api/users/me/        → data: { uid, full_name, email, is_active, date_joined }
 *
 * ── GMAIL (/api/mail/) ────────────────────────────────────────────────────────
 * GET  /api/mail/oauth/initiate/   → data: { authorization_url }   ← NOT auth_url
 * POST /api/mail/oauth/callback/   { code, state }
 * POST /api/mail/disconnect/
 * GET  /api/mail/labels/           → data: array of label objects
 * POST /api/mail/sync/             { max_results?, page_token? }
 *   Returns data: { synced_count, new_count, updated_count, failed_count, next_page_token }
 *
 * GET /api/mail/stats/
 *   Returns data: {
 *     account: { connected: bool, email_address, last_synced_at },
 *     total_emails, read_emails, unread_emails,
 *     total_rules, active_rules,
 *     recent_executions: [...]
 *   }
 *
 * GET /api/mail/   params: search, is_read (true/false/1/0), ordering, page, limit
 *   List item fields: id, gmail_message_id, sender, recipient, subject,
 *                     snippet, received_datetime, is_read, label_ids
 *
 * GET /api/mail/<id>/
 *   Detail fields: all list fields + thread_id, body_text, body_html, created_at
 *
 * ── RULES (/api/rules/) ───────────────────────────────────────────────────────
 * GET/POST /api/rules/
 * GET/PUT/PATCH/DELETE /api/rules/<id>/
 * POST /api/rules/<id>/toggle/
 * POST /api/rules/<id>/execute/
 * POST /api/rules/execute-all/
 * GET  /api/rules/executions/   params: rule (id), page, limit
 *
 * Rule object: { id, name, description, is_active, group_predicate (ALL|ANY),
 *                conditions: [...], actions: [...], created_at, updated_at }
 *
 * Condition: { id, field (FROM|TO|SUBJECT|BODY|RECEIVED_DATE),
 *              predicate (CONTAINS|NOT_CONTAINS|EQUALS|NOT_EQUALS|LESS_THAN|GREATER_THAN),
 *              value, unit (DAYS|MONTHS|"") }
 *
 * Action: { id, action_type (MARK_AS_READ|MARK_AS_UNREAD|MOVE_MESSAGE),
 *            destination_label_id, destination_label_name }
 *
 * Execution: { id, rule, rule_name_snapshot, started_at, completed_at,
 *              total_evaluated, total_matched, actions_succeeded, actions_failed,
 *              status, logs: [...] }
 *
 * ExecutionLog: { id, email, action_type, status, error_message, created_at }
 */
