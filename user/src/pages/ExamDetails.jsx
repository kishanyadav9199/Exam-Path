import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  CheckCircle2,
  BookOpen,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
import Loading from "../components/Loading";
const money = (paise) =>
  `₹${Math.round((paise || 45000) / 100).toLocaleString("en-IN")}`;
export default function ExamDetails() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null),
    [parts, setParts] = useState([]),
    [err, setErr] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    Promise.all([api("/exams"), api(`/exams/${examId}/parts`)])
      .then(([es, ps]) => {
        if (!alive) return;
        setExam(es.find((e) => e._id === examId) || null);
        setParts(ps);
      })
      .catch((e) => setErr(e.message))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [examId]);
  if (loading)
    return (
      <MainLayout>
        <main className="page">
          <Loading />
        </main>
      </MainLayout>
    );
  if (err)
    return (
      <MainLayout>
        <main className="page">
          <div className="error-box">{err}</div>
          <Link to="/dashboard" className="btn outline">
            Back to series
          </Link>
        </main>
      </MainLayout>
    );
  if (!exam)
    return (
      <MainLayout>
        <main className="page">
          <h1>Test series not found</h1>
          <Link to="/dashboard">Back to series</Link>
        </main>
      </MainLayout>
    );
  const purchased = Boolean(exam.purchased);
  return (
    <MainLayout>
      <main className="page series-detail-page">
        <Link className="back-link" to="/dashboard">
          ← All test series
        </Link>
        <section className="series-detail-hero">
          <div>
            <div className="section-kicker">
              {exam.category || "COMPETITIVE EXAM"} TEST SERIES
            </div>
            <h1>{exam.title}</h1>
            <p>
              {exam.description ||
                "A focused set of practice tests for this competitive exam."}
            </p>
            <div className="series-detail-metrics">
              <span>
                <BookOpen size={16} /> {parts.length} parts / subjects
              </span>
              <span>
                <Clock3 size={16} /> {exam.durationDays || 180} days access
              </span>
              <span>
                {purchased ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <LockKeyhole size={16} />
                )}{" "}
                {purchased ? "Purchased & unlocked" : "Locked until purchase"}
              </span>
            </div>
          </div>
          <aside className="series-buy-card">
            <span className="tag">
              {purchased ? "YOUR PURCHASE" : "ONE-TIME PURCHASE"}
            </span>
            <div className="series-price">
              {money(exam.pricePaise)}{" "}
              <small>/ {exam.durationDays || 180} days</small>
            </div>
            <p>
              {purchased
                ? "You have access to the tests in this series."
                : "Review this series before buying. Only this selected series will unlock after verified payment."}
            </p>
            {purchased ? (
              <div className="success-box">
                <CheckCircle2 size={16} /> Test series unlocked
              </div>
            ) : (
              <Link
                className="btn primary full"
                to={`/pricing?examId=${exam._id}`}
              >
                Review details & buy <ArrowRight size={16} />
              </Link>
            )}
            <small className="muted">
              <ShieldCheck size={13} /> Secure payment; unlock after server
              verification
            </small>
          </aside>
        </section>
        <div className="content-heading">
          <div>
            <h2>What's included</h2>
            <p>
              These subjects are included in this test series. Questions appear
              once the admin has added them.
            </p>
          </div>
        </div>
        <div className="part-list">
          {parts.map((p, i) => (
            <div className="part-row" key={p._id}>
              <div className="part-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="part-info">
                <b>{p.title}</b>
                <span>
                  {purchased
                    ? "Included with your purchase"
                    : "Locked — purchase this series to access tests"}
                </span>
              </div>
              {purchased ? (
                <div className="part-actions">
                  <Link
                    className="btn primary small"
                    to={`/test/${examId}/${p._id}`}
                  >
                    Start test <ArrowRight size={15} />
                  </Link>
                  <Link
                    className="btn outline small"
                    to={`/leaderboard/${examId}/${p._id}`}
                  >
                    View rank
                  </Link>
                </div>
              ) : (
                <span className="lock-badge">
                  <LockKeyhole size={14} /> LOCKED
                </span>
              )}
            </div>
          ))}
          {!parts.length && (
            <div className="empty-state">
              Subjects have not been added yet. The administrator can add them
              in the Admin Panel.
            </div>
          )}
        </div>
      </main>
    </MainLayout>
  );
}
