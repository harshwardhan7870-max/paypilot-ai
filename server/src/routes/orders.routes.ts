import { Router } from "express";
import { demoOrders } from "../data/demoOrders.js";
import type { OrdersResponse } from "../types/order.js";

export const ordersRouter = Router();

/**
 * GET /api/orders
 *
 * Returns the demo order list. All records are sample data — no real orders
 * or financial data are included. Replace `demoOrders` with a real database
 * query when persistence is added in a future stage.
 */
ordersRouter.get("/", (_request, response) => {
  const body: OrdersResponse = {
    source: "demo",
    note: "Sample data — not real orders.",
    orders: demoOrders,
  };
  response.json(body);
});
