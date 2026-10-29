import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { SalesChart } from "../components/dashboard/SalesChart";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { getLastSevenDaysSales } from "../data/orderSales";
import { useOrders } from "../hooks/useOrders";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function SalesSummary() {
  const { orders, isLoading, error, retry } = useOrders();
  const dailySales = getLastSevenDaysSales(orders);
  const weekDates = new Set(dailySales.map((day) => day.date));
  const weekOrders = orders.filter((order) => weekDates.has(order.date));
  const paidOrders = weekOrders.filter((order) => order.status === "Paid");
  const completedSales = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const avgOrder = paidOrders.length > 0 ? completedSales / paidOrders.length : 0;
  const weekTotal = dailySales.reduce((sum, day) => sum + day.amount, 0);
  const bestDay = dailySales.reduce((a, b) => (a.amount > b.amount ? a : b));
  const refundedTotal = weekOrders
    .filter((o) => o.status === "Refunded")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="page-stack">
      <div className="welcome-row">
        <div>
          <h2>Sales summary</h2>
          <p>A quick look at illustrative store performance — sample data only.</p>
        </div>
        <span className="date-chip">Last 7 days</span>
      </div>

      {error && <ErrorBanner message={error} onRetry={retry} />}
      {isLoading && <LoadingSpinner label="Loading sales data…" />}

      {/* Top KPI cards */}
      <div className="summary-grid">
        <Card>
          <p className="stat-label">Paid sales (7 days)</p>
          <p className="summary-value">{isLoading ? "—" : currency.format(completedSales)}</p>
          <p className="stat-change">
            <TrendingUp size={13} /> Calculated from API orders
          </p>
        </Card>
        <Card>
          <p className="stat-label">Average paid order (7 days)</p>
          <p className="summary-value">{isLoading ? "—" : currency.format(avgOrder)}</p>
          <p className="stat-change">
            <ArrowUpRight size={13} /> Based on API orders marked paid
          </p>
        </Card>
        <Card>
          <p className="stat-label">Refunded (7 days)</p>
          <p className="summary-value">{isLoading ? "—" : currency.format(refundedTotal)}</p>
          <p className="stat-change">
            <TrendingDown size={13} /> Based on API orders marked refunded
          </p>
        </Card>
      </div>

      {/* Weekly chart */}
      <SalesChart orders={orders} />

      {/* Weekly breakdown table */}
      {!isLoading && !error && (
      <Card>
        <div className="section-heading">
          <div>
            <h2>Weekly breakdown</h2>
            <p>
              Paid demo order totals — best day:{" "}
              <strong>{bestDay.day}</strong> ({currency.format(bestDay.amount)})
              &nbsp;|&nbsp; Week total:{" "}
              <strong>{currency.format(weekTotal)}</strong>
            </p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Sample revenue</th>
                <th scope="col">vs. week avg</th>
                <th scope="col">Bar</th>
              </tr>
            </thead>
            <tbody>
              {dailySales.map((d) => {
                const avg = weekTotal / dailySales.length;
                const diff = d.amount - avg;
                const pct = bestDay.amount > 0 ? Math.round((d.amount / bestDay.amount) * 100) : 0;
                return (
                  <tr key={d.day}>
                    <td><strong>{d.day}</strong></td>
                    <td>{currency.format(d.amount)}</td>
                    <td>
                      <span
                        className={`stat-change ${diff >= 0 ? "stat-change--up" : "stat-change--down"}`}
                      >
                        {diff >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        &nbsp;{diff >= 0 ? "+" : ""}
                        {currency.format(diff)}
                      </span>
                    </td>
                    <td style={{ width: "180px", paddingRight: "20px" }}>
                      <div className="mini-bar-track">
                        <div
                          className="mini-bar-fill"
                          style={{ width: `${pct}%` }}
                          title={`${pct}% of peak`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}
