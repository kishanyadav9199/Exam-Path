import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  LayoutDashboard,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
export default function AdminPage() {
  const [exams, setExams] = useState([]),
    [parts, setParts] = useState([]),
    [exam, setExam] = useState(""),
    [part, setPart] = useState(""),
    [title, setTitle] = useState(""),
    [slug, setSlug] = useState(""),
    [desc, setDesc] = useState(""),
    [partTitle, setPartTitle] = useState(""),
    [text, setText] = useState(""),
    [opts, setOpts] = useState(["", "", "", ""]),
    [correct, setCorrect] = useState("0"),
    [explanation, setExplanation] = useState(""),
    [marks, setMarks] = useState("1"),
    [negative, setNegative] = useState("0"),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = () =>
    api("/exams")
      .then((es) => {
        setExams(es);
        if (!exam && es[0]) setExam(es[0]._id);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (exam)
      api(`/exams/${exam}/parts`)
        .then((ps) => {
          setParts(ps);
          setPart(ps[0]?._id || "");
        })
        .catch((e) => setError(e.message));
  }, [exam]);
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
        body: JSON.stringify({ title, slug, description: desc }),
      });
      setTitle("");
      setSlug("");
      setDesc("");
      await load();
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
      const ps = await api(`/exams/${exam}/parts`);
      setParts(ps);
      setPart(ps[ps.length - 1]?._id || "");
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
    });
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
                onChange={(e) => setExam(e.target.value)}
                required
              >
                <option value="">Choose exam</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title}
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
                onChange={(e) => setExam(e.target.value)}
                required
              >
                <option value="">Choose exam</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.title}
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
                    setOpts(opts.map((v, j) => (i === j ? e.target.value : v)))
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
