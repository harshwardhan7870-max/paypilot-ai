import type { Order } from "../../types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrdersTableProps {
  orders: Order[];
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Date</th><th scope="col">Amount</th><th scope="col">Status</th></tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><strong>{order.id}</strong><span className="table-subtitle">{order.item}</span></td>
              <td><strong>{order.customer}</strong><span className="table-subtitle">{order.email}</span></td>
              <td>{new Date(`${order.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
              <td>{currency.format(order.amount)}</td>
              <td><OrderStatusBadge status={order.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
