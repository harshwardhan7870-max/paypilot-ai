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
