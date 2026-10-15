import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
export default function NotFound() {
  return (
    <MainLayout>
      <main className="page empty-state">
        <h1>Page not found</h1>
        <Link to="/dashboard" className="btn primary">
          Go to dashboard
        </Link>
      </main>
    </MainLayout>
  );
}
