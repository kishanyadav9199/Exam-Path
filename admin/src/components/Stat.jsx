import React from "react";
export default function Stat({ icon, value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}
