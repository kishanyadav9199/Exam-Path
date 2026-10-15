import React, { useEffect, useState } from "react";
import { Trophy, CheckCircle2, BookOpen } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
import Loading from "../components/Loading";
import Stat from "../components/Stat";
export default function TestPage() {
  const { examId, partId } = useParams();
  const nav = useNavigate();
  const [test, setTest] = useState(null),
    [answers, setAnswers] = useState({}),
    [idx, setIdx] = useState(0),
    [busy, setBusy] = useState(false),
    [err, setErr] = useState(""),
    [result, setResult] = useState(null);
  useEffect(() => {
    api("/tests/start", {
      method: "POST",
      body: JSON.stringify({ examId, partId, limit: 50 }),
    })
      .then(setTest)
      .catch((e) => setErr(e.message));
  }, [examId, partId]);
  const submit = async () => {
    if (!test) return;
    setBusy(true);
    try {
      const r = await api(`/tests/${test.attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify({
          answers: Object.entries(answers).map(
            ([question, selectedOption]) => ({ question, selectedOption }),
          ),
        }),
      });
      setResult(r);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (result)
    return (
      <MainLayout>
        <main className="page result-page">
          <div className="result-icon">
            <Trophy size={30} />
          </div>
          <div className="section-kicker">TEST COMPLETED</div>
          <h1>Your result is ready.</h1>
          <div className="result-score">
            {result.score}
            <span> / {result.totalMarks} marks</span>
          </div>
          <div className="stats-grid">
            <Stat
              icon={<CheckCircle2 />}
              value={result.correctCount}
              label="Correct answers"
            />
            <Stat
              icon={<BookOpen />}
              value={result.attempted}
              label="Attempted"
            />
            <Stat
              icon={<Trophy />}
              value={result.review.length - result.attempted}
              label="Not answered (approx.)"
            />
          </div>
          <div className="content-heading">
            <div>
              <h2>Answer review</h2>
              <p>Check the correct option and explanation.</p>
            </div>
          </div>
          {result.review.map((q, i) => (
            <div className="review-card" key={q.id}>
              <b>
                Q{i + 1}. {q.text}
              </b>
              <p className="correct-answer">
                Correct: {q.options[q.correctOption]}
              </p>
              {q.selectedOption !== null &&
                q.selectedOption !== q.correctOption && (
                  <p className="wrong-answer">
                    Your answer: {q.options[q.selectedOption]}
                  </p>
                )}
              {q.explanation && <p>{q.explanation}</p>}
            </div>
          ))}
          <button className="btn primary" onClick={() => nav("/dashboard")}>
            Back to dashboard <ArrowRight size={16} />
          </button>
        </main>
      </MainLayout>
    );
  const q = test?.questions?.[idx];
  return (
    <MainLayout>
      <main className="page test-page">
        <Link className="back-link" to={`/exams/${examId}`}>
          ← Exit test
        </Link>
        {err && !test ? (
          <div className="error-box">{err}</div>
        ) : !test ? (
          <Loading />
        ) : (
          <>
            <div className="test-top">
              <div>
                <div className="section-kicker">PRACTICE MODE</div>
                <h1>
                  Question {idx + 1}{" "}
                  <span className="muted">/ {test.questions.length}</span>
                </h1>
              </div>
              <div className="test-count">
                {Object.keys(answers).length} answered
              </div>
            </div>
            <div className="test-progress">
              <span
                style={{
                  width: `${((idx + 1) / test.questions.length) * 100}%`,
                }}
              />
            </div>
            <div className="question-card">
              <div className="question-meta">
                <span>QUESTION {idx + 1}</span>
                <span>
                  {q.marks} mark{q.marks === 1 ? "" : "s"}
                </span>
              </div>
              <h2>{q.text}</h2>
              <div className="options">
                {q.options.map((o, i) => (
                  <button
                    key={i}
                    className={`option ${answers[q._id] === i ? "selected" : ""}`}
                    onClick={() => setAnswers({ ...answers, [q._id]: i })}
                  >
                    <span className="option-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            {err && <div className="error-box">{err}</div>}
            <div className="test-controls">
              <button
                className="btn outline"
                disabled={idx === 0}
                onClick={() => setIdx(idx - 1)}
              >
                Previous
              </button>
              {idx < test.questions.length - 1 ? (
                <button className="btn primary" onClick={() => setIdx(idx + 1)}>
                  Next question <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="btn primary"
                  disabled={busy}
                  onClick={submit}
                >
                  {busy ? "Submitting…" : "Submit test"}{" "}
                  <CheckCircle2 size={16} />
                </button>
              )}
            </div>
            <p className="test-note">
              Your answers are submitted for scoring when you select Submit
              test.
            </p>
          </>
        )}
      </main>
    </MainLayout>
  );
}
