import type { OrderStatus } from "../../types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{status}</span>;
}
