import React, { useCallback, useEffect, useState } from "react";
import {
  PlusCircle,
  LayoutDashboard,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function AdminPage() {
  const [exams, setExams] = useState([]);
  const [parts, setParts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState("");
  const [part, setPart] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Other");
  const [priceRupees, setPriceRupees] = useState("450");
  const [partTitle, setPartTitle] = useState("");
  const [text, setText] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState("0");
  const [explanation, setExplanation] = useState("");
  const [marks, setMarks] = useState("1");
  const [negative, setNegative] = useState("0");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const loadExams = useCallback(async () => {
    const result = await api("/exams");
    setExams(result);
    setExam((current) => current || result[0]?._id || "");
  }, []);

  const loadParts = useCallback(async (examId) => {
    if (!examId) {
      setParts([]);
      setPart("");
      return;
    }
    const result = await api(`/exams/${examId}/parts`);
    setParts(result);
    setPart((current) =>
      result.some((p) => p._id === current) ? current : result[0]?._id || "",
    );
  }, []);

  const loadQuestions = useCallback(async () => {
    if (!exam) {
      setQuestions([]);
      setListError("");
      return;
    }
    setLoadingQuestions(true);
    setListError("");
    try {
      const query = new URLSearchParams({ exam, limit: "5000" });
      if (part) query.set("part", part);
      const result = await api(`/admin/questions?${query.toString()}`);
      setQuestions(Array.isArray(result) ? result : []);
    } catch (e) {
      setListError(e.message || "Questions could not be loaded.");
    } finally {
      setLoadingQuestions(false);
    }
  }, [exam, part]);

  useEffect(() => {
    loadExams().catch((e) => setError(e.message));
  }, [loadExams]);
  useEffect(() => {
    loadParts(exam).catch((e) => setError(e.message));
  }, [exam, loadParts]);
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const action = async (fn) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      setMessage("Saved successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const addExam = (e) => {
    e.preventDefault();
    action(async () => {
      await api("/admin/exams", {
        method: "POST",
        body: JSON.stringify({
          title,
          slug,
          description: desc,
          category,
          priceRupees: Number(priceRupees),
          durationDays: 180,
        }),
      });
      setTitle("");
      setSlug("");
      setDesc("");
      setCategory("Other");
      setPriceRupees("450");
      await loadExams();
    });
  };

  const addPart = (e) => {
    e.preventDefault();
    action(async () => {
      await api("/admin/parts", {
        method: "POST",
        body: JSON.stringify({ exam, title: partTitle }),
      });
      setPartTitle("");
      const result = await api(`/exams/${exam}/parts`);
      setParts(result);
      setPart(result[result.length - 1]?._id || "");
    });
  };

  const addQuestion = (e) => {
    e.preventDefault();
    action(async () => {
      await api("/admin/questions", {
        method: "POST",
        body: JSON.stringify({
          exam,
          part,
          text,
          options: opts,
          correctOption: Number(correct),
          explanation,
          marks: Number(marks),
          negativeMarks: Number(negative),
        }),
      });
      setText("");
      setOpts(["", "", "", ""]);
      setExplanation("");
      await loadQuestions();
    });
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question permanently?")) return;
    setListError("");
    setMessage("");
    try {
      await api(`/admin/questions/${id}`, { method: "DELETE" });
      setQuestions((current) => current.filter((q) => q._id !== id));
      setMessage("Question deleted.");
    } catch (e) {
      setListError(e.message);
    }
  };

  return (
    <MainLayout>
      <main className="page admin-page">
        <div className="page-heading">
          <div>
            <div className="section-kicker">CONTENT MANAGEMENT</div>
            <h1>Admin workspace</h1>
            <p>Create exams, organize parts and publish questions.</p>
          </div>
          <div className="status-pill">
            <ShieldCheck size={15} /> Admin access
          </div>
        </div>
        <div className="admin-notice">
          Questions and correct answers entered here are stored in the database.
          Only administrator accounts can use these APIs.
        </div>
        <div className="admin-grid">
          <form className="panel" onSubmit={addExam}>
            <div className="panel-title">
              <PlusCircle />
              <div>
                <h2>Create exam</h2>
                <p>Add a competitive exam to the library.</p>
              </div>
            </div>
            <label>
              Exam title
              <input
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
                  );
                }}
                placeholder="DSSSB TGT Computer Science"
              />
            </label>
            <label>
              URL slug
              <input
                required
                pattern="[a-z0-9-]+"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="dsssb-tgt-computer"
              />
            </label>
            <label>
              Description
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows="3"
                placeholder="About this test series"
              />
            </label>
            <div className="form-grid">
              <label>
                Test series category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Railway</option>
                  <option>SSC</option>
                  <option>Banking</option>
                  <option>Teaching</option>
                  <option>State Exams</option>
                  <option>Police</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Price (₹)
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="1"
                  required
                  value={priceRupees}
                  onChange={(e) => setPriceRupees(e.target.value)}
                />
              </label>
            </div>
            <p className="muted">
              Access duration: 180 days from verified payment.
            </p>
            <button className="btn primary full" disabled={busy}>
              Create exam
            </button>
          </form>
          <form className="panel" onSubmit={addPart}>
            <div className="panel-title">
              <LayoutDashboard />
              <div>
                <h2>Add part / subject</h2>
                <p>Divide an exam into manageable sections.</p>
              </div>
            </div>
            <label>
              Select exam
              <select
                value={exam}
                onChange={(e) => {
                  setExam(e.target.value);
                  setPart("");
                }}
                required
              >
                <option value="">Choose exam</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title} · ₹{Math.round((e.pricePaise || 45000) / 100)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Part name
              <input
                required
                value={partTitle}
                onChange={(e) => setPartTitle(e.target.value)}
                placeholder="Hindi & English / GK & GS / Computer"
              />
            </label>
            <button className="btn primary full" disabled={busy || !exam}>
              Add part
            </button>
            <div className="parts-summary">
              {parts.map((p) => (
                <span key={p._id}>{p.title}</span>
              ))}
            </div>
          </form>
        </div>
        <form className="panel question-panel" onSubmit={addQuestion}>
          <div className="panel-title">
            <BookOpen />
            <div>
              <h2>Add a question</h2>
              <p>
                Four options are required. The correct answer stays private
                until a test is submitted.
              </p>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Exam
              <select
                value={exam}
                onChange={(e) => {
                  setExam(e.target.value);
                  setPart("");
                }}
                required
              >
                <option value="">Choose exam</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title} · ₹{Math.round((e.pricePaise || 45000) / 100)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Part / subject
              <select
                value={part}
                onChange={(e) => setPart(e.target.value)}
                required
              >
                <option value="">Choose part</option>
                {parts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Question text
            <textarea
              required
              rows="3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your question…"
            />
          </label>
          <div className="form-grid">
            {opts.map((o, i) => (
              <label key={i}>
                Option {String.fromCharCode(65 + i)}
                <input
                  required
                  value={o}
                  onChange={(e) =>
                    setOpts((current) =>
                      current.map((v, j) => (i === j ? e.target.value : v)),
                    )
                  }
                  placeholder={`Enter option ${String.fromCharCode(65 + i)}`}
                />
              </label>
            ))}
          </div>
          <div className="form-grid">
            <label>
              Correct option
              <select
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
              >
                {["A", "B", "C", "D"].map((x, i) => (
                  <option key={x} value={i}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Marks
              <input
                type="number"
                min="0"
                max="100"
                step="0.25"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </label>
            <label>
              Negative marks
              <input
                type="number"
                min="0"
                max="100"
                step="0.25"
                value={negative}
                onChange={(e) => setNegative(e.target.value)}
              />
            </label>
          </div>
          <label>
            Explanation (optional)
            <textarea
              rows="2"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the answer is correct"
            />
          </label>
          <button className="btn primary" disabled={busy || !exam || !part}>
            {busy ? "Saving…" : "Save question"} <ArrowRight size={16} />
          </button>
        </form>

        <section className="panel question-list-panel">
          <div className="panel-title">
            <BookOpen />
            <div>
              <h2>All added questions ({questions.length})</h2>
              <p>Saved questions for the selected exam and subject.</p>
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={loadQuestions}
              disabled={loadingQuestions}
            >
              <RefreshCw size={15} />
              {loadingQuestions ? "Loading…" : "Refresh"}
            </button>
          </div>
          <div className="form-grid">
            <label>
              Filter by exam
              <select
                value={exam}
                onChange={(e) => {
                  setExam(e.target.value);
                  setPart("");
                }}
              >
                <option value="">Choose exam</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title} · ₹{Math.round((e.pricePaise || 45000) / 100)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Filter by part
              <select
                value={part}
                onChange={(e) => setPart(e.target.value)}
                disabled={!parts.length}
              >
                <option value="">All parts</option>
                {parts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {listError && <div className="error-box">{listError}</div>}
          {loadingQuestions ? (
            <p className="muted">Loading questions…</p>
          ) : questions.length === 0 ? (
            <p className="muted">
              No questions found for this selection. Choose an exam/part or add
              a new question above.
            </p>
          ) : (
            <div className="question-list">
              {questions.map((q, index) => (
                <article className="question-row" key={q._id}>
                  <div className="question-row-main">
                    <div className="question-row-meta">
                      Question {index + 1} · {q.marks ?? 1} mark
                      {Number(q.marks ?? 1) === 1 ? "" : "s"}
                    </div>
                    <h3>{q.text}</h3>
                    <div className="question-options">
                      {(q.options || []).map((option, i) => (
                        <span
                          key={i}
                          className={
                            i === q.correctOption ? "correct-option" : ""
                          }
                        >
                          {String.fromCharCode(65 + i)}. {option}
                          {i === q.correctOption ? " ✓" : ""}
                        </span>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="muted">Explanation: {q.explanation}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => deleteQuestion(q._id)}
                    aria-label="Delete question"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}
        <div className="admin-tip">
          <b>Bulk import:</b> Use <code>POST /api/admin/questions/bulk</code>{" "}
          with a JSON body containing a <code>questions</code> array (maximum
          150 per request). Each question needs exam and part IDs, text, four
          options, and correctOption (0–3).
        </div>
      </main>
    </MainLayout>
  );
}
