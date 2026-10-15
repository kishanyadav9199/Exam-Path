const API = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/+$/,
  "",
);

export async function api(path, options = {}) {
  const normalizedPath =
    path === "/api" || path.startsWith("/api/")
      ? path
      : `/api${path.startsWith("/") ? path : `/${path}`}`;

  let response;

  try {
    response = await fetch(`${API}${normalizedPath}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (cause) {
    const error = new Error(
      `Cannot connect to ExamPath server (${API}). Check backend status and CORS settings.`,
    );

    error.cause = cause;
    error.isNetworkError = true;
    throw error;
  }

  const data =
    response.status === 204 ? null : await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed (${response.status})`,
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

export { API };
