import { Router } from "express";
import { demoOrders } from "../data/demoOrders.js";
import type { OrdersResponse } from "../types/order.js";

export const ordersRouter = Router();

/**
 * GET /api/orders
 *
 * Returns the shared in-memory order list. Demo orders and PayPal sandbox
 * captures are stored together so the UI refreshes with the latest data.
 */
ordersRouter.get("/", (_request, response) => {
  const body: OrdersResponse = {
    source: "demo",
    note: "Demo and sandbox order data.",
    orders: demoOrders,
  };
  response.json(body);
});
