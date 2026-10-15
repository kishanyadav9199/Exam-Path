const API = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API}/api${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });
  } catch (cause) {
    const error = new Error(
      `Cannot connect to ExamPath server (${API}). Start the server with "cd server" then "npm run dev". Check server/.env, MongoDB connection, and that VITE_API_URL points to the correct API address. If using 127.0.0.1 in the browser, use the same host consistently or allow that origin in CLIENT_ORIGINS.`
    );
    error.cause = cause;
    error.isNetworkError = true;
    throw error;
  }

  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export { API };
