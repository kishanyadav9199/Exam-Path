import React, { useEffect, useState } from "react";
import {
  CreditCard,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import MainLayout from "../layouts/MainLayout";
const money = (paise) =>
  `₹${Math.round((paise || 45000) / 100).toLocaleString("en-IN")}`;
export default function Pricing() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const examId = params.get("examId");
  const [exams, setExams] = useState([]),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/exams")
      .then(setExams)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);
  const exam = exams.find((e) => e._id === examId);
  const pay = async () => {
    if (!examId) {
      setErr("Choose a test series first.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const order = await api("/payments/order", {
        method: "POST",
        body: JSON.stringify({ examId }),
      });
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = resolve;
          s.onerror = () =>
            reject(new Error("Unable to load secure checkout."));
          document.body.appendChild(s);
        });
      }
      const instance = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ExamPath",
        description: `${order.exam.title} — ${order.exam.durationDays} days access`,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#6957e8" },
        handler: async (response) => {
          try {
            await api("/payments/verify", {
              method: "POST",
              body: JSON.stringify(response),
            });
            await refresh();
            navigate(`/exams/${examId}`, { replace: true });
          } catch (e) {
            setErr(e.message);
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      instance.on("payment.failed", (r) => {
        setErr(r.error?.description || "Payment failed. Please try again.");
        setBusy(false);
      });
      instance.open();
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };
  return (
    <MainLayout>
      <main className="page pricing-page">
        {examId ? (
          <>
            <Link className="back-link" to={`/exams/${examId}`}>
              ← Back to series details
            </Link>
            <div className="center-heading">
              <div className="section-kicker">SERIES PURCHASE</div>
              <h1>
                Unlock your <em>test series.</em>
              </h1>
              <p>Check the price and included subjects before you pay.</p>
            </div>
            {loading ? (
              <div className="empty-state">Loading series details…</div>
            ) : !exam ? (
              <div className="error-box">{err || "Test series not found."}</div>
            ) : (
              <div className="pricing-card">
                <div className="pricing-top">
                  <span className="tag">{exam.category} TEST SERIES</span>
                  <h2>{exam.title}</h2>
                  <p>{exam.description}</p>
                  <div className="price">
                    <sup>₹</sup>
                    {Math.round((exam.pricePaise || 45000) / 100)}{" "}
                    <span>/ {exam.durationDays || 180} days</span>
                  </div>
                </div>
                <div className="pricing-benefits">
                  <div>
                    <CheckCircle2 /> Unlock only {exam.title}
                  </div>
                  <div>
                    <CheckCircle2 /> {exam.partsCount || 0} subjects / parts
                  </div>
                  <div>
                    <CheckCircle2 /> Test scores, explanations and leaderboard
                  </div>
                  <div>
                    <CheckCircle2 /> Access for {exam.durationDays || 180} days
                    after verified payment
                  </div>
                </div>
                {exam.purchased ? (
                  <div className="success-box">
                    <CheckCircle2 size={16} /> You already own this series.{" "}
                    <Link to={`/exams/${exam._id}`}>Open it</Link>
                  </div>
                ) : (
                  <button
                    className="btn primary full"
                    onClick={pay}
                    disabled={busy}
                  >
                    {busy
                      ? "Opening secure checkout…"
                      : "Pay securely and unlock"}{" "}
                    <ArrowRight size={17} />
                  </button>
                )}
                <p className="fine-print">
                  <ShieldCheck size={13} /> Razorpay payment is verified by the
                  backend before this series unlocks.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="center-heading">
              <div className="section-kicker">SERIES PRICING</div>
              <h1>
                Choose your <em>test series.</em>
              </h1>
              <p>
                Every exam series has its own price. Buying one series does not
                unlock other series.
              </p>
            </div>
            {err && <div className="error-box">{err}</div>}
            {loading ? (
              <div className="empty-state">Loading test series…</div>
            ) : (
              <div className="exam-grid">
                {exams.map((ex) => (
                  <article className="exam-card-list series-card" key={ex._id}>
                    <div className="series-card-top">
                      <span className="tag">{ex.category || "OTHER"}</span>
                      <span
                        className={ex.purchased ? "unlock-badge" : "lock-badge"}
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
                    <p>{ex.description}</p>
                    <div className="series-meta">
                      <span>
                        <BookOpen size={14} /> {ex.partsCount || 0} parts
                      </span>
                      <b>{money(ex.pricePaise)}</b>
                    </div>
                    <Link className="btn primary full" to={`/exams/${ex._id}`}>
                      {ex.purchased ? "Open series" : "View details & buy"}{" "}
                      <ArrowRight size={15} />
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </MainLayout>
  );
}
