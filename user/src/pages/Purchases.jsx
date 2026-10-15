import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, CheckCircle2, Clock3, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
export default function Purchases() {
  const [purchases, setPurchases] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/purchases")
      .then(setPurchases)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <MainLayout>
      <main className="page">
        <div className="page-heading">
          <div>
            <div className="section-kicker">YOUR ACCOUNT</div>
            <h1>My purchases</h1>
            <p>Test series you have paid for and unlocked.</p>
          </div>
          <ShoppingBag size={28} />
        </div>
        {error && <div className="error-box">{error}</div>}
        {loading ? (
          <div className="empty-state">Loading purchases…</div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={30} />
            <h3>No purchases yet</h3>
            <p>
              Buy a test series to unlock its tests. Other series will remain
              locked.
            </p>
            <Link className="btn primary" to="/dashboard">
              Browse test series <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="exam-grid">
            {purchases.map((p) => (
              <article
                className="exam-card-list series-card is-purchased"
                key={p.id}
              >
                <div className="series-card-top">
                  <span className="tag">{p.exam.category}</span>
                  <span className="unlock-badge">
                    <CheckCircle2 size={14} /> UNLOCKED
                  </span>
                </div>
                <h3>{p.exam.title}</h3>
                <p>{p.exam.description}</p>
                <div className="series-meta">
                  <b>₹{Math.round(p.amount / 100).toLocaleString("en-IN")}</b>
                  <span>
                    <Clock3 size={14} /> Until{" "}
                    {new Date(p.accessUntil).toLocaleDateString()}
                  </span>
                </div>
                <Link className="btn primary full" to={`/exams/${p.exam._id}`}>
                  Open test series <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  );
}
