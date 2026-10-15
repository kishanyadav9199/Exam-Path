import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, LogOut, ShieldCheck } from "lucide-react";
export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/admin" className="brand">
          <span className="brand-icon">
            <BookOpen size={20} />
          </span>{" "}
          Exam<span>Path</span> <small>ADMIN</small>
        </Link>
        <nav className="nav">
          <span className="nav-user">
            <ShieldCheck size={15} /> {user?.name || "Administrator"}
          </span>
          <button className="nav-logout" onClick={logout}>
            <LogOut size={15} /> Logout
          </button>
          <a className="nav-login" href="http://localhost:5173">
            Student site
          </a>
        </nav>
      </header>
      {children}
      <footer>
        © {new Date().getFullYear()} ExamPath Admin <span>•</span> Secure
        content management.
      </footer>
    </div>
  );
}
