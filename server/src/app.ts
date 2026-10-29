import cors from "cors";
import express from "express";
import { aiRouter } from "./routes/ai.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { paypalRouter } from "./routes/paypal.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://127.0.0.1:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", message: "PayPilot API scaffold is running." });
});

app.use("/api/orders", ordersRouter);
app.use("/api/ai", aiRouter);
app.use("/api/paypal", paypalRouter);
app.use(errorHandler);
