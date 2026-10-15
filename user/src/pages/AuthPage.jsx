import React, { useState } from "react";
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
export default function AuthPage({ mode }) {
  const { user, loading, setUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (loading)
    return (
      <MainLayout>
        <div className="loading">Loading ExamPath…</div>
      </MainLayout>
    );
  if (user) return <Navigate to="/dashboard" replace />;
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setUser(r.user);
      nav("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <MainLayout>
      <div className="auth-wrap">
        <div className="auth-side">
          <div className="auth-symbol">
            <BookOpen size={26} />
          </div>
          <div className="section-kicker">WELCOME TO EXAMPATH</div>
          <h2>
            A little practice.
            <br />
            <em>A lot more confidence.</em>
          </h2>
          <p>
            Build a routine, measure your progress and walk into your next exam
            prepared.
          </p>
          <div className="auth-benefit">
            <CheckCircle2 /> Your progress, in one place
          </div>
          <div className="auth-benefit">
            <CheckCircle2 /> Secure personal dashboard
          </div>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <div className="section-kicker">
            {mode === "login" ? "GOOD TO SEE YOU AGAIN" : "START YOUR JOURNEY"}
          </div>
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="muted">
            {mode === "login"
              ? "Enter your details to continue."
              : "Sign up to explore exam-wise practice."}
          </p>
          {mode === "register" && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={update}
                required
                minLength="2"
                maxLength="80"
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={update}
              required
              minLength="8"
              maxLength="128"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder="At least 8 characters"
            />
          </label>
          {error && <div className="error-box">{error}</div>}
          <button className="btn primary full" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}{" "}
            <ArrowRight size={17} />
          </button>
          <p className="auth-switch">
            {mode === "login"
              ? "New to ExamPath? "
              : "Already have an account? "}
            <Link to={mode === "login" ? "/register" : "/login"}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </form>
      </div>
    </MainLayout>
  );
}
