const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/+$/,
  "",
);

const TOKEN_KEY = "exampath_access_token";

export function saveAuthToken(token) {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Authentication token is missing.");
  }

  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export async function api(path, options = {}) {
  const normalizedPath = path.startsWith("/api/")
    ? path
    : `/api${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API}${normalizedPath}`, {
      ...options,
      credentials: "omit",
      headers,
    });
  } catch (cause) {
    const error = new Error(`Cannot connect to ExamPath server (${API}).`);
    error.cause = cause;
    throw error;
  }

  const data =
    response.status === 204 ? null : await response.json().catch(() => ({}));

  // Save token returned by login/register.
  if (response.ok && data?.token) {
    saveAuthToken(data.token);
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed (${response.status})`,
    );

    error.status = response.status;
    throw error;
  }

  if (normalizedPath.endsWith("/auth/logout")) {
    clearAuthToken();
  }

  return data;
}

export { API };
