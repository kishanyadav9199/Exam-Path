
import React from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  ShoppingBag,
  Settings,
  Mail,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";

export default function Profile() {
  const { user } = useAuth();

  const actions = [
    {
      title: "My purchases",
      description:
        "See all purchased test series and expiry dates.",
      to: "/purchases",
      icon: ShoppingBag,
    },
    {
      title: "Settings",
      description:
        "Update your profile name and account details.",
      to: "/settings",
      icon: Settings,
    },
    {
      title: "Test series",
      description:
        "Browse locked and unlocked exam series.",
      to: "/dashboard",
      icon: BookOpen,
    },
  ];

  return (
    <MainLayout>
      <main className="page profile-page">
        <div className="page-heading">
          <div>
            <div className="section-kicker">ACCOUNT</div>
            <h1>My profile</h1>
            <p>
              Manage your ExamPath account and purchases.
            </p>
          </div>
        </div>

        <section className="panel profile-summary">
          <div className="profile-avatar">
            <UserRound size={28} />
          </div>

          <div className="profile-info">
            <h2>{user?.name || "Student"}</h2>

            <p className="profile-email">
              <Mail size={16} />
              <span>{user?.email || "No email available"}</span>
            </p>

            <span className="tag">STUDENT ACCOUNT</span>
          </div>
        </section>

        <section className="profile-actions-grid">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                className="profile-action-card"
                to={action.to}
              >
                <div className="profile-action-icon">
                  <Icon size={22} />
                </div>

                <div className="profile-action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>

                <ArrowRight
                  className="profile-action-arrow"
                  size={20}
                />
              </Link>
            );
          })}
        </section>
      </main>
    </MainLayout>
  );
}
