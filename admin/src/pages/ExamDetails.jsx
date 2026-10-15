import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
export default function ExamDetails() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null),
    [parts, setParts] = useState([]),
    [err, setErr] = useState("");
  useEffect(() => {
    Promise.all([api("/exams"), api(`/exams/${examId}/parts`)])
      .then(([es, ps]) => {
        setExam(es.find((e) => e._id === examId));
        setParts(ps);
      })
      .catch((e) => setErr(e.message));
  }, [examId]);
  const { user } = useAuth();
  if (err)
    return (
      <MainLayout>
        <main className="page">
          <div className="error-box">{err}</div>
        </main>
      </MainLayout>
    );
  return (
    <MainLayout>
      <main className="page">
        <Link className="back-link" to="/dashboard">
          ← Dashboard
        </Link>
        <div className="page-heading">
          <div>
            <div className="section-kicker">EXAM OVERVIEW</div>
            <h1>{exam?.title || "Loading exam…"}</h1>
            <p>{exam?.description}</p>
          </div>
        </div>
        {!user.hasAccess && (
          <div className="upgrade-banner">
            <div>
              <b>Subscription required</b>
              <p>Activate your ₹450 / 6-month access to start tests.</p>
            </div>
            <Link className="btn primary small" to="/pricing">
              Unlock tests
            </Link>
          </div>
        )}
        <div className="content-heading">
          <div>
            <h2>Parts & subjects</h2>
            <p>Choose a section to begin a practice test.</p>
          </div>
        </div>
        <div className="part-list">
          {parts.map((p, i) => (
            <div className="part-row" key={p._id}>
              <div className="part-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="part-info">
                <b>{p.title}</b>
                <span>Questions are selected from this section</span>
              </div>
              {user.hasAccess ? (
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
                <Link className="btn outline small" to="/pricing">
                  Unlock
                </Link>
              )}
            </div>
          ))}
          {!parts.length && (
            <div className="empty-state">
              No parts have been added to this exam yet.
            </div>
          )}
        </div>
      </main>
    </MainLayout>
  );
}
