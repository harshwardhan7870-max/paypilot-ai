import type { ErrorRequestHandler } from "express";
import { PayPalServiceError } from "../services/paypal.service.js";
import { AiServiceError } from "../services/ai.service.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AiServiceError) {
    response.status(error.statusCode).json({ error: error.message, code: error.code });
    return;
  }

  if (error instanceof PayPalServiceError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error("Unhandled API error:", error);
  response.status(500).json({ error: "An unexpected server error occurred." });
};
