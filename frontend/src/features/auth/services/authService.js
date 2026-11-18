/**
 * authService.js — Auth API calls.
 *
 * IMPORTANT: The backend wraps all responses in an envelope:
 *   { status, status_code, message, data: { ... }, errors }
 *
 * So the actual payload is always at response.data.data
 */

import client from "../../../api/client";

/** POST /api/users/login/ → returns { access, refresh, user } */
export async function loginUser(email, password) {
  const response = await client.post("/users/login/", { email, password });
  return response.data.data; // unwrap envelope → { access, refresh, user }
}

/** POST /api/users/register/ → returns { access, refresh, user } */
export async function registerUser(email, password, confirm_password) {
  const response = await client.post("/users/register/", {
    email,
    password,
    confirm_password,
  });
  return response.data.data; // unwrap envelope → { access, refresh, user }
}

/** POST /api/users/logout/ */
export async function logoutUser(refresh) {
  await client.post("/users/logout/", { refresh });
}
