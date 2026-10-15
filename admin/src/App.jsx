import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import Loading from "./components/Loading";
import AdminPage from "./pages/AdminPage";
import { BookOpen, ArrowRight, ShieldCheck } from "lucide-react";
function AdminLogin() {
  const { user, loading, setUser } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading) return <Loading />;
  if (user)
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/forbidden"} replace />
    );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (result.user?.role !== "admin") {
        await api("/auth/logout", { method: "POST" });
        throw new Error("This account does not have administrator access.");
      }
      setUser(result.user);
      nav("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-wrap">
      <section className="auth-side">
        <div className="auth-symbol">
          <ShieldCheck size={28} />
        </div>
        <div className="section-kicker">EXAMPATH ADMIN</div>
        <h2>
          Manage exams.
          <br />
          <em>Help learners succeed.</em>
        </h2>
        <p>
          Private workspace for exam creation, subjects and question management.
        </p>
      </section>
      <form className="auth-form" onSubmit={submit}>
        <div className="section-kicker">ADMINISTRATOR ACCESS</div>
        <h1>Admin sign in</h1>
        <p className="muted">Use an account with the admin role.</p>
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <div className="error-box">{error}</div>}
        <button className="btn primary full" disabled={busy}>
          {busy ? "Signing in…" : "Open admin workspace"}{" "}
          <ArrowRight size={17} />
        </button>
        <p className="auth-switch">
          <BookOpen size={15} /> Student site:{" "}
          <a href="http://localhost:5173">localhost:5173</a>
        </p>
      </form>
    </main>
  );
}
function ProtectedAdmin() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/forbidden" replace />;
  return <AdminPage />;
}
function Forbidden() {
  const { logout } = useAuth();
  return (
    <main className="page">
      <h1>Admin access required</h1>
      <p>This account is not an administrator.</p>
      <button className="btn primary" onClick={logout}>
        Log out
      </button>
      <p>
        <a href="http://localhost:5173">Go to student website</a>
      </p>
    </main>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdmin />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
