// Server-side copy of the Order types.
// Keep in sync with src/types/order.ts in the frontend.

export type OrderStatus = "Paid" | "Pending" | "Refunded" | "Cancelled";

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  amount: number;
  status: OrderStatus;
  item: string;
}

export interface OrdersResponse {
  source: "demo";
  note: string;
  orders: Order[];
}
