import React, { useState } from "react";
import { BookOpen, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, saveAuthToken } from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function AuthPage({ mode = "login" }) {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  const update = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;

    setError("");
    setBusy(true);

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      if (!isLogin) {
        payload.name = form.name.trim();
      }

      const response = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response?.token || !response?.user) {
        throw new Error(
          "Server did not return both user and token. Check the backend authentication route.",
        );
      }

      // Save JWT before navigating to the dashboard.
      saveAuthToken(response.token);

      // Update the React authentication state.
      setUser(response.user);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading">Loading ExamPath…</div>
      </MainLayout>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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
            <CheckCircle2 />
            Your progress, in one place
          </div>

          <div className="auth-benefit">
            <CheckCircle2 />
            Secure personal dashboard
          </div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="section-kicker">
            {isLogin ? "GOOD TO SEE YOU AGAIN" : "START YOUR JOURNEY"}
          </div>

          <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>

          <p className="muted">
            {isLogin
              ? "Enter your details to continue."
              : "Sign up to explore exam-wise practice."}
          </p>

          {!isLogin && (
            <label>
              Full name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={update}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
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
              maxLength={254}
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
              minLength={8}
              maxLength={128}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="At least 8 characters"
            />
          </label>

          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn primary full" disabled={busy}>
            {busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}

            {!busy && <ArrowRight size={17} />}
          </button>

          <p className="auth-switch">
            {isLogin ? "New to ExamPath? " : "Already have an account? "}

            <Link to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </form>
      </div>
    </MainLayout>
  );
}
