/**
 * authService.js — Auth API calls.
 *
 * Thin wrapper around the Axios client for auth endpoints.
 * Views call these functions; they never call client directly.
 */

import client from "../../../api/client";

/** POST /api/users/login/ */
export async function loginUser(email, password) {
  const { data } = await client.post("/users/login/", { email, password });
  return data; // { access, refresh }
}

/** POST /api/users/register/ */
export async function registerUser(email, password, confirm_password) {
  const { data } = await client.post("/users/register/", {
    email,
    password,
    confirm_password,          // ← backend expects this exact field name
  });
  return data;
}

/** POST /api/users/logout/ */
export async function logoutUser(refresh) {
  await client.post("/users/logout/", { refresh });
}
