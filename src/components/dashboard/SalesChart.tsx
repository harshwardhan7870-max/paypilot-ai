import { getLastSevenDaysSales } from "../../data/orderSales";
import type { Order } from "../../types/order";
import { Card } from "../ui/Card";

interface SalesChartProps {
  orders: Order[];
}

export function SalesChart({ orders }: SalesChartProps) {
  const dailySales = getLastSevenDaysSales(orders);
  const maxAmount = Math.max(1, ...dailySales.map((item) => item.amount));
  const points = dailySales.map((item, index) => {
    const x = 20 + index * 60;
    const y = 116 - (item.amount / maxAmount) * 90;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Card className="sales-chart">
      <div className="section-heading"><div><h2>Sales overview</h2><p>Illustrative sales · last 7 days</p></div><span className="chart-period">This week</span></div>
      <div className="chart-wrap">
        <svg viewBox="0 0 400 150" role="img" aria-labelledby="sales-chart-title sales-chart-description" preserveAspectRatio="none">
          <title id="sales-chart-title">Paid sales over the last seven days</title>
          <desc id="sales-chart-description">{dailySales.map(({ day, amount }) => `${day}: $${amount}`).join(", ")}</desc>
          {[30, 70, 110].map((y) => <line key={y} x1="10" y1={y} x2="390" y2={y} className="chart-grid" />)}
          <polyline points={points} className="chart-line" />
          {dailySales.map((item, index) => {
            const x = 20 + index * 60;
            const y = 116 - (item.amount / maxAmount) * 90;
            return <circle key={item.day} cx={x} cy={y} r="4" className="chart-point"><title>{`${item.day}: $${item.amount}`}</title></circle>;
          })}
        </svg>
        <div className="chart-labels">{dailySales.map(({ day }) => <span key={day}>{day}</span>)}</div>
      </div>
    </Card>
  );
}
