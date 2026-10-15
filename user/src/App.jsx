import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Loading from "./components/Loading";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ExamDetails from "./pages/ExamDetails";
import Pricing from "./pages/Pricing";
import TestPage from "./pages/TestPage";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Purchases from "./pages/Purchases";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin-portal" replace />;
  return children;
}
export default function App() {
  const { user, loading } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          user && !loading ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage mode="login" />
          )
        }
      />
      <Route
        path="/register"
        element={
          user && !loading ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage mode="register" />
          )
        }
      />
      <Route
        path="/admin-portal"
        element={
          <div className="page">
            <h1>Admin portal is separate</h1>
            <p>
              Open the Admin application at{" "}
              <a href="http://localhost:5174">localhost:5174</a>.
            </p>
          </div>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <Pricing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams/:examId"
        element={
          <ProtectedRoute>
            <ExamDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/:examId/:partId"
        element={
          <ProtectedRoute>
            <TestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:examId/:partId"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <Purchases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
