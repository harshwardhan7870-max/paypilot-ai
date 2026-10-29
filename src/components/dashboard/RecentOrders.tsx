import { ArrowRight } from "lucide-react";
import type { Order } from "../../types/order";
import { OrdersTable } from "../orders/OrdersTable";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface RecentOrdersProps {
  orders: Order[];
  onViewAll: () => void;
}

export function RecentOrders({ orders, onViewAll }: RecentOrdersProps) {
  return (
    <Card className="recent-orders">
      <div className="section-heading">
        <div><h2>Recent orders</h2><p>Your latest customer activity</p></div>
        <Button variant="ghost" onClick={onViewAll}>View all <ArrowRight size={16} /></Button>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No recent orders</p>
          <p className="empty-state__body">New orders will appear here when available.</p>
        </div>
      ) : (
        <OrdersTable orders={orders.slice(0, 5)} />
      )}
    </Card>
  );
}
