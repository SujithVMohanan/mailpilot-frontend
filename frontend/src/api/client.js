/**
 * Axios HTTP client with JWT authentication.
 *
 * - Automatically attaches `Authorization: Bearer <access_token>` to every request.
 * - Automatically refreshes the access token when a 401 is received,
 *   then retries the original request once.
 * - If the refresh also fails (e.g. refresh token expired) it logs the user out
 *   by clearing localStorage and redirecting to /login.
 */

import axios from "axios";

// ─── Base Instance ────────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. "http://localhost:8000/api"
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the access token (if present) before every outgoing request.
client.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers["Authorization"] = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401, attempt a silent token refresh; on success retry the original request.
let isRefreshing = false; // prevent multiple simultaneous refresh calls
let failedQueue = []; // queue requests that arrive while refreshing

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

function forceLogout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
}

client.interceptors.response.use(
  // Pass through successful responses unchanged.
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors that haven't already been retried.
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refresh = localStorage.getItem("refresh");

      // No refresh token stored → log out immediately.
      if (!refresh) {
        forceLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Another request is already refreshing; queue this one.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/refresh/`,
          { refresh }
        );

        // Backend wraps response: { status, data: { access, refresh }, ... }
        const newAccess = response.data?.data?.access || response.data?.access;
        localStorage.setItem("access", newAccess);

        // Update the default header for future requests.
        client.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;

        processQueue(null, newAccess);

        // Retry the original failed request with the new token.
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
