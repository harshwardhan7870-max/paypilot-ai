import { useState } from "react";
import { PackageSearch } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import { OrdersTable } from "../components/orders/OrdersTable";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import type { OrderStatus } from "../types/order";

type FilterTab = "All" | OrderStatus;

const TABS: FilterTab[] = ["All", "Paid", "Pending", "Refunded", "Cancelled"];

export function Orders() {
  const { orders, isLoading, error, retry } = useOrders();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const filtered =
    activeTab === "All" ? orders : orders.filter((o) => o.status === activeTab);

  const counts: Record<FilterTab, number> = {
    All:       orders.length,
    Paid:      orders.filter((o) => o.status === "Paid").length,
    Pending:   orders.filter((o) => o.status === "Pending").length,
    Refunded:  orders.filter((o) => o.status === "Refunded").length,
    Cancelled: orders.filter((o) => o.status === "Cancelled").length,
  };

  return (
    <div className="page-stack">
      {/* Page header */}
      <div className="welcome-row">
        <div>
          <h2>All orders</h2>
          <p>Live from <code>GET /api/orders</code> — sample demo data.</p>
        </div>
        <span className="date-chip">Demo data</span>
      </div>

      {/* Full-page loading state */}
      {isLoading && (
        <Card>
          <div style={{ padding: "40px 20px" }}>
            <LoadingSpinner label="Loading orders from the server…" />
          </div>
        </Card>
      )}

      {/* Error state with retry */}
      {!isLoading && error && (
        <ErrorBanner
          message={error}
          onRetry={retry}
        />
      )}

      {/* Data state */}
      {!isLoading && !error && (
        <Card>
          {/* Filter tabs */}
          <div className="filter-tabs" role="tablist" aria-label="Filter orders by status">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`filter-tab ${activeTab === tab ? "filter-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span className="filter-tab-count">{counts[tab]}</span>
              </button>
            ))}
          </div>

          <div className="section-heading" style={{ marginTop: "18px" }}>
            <div>
              <h2>Orders</h2>
              <p>
                {filtered.length}{" "}
                {activeTab === "All" ? "total" : activeTab.toLowerCase()} order
                {filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <PackageSearch size={36} strokeWidth={1.4} />
              <p className="empty-state__title">No orders found</p>
              <p className="empty-state__body">
                {activeTab === "All"
                  ? "The server returned an empty order list."
                  : `No ${activeTab.toLowerCase()} orders at the moment.`}
              </p>
            </div>
          ) : (
            <OrdersTable orders={filtered} />
          )}
        </Card>
      )}
    </div>
  );
}
