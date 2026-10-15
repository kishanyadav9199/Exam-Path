import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
import Stat from "../components/Stat";
export default function Dashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    api("/exams")
      .then(setExams)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <MainLayout>
      <main className="page">
        <div className="page-heading">
          <div>
            <div className="section-kicker">YOUR WORKSPACE</div>
            <h1>Welcome back, {user.name.split(" ")[0]}.</h1>
            <p>Pick your exam and keep your preparation moving.</p>
          </div>
          <div className="status-pill">
            {user.hasAccess ? (
              <>
                <CheckCircle2 size={15} /> Active access
              </>
            ) : (
              <>
                <CreditCard size={15} /> Access not active
              </>
            )}
          </div>
        </div>
        {!user.hasAccess && (
          <div className="upgrade-banner">
            <div className="upgrade-icon">
              <CreditCard />
            </div>
            <div>
              <b>Unlock your test series</b>
              <p>Get access for 6 months for ₹450.</p>
            </div>
            <Link className="btn primary small" to="/pricing">
              View plan <ArrowRight size={15} />
            </Link>
          </div>
        )}
        <div className="stats-grid">
          <Stat
            icon={<BookOpen />}
            value={exams.length}
            label="Available exams"
          />
          <Stat
            icon={<ShieldCheck />}
            value={user.hasAccess ? "Active" : "Locked"}
            label="Subscription"
          />
          <Stat icon={<Trophy />} value="—" label="Tests completed" />
        </div>
        <div className="content-heading">
          <div>
            <h2>Explore exams</h2>
            <p>Select an exam to view its parts and available tests.</p>
          </div>
        </div>
        {error && <div className="error-box">{error}</div>}
        {exams.length === 0 && !error ? (
          <div className="empty-state">
            <BookOpen size={30} />
            <h3>Exam library is getting ready</h3>
            <p>
              Available exams will appear here once the administrator publishes
              them.
            </p>
          </div>
        ) : (
          <div className="exam-grid">
            {exams.map((ex) => (
              <div className="exam-card-list" key={ex._id}>
                <div className="exam-tile-icon">
                  <BookOpen />
                </div>
                <span className="tag">COMPETITIVE EXAM</span>
                <h3>{ex.title}</h3>
                <p>
                  {ex.description ||
                    "Practice with organized parts, questions and test results."}
                </p>
                <Link className="text-link" to={`/exams/${ex._id}`}>
                  Explore exam <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </MainLayout>
  );
}
