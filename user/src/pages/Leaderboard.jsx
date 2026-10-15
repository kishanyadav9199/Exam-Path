import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
import Loading from "../components/Loading";
export default function Leaderboard() {
  const { examId, partId } = useParams();
  const [rows, setRows] = useState([]),
    [exam, setExam] = useState(""),
    [part, setPart] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    Promise.all([
      api("/exams"),
      api(`/exams/${examId}/parts`),
      api(`/exams/${examId}/parts/${partId}/leaderboard`),
    ])
      .then(([exams, parts, board]) => {
        if (!alive) return;
        setExam(exams.find((e) => e._id === examId)?.title || "Exam");
        setPart(parts.find((p) => p._id === partId)?.title || "Part");
        setRows(board);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [examId, partId]);
  return (
    <MainLayout>
      <main className="page leaderboard-page">
        <Link className="back-link" to={`/exams/${examId}`}>
          <ArrowLeft
            size={14}
            style={{ display: "inline", verticalAlign: "middle" }}
          />{" "}
          Back to exam
        </Link>
        <div className="page-heading">
          <div>
            <div className="section-kicker">LEADERBOARD</div>
            <h1>
              {exam} — {part}
            </h1>
            <p>
              Rank is based on each student's best percentage in this part. Ties
              go to the earlier submission.
            </p>
          </div>
          <div className="status-pill">
            <Trophy size={15} /> Top 100
          </div>
        </div>
        {error && <div className="error-box">{error}</div>}
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <Trophy size={30} />
            <h3>No ranks yet</h3>
            <p>
              Rankings will appear after students submit tests for this part.
            </p>
          </div>
        ) : (
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.userId} className={r.rank <= 3 ? "top-rank" : ""}>
                    <td>
                      <span className="rank-badge">
                        {r.rank <= 3 ? <Medal size={15} /> : null} #{r.rank}
                      </span>
                    </td>
                    <td>{r.name}</td>
                    <td>
                      {r.score} / {r.totalMarks}
                    </td>
                    <td>
                      <b>{r.percentage}%</b>
                    </td>
                    <td>
                      {r.submittedAt
                        ? new Date(r.submittedAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="leaderboard-note">
          Only the best submitted attempt per student is counted. In-progress
          tests are not ranked.
        </p>
      </main>
    </MainLayout>
  );
}
