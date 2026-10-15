import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  LockKeyhole,
  ArrowRight,
  CheckCircle2,
  Train,
  GraduationCap,
  Landmark,
  ShieldCheck,
  IndianRupee,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
import Stat from "../components/Stat";

const categories = [
  "Railway",
  "SSC",
  "Banking",
  "Teaching",
  "Police",
  "State Exams",
  "Other",
];
const categoryIcons = {
  Railway: Train,
  SSC: ShieldCheck,
  Banking: Landmark,
  Teaching: GraduationCap,
  Police: ShieldCheck,
  "State Exams": Landmark,
  Other: BookOpen,
};
const money = (paise) =>
  `₹${Math.round((paise || 45000) / 100).toLocaleString("en-IN")}`;

export default function Dashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    api("/exams")
      .then(setExams)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);
  const groups = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          items: exams.filter((e) => (e.category || "Other") === category),
        }))
        .filter((g) => g.items.length),
    [exams],
  );
  return (
    <MainLayout>
      <main className="page catalog-page">
        <div className="page-heading">
          <div>
            <div className="section-kicker">YOUR EXAMPATH</div>
            <h1>Test series library</h1>
            <p>
              Choose your exam. Review its details and price, then purchase to
              unlock its tests.
            </p>
          </div>
          <div className="status-pill">
            <CheckCircle2 size={15} /> Signed in as {user.name.split(" ")[0]}
          </div>
        </div>
        <div className="stats-grid">
          <Stat icon={<BookOpen />} value={exams.length} label="Test series" />
          <Stat
            icon={<CheckCircle2 />}
            value={exams.filter((e) => e.purchased).length}
            label="Purchased"
          />
          <Stat
            icon={<LockKeyhole />}
            value={exams.filter((e) => !e.purchased).length}
            label="Locked series"
          />
        </div>
        {error && (
          <div className="error-box">
            {error}
            <button className="btn small outline" onClick={load}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className="empty-state">Loading test series…</div>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={30} />
            <h3>No test series available</h3>
            <p>
              Ask the administrator to add a series or run{" "}
              <code>npm run seed:catalog</code> in the server folder.
            </p>
          </div>
        ) : (
          groups.map(({ category, items }) => {
            const Icon = categoryIcons[category] || BookOpen;
            return (
              <section className="catalog-group" key={category}>
                <div className="catalog-group-heading">
                  <span className="catalog-category-icon">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h2>{category} Test Series</h2>
                    <p>{items.length} series available</p>
                  </div>
                </div>
                <div className="exam-grid">
                  {items.map((ex) => (
                    <article
                      className={`exam-card-list series-card ${ex.purchased ? "is-purchased" : "is-locked"}`}
                      key={ex._id}
                    >
                      <div className="series-card-top">
                        <span className="tag">{category.toUpperCase()}</span>
                        <span
                          className={
                            ex.purchased ? "unlock-badge" : "lock-badge"
                          }
                        >
                          {ex.purchased ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <LockKeyhole size={14} />
                          )}{" "}
                          {ex.purchased ? "UNLOCKED" : "LOCKED"}
                        </span>
                      </div>
                      <h3>{ex.title}</h3>
                      <p>
                        {ex.description ||
                          "Exam-specific mock tests and practice questions."}
                      </p>
                      <div className="series-meta">
                        <span>
                          <BookOpen size={14} /> {ex.partsCount || 0} parts
                        </span>
                        <b>{money(ex.pricePaise)}</b>
                      </div>
                      <Link
                        className={`btn ${ex.purchased ? "outline" : "primary"} full`}
                        to={`/exams/${ex._id}`}
                      >
                        {ex.purchased
                          ? "Open test series"
                          : "View details & unlock"}{" "}
                        <ArrowRight size={15} />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>
    </MainLayout>
  );
}
