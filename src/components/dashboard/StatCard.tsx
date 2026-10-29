import type { ReactNode } from "react";
import { Card } from "../ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "violet" | "orange";
}

export function StatCard({ label, value, change, icon, tone = "blue" }: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className={`stat-icon stat-icon--${tone}`} aria-hidden="true">{icon}</div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-change">{change}</p>
    </Card>
  );
}
