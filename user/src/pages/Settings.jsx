import React, { useState } from "react";
import { Save, Settings as SettingsIcon, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
export default function Settings() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await api("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      setUser(result.user);
      setMessage("Profile settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <MainLayout>
      <main className="page settings-page">
        <div className="page-heading">
          <div>
            <div className="section-kicker">PREFERENCES</div>
            <h1>Settings</h1>
            <p>Update the details associated with your account.</p>
          </div>
          <SettingsIcon size={28} />
        </div>
        <form className="panel settings-form" onSubmit={save}>
          <h2>Profile settings</h2>
          <label>
            Full name
            <input
              required
              minLength="2"
              maxLength="80"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Email address
            <div className="readonly-field">
              <Mail size={15} />
              {user.email}
            </div>
          </label>
          <p className="muted">
            Email cannot be changed here. Keep your password private and never
            share payment details.
          </p>
          {error && <div className="error-box">{error}</div>}
          {message && <div className="success-box">{message}</div>}
          <button className="btn primary" disabled={busy}>
            <Save size={16} />
            {busy ? "Saving…" : "Save settings"}
          </button>
        </form>
      </main>
    </MainLayout>
  );
}
