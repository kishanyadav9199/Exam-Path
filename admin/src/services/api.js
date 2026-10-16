const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/+$/,
  "",
);

const TOKEN_KEY = "exampath_access_token";

export async function api(path, options = {}) {
  const normalizedPath =
    path === "/api" || path.startsWith("/api/")
      ? path
      : `/api${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = sessionStorage.getItem(TOKEN_KEY);

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
    error.isNetworkError = true;
    throw error;
  }

  const data =
    response.status === 204 ? null : await response.json().catch(() => ({}));

  // Save the token returned by login/register.
  if (response.ok && data?.token) {
    sessionStorage.setItem(TOKEN_KEY, data.token);
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  if (normalizedPath.endsWith("/auth/logout")) {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  return data;
}

export { API };
