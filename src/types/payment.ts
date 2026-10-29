export type PaymentStatus = "Completed" | "Pending" | "Refunded" | "Failed";

export interface Payment {
  id: string;
  orderId: string;
  customer: string;
  date: string;
  amount: number;
  method: string;
  status: PaymentStatus;
}
