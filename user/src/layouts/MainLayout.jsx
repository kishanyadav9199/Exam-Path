import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  LogOut,
  Menu,
  X,
  UserRound,
  ShoppingBag,
  Settings,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const [mobile, setMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const signOut = async () => {
    await logout();
    setProfileOpen(false);
    navigate("/login", { replace: true });
  };
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <BookOpen size={20} />
          </span>{" "}
          Exam<span>Path</span>
        </Link>
        <button
          className="mobile-menu"
          onClick={() => setMobile(!mobile)}
          aria-label="Toggle navigation"
        >
          {mobile ? <X /> : <Menu />}
        </button>
        <nav className={mobile ? "nav open" : "nav"}>
          {user && <Link to="/dashboard">Test Series</Link>}
          {user && <Link to="/purchases">My Purchases</Link>}
          {user ? (
            <div className="profile-menu-wrap">
              <button
                className="profile-menu-trigger"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
              >
                <UserRound size={16} />
                <span>Profile</span>
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-user">
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                  </div>
                  <Link to="/profile" onClick={() => setProfileOpen(false)}>
                    <UserRound size={15} /> My profile
                  </Link>
                  <Link to="/purchases" onClick={() => setProfileOpen(false)}>
                    <ShoppingBag size={15} /> My purchases
                  </Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}>
                    <Settings size={15} /> Settings
                  </Link>
                  <button onClick={signOut}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="nav-login" to="/login">
              Login
            </Link>
          )}
        </nav>
      </header>
      {children}
      <footer>
        © {new Date().getFullYear()} ExamPath <span>•</span> Practice with
        purpose.
      </footer>
    </div>
  );
}
