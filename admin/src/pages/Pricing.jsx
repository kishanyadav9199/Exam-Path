import React, { useState } from "react";
import { CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
export default function Pricing() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState(""),
    [busy, setBusy] = useState(false),
    [ok, setOk] = useState("");
  const pay = async () => {
    setBusy(true);
    setErr("");
    try {
      const order = await api("/payments/order", {
        method: "POST",
        body: JSON.stringify({}),
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
        description: "6-month test series access",
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
            navigate("/dashboard", { replace: true });
          } catch (e) {
            setErr(e.message);
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
        <div className="center-heading">
          <div className="section-kicker">SIMPLE, TRANSPARENT ACCESS</div>
          <h1>
            Invest in your <em>preparation.</em>
          </h1>
          <p>One plan to help you practice consistently.</p>
        </div>
        <div className="pricing-card">
          <div className="pricing-top">
            <span className="tag">TEST SERIES PASS</span>
            <h2>Complete access</h2>
            <p>For focused competitive exam preparation.</p>
            <div className="price">
              <sup>₹</sup>450 <span>/ 6 months</span>
            </div>
          </div>
          <div className="pricing-benefits">
            <div>
              <CheckCircle2 /> Access to subscribed test series
            </div>
            <div>
              <CheckCircle2 /> Exam-wise parts and practice tests
            </div>
            <div>
              <CheckCircle2 /> Scores and answer explanations
            </div>
            <div>
              <CheckCircle2 /> Secure account and saved attempts
            </div>
          </div>
          {ok && <div className="success-box">{ok}</div>}
          {err && <div className="error-box">{err}</div>}
          {user.hasAccess ? (
            <div className="success-box">
              Your access is active until{" "}
              {new Date(user.accessUntil).toLocaleDateString()}.
            </div>
          ) : (
            <button className="btn primary full" onClick={pay} disabled={busy}>
              {busy ? "Opening checkout…" : "Continue to secure payment"}{" "}
              <ArrowRight size={17} />
            </button>
          )}
          <p className="fine-print">
            Payments are processed by Razorpay. Access is activated only after
            server-side signature verification.
          </p>
        </div>
      </main>
    </MainLayout>
  );
}
