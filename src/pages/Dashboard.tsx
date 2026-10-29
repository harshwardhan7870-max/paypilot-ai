import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleDollarSign,
  PackageCheck,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import { RecentOrders } from "../components/dashboard/RecentOrders";
import { SalesChart } from "../components/dashboard/SalesChart";
import { StatCard } from "../components/dashboard/StatCard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { useOrders } from "../hooks/useOrders";
import type { PageId } from "../components/layout/Sidebar";

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { orders, isLoading, error, retry } = useOrders();

  const paidTotal = orders
    .filter((o) => o.status === "Paid")
    .reduce((sum, o) => sum + o.amount, 0);

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const customerCount = new Set(orders.map((order) => order.email)).size;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="page-stack">
      {/* Welcome row */}
      <div className="welcome-row">
        <div>
          <h2>Welcome back, Jordan 👋</h2>
          <p>Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <span className="date-chip">{today}</span>
      </div>

      {/* KPI stat cards — show placeholders while loading */}
      <div className="stats-grid">
        <StatCard
          label="Total sales (sample)"
          value={
            isLoading
              ? "—"
              : `$${paidTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
          }
          change="Based on paid demo orders"
          icon={<CircleDollarSign size={20} />}
          tone="blue"
        />
        <StatCard
          label="Orders"
          value={isLoading ? "—" : orders.length.toString()}
          change="Across all sample statuses"
          icon={<ShoppingBag size={20} />}
          tone="violet"
        />
        <StatCard
          label="Pending orders"
          value={isLoading ? "—" : pendingCount.toString()}
          change="Review when integration is ready"
          icon={<PackageCheck size={20} />}
          tone="orange"
        />
        <StatCard
          label="Customers"
          value={isLoading ? "—" : customerCount.toString()}
          change="Unique customers in demo orders"
          icon={<UsersRound size={20} />}
          tone="green"
        />
      </div>

      {/* Chart + insight panel */}
      <div className="dashboard-grid">
        <SalesChart orders={orders} />
        <div className="insight-card">
          <div className="insight-icon">
            <ArrowUpRight size={19} />
          </div>
          <p className="eyebrow">STORE SNAPSHOT</p>
          <h3>Orders are live from the API</h3>
          <p>
            Order data is now fetched from{" "}
            <code style={{ fontSize: "10px", opacity: 0.85 }}>GET /api/orders</code>{" "}
            on the Express backend. Swap the demo array for a real database
            query in a future stage.
          </p>
          <div className="insight-meta">
            <span>
              <ArrowDownLeft size={15} /> Stage 2 complete
            </span>
            <span>Demo data</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onRetry={retry} />}

      {/* Loading / recent orders */}
      {isLoading ? (
        <div style={{ padding: "10px 0" }}>
          <LoadingSpinner label="Loading recent orders…" />
        </div>
      ) : (
        !error && (
          <RecentOrders orders={orders} onViewAll={() => onNavigate("orders")} />
        )
      )}
    </div>
  );
}
