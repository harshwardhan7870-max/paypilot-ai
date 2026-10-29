import { Router } from "express";
import { addOrderIfMissing } from "../data/demoOrders.js";
import {
  capturePayPalOrder,
  createPayPalOrder,
  getPayPalDemoStatus,
  PayPalServiceError,
} from "../services/paypal.service.js";

export const paypalRouter = Router();

paypalRouter.get("/status", (_request, response) => {
  response.json(getPayPalDemoStatus());
});

paypalRouter.post("/orders", async (_request, response, next) => {
  try {
    response.status(201).json(await createPayPalOrder());
  } catch (error) {
    next(error);
  }
});

paypalRouter.post("/capture", async (request, response, next) => {
  const orderId: unknown = request.body?.orderId;
  if (typeof orderId !== "string") {
    response.status(400).json({ error: "A PayPal orderId is required." });
    return;
  }

  try {
    const capture = await capturePayPalOrder(orderId);
    const captureAmount = Number(capture.amount ?? 0);
    if (capture.status === "COMPLETED" && capture.captureId && Number.isFinite(captureAmount)) {
      addOrderIfMissing({
        id: capture.captureId,
        customer: "PayPal Sandbox Buyer",
        email: "",
        date: new Date().toISOString().slice(0, 10),
        amount: captureAmount,
        status: "Paid",
        item: "PayPilot Demo Purchase",
        source: "paypal-sandbox",
      });
    }
    response.json(capture);
  } catch (error) {
    if (error instanceof PayPalServiceError && error.statusCode === 400) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
  }
});
