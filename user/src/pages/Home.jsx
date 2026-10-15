import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Trophy,
  ArrowRight,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";
import Feature from "../components/Feature";
export default function Home() {
  const { user } = useAuth();
  return (
    <MainLayout>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> YOUR NEXT RANK STARTS HERE
            </div>
            <h1>
              Prepare smarter.
              <br />
              <em>Score higher.</em>
            </h1>
            <p>
              One focused platform for competitive exam preparation. Practice
              topic-wise, take timed tests and understand your progress.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link className="btn primary" to="/dashboard">
                  Go to dashboard <ArrowRight size={17} />
                </Link>
              ) : (
                <>
                  <Link className="btn primary" to="/register">
                    Start preparing <ArrowRight size={17} />
                  </Link>
                  <Link className="btn ghost" to="/login">
                    I have an account
                  </Link>
                </>
              )}
            </div>
            <div className="trust-row">
              <span>
                <ShieldCheck size={16} /> Secure accounts
              </span>
              <span>
                <CheckCircle2 size={16} /> Instant results
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="exam-card">
              <div className="exam-card-head">
                <span className="mini-icon">
                  <BookOpen size={18} />
                </span>
                <span className="live-dot">● LIVE PRACTICE</span>
              </div>
              <p className="muted">TODAY'S STUDY PLAN</p>
              <h3>Build your momentum</h3>
              <div className="progress-label">
                <span>Practice goal</span>
                <b>75%</b>
              </div>
              <div className="progress">
                <span />
              </div>
              <div className="mini-stats">
                <div>
                  <b>150</b>
                  <small>Daily questions</small>
                </div>
                <div>
                  <b>3</b>
                  <small>Study sections</small>
                </div>
              </div>
              <div className="streak">
                <Trophy size={18} />
                <span>
                  <b>Consistency wins.</b>
                  <small>One test at a time.</small>
                </span>
              </div>
            </div>
            <div className="floating-badge">
              <Trophy size={17} />
              <span>
                <b>Keep going!</b>
                <small>Every question counts</small>
              </span>
            </div>
          </div>
        </section>
        <section className="features">
          <div className="section-kicker">YOUR PREPARATION, ORGANIZED</div>
          <h2>
            Everything you need to <em>get exam-ready.</em>
          </h2>
          <div className="feature-grid">
            <Feature
              icon={<BookOpen />}
              title="Exam-wise learning"
              desc="Choose your exam and navigate organized subjects and parts."
            />
            <Feature
              icon={<Clock3 />}
              title="Timed test practice"
              desc="Attempt questions under test conditions and submit when ready."
            />
            <Feature
              icon={<Trophy />}
              title="Results that teach"
              desc="Review scores, correct answers and explanations after submission."
            />
          </div>
        </section>
        <section className="bottom-cta">
          <div>
            <h2>Your preparation deserves a plan.</h2>
            <p>Sign in to access your dashboard and available test series.</p>
          </div>
          {user ? (
            <Link className="btn primary" to="/dashboard">
              Open dashboard <ArrowRight size={17} />
            </Link>
          ) : (
            <Link className="btn primary" to="/register">
              Create free account <ArrowRight size={17} />
            </Link>
          )}
        </section>
      </main>
    </MainLayout>
  );
}
