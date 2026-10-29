import type { Order } from "../types/order";

export interface DailySales {
  date: string;
  day: string;
  amount: number;
}

export function getLastSevenDaysSales(
  orders: Order[],
  referenceDate = new Date(),
): DailySales[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(referenceDate);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      date: dateKey,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      amount: orders
        .filter((order) => order.date === dateKey && order.status === "Paid")
        .reduce((total, order) => total + order.amount, 0),
    };
  });
}
