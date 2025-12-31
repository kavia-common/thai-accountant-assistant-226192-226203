/**
 * Central API client for the Accountant Assistant frontend.
 *
 * Uses REACT_APP_API_BASE_URL (recommended) with fallback to http://localhost:3001 to keep
 * ports consistent with the multi-container preview environment.
 */

const DEFAULT_BASE_URL = "http://localhost:3001";

/**
 * PUBLIC_INTERFACE
 * Returns configured API base URL.
 */
export function getApiBaseUrl() {
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

/**
 * PUBLIC_INTERFACE
 * Builds a full URL from a path.
 * @param {string} path - API path starting with '/' (recommended).
 */
export function apiUrl(path) {
  const base = getApiBaseUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function readJsonSafe(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  const text = await res.text();
  return { message: text };
}

async function request(path, options = {}) {
  const url = apiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      // Important for CORS: we keep it simple and allow backend to set CORS headers.
    },
  });

  if (!res.ok) {
    const payload = await readJsonSafe(res);
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed (${res.status} ${res.statusText})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return readJsonSafe(res);
}

/**
 * PUBLIC_INTERFACE
 * JSON request helper.
 */
export async function apiJson(path, { method = "GET", body, headers } = {}) {
  return request(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUBLIC_INTERFACE
 * Multipart request helper (for file uploads).
 */
export async function apiMultipart(path, { method = "POST", formData, headers } = {}) {
  return request(path, {
    method,
    headers: {
      ...(headers || {}),
      // Let browser set multipart boundary automatically.
    },
    body: formData,
  });
}
