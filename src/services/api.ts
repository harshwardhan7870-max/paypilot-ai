import type { Order, OrderStatus } from "../types/order";

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------
// In development the Vite proxy forwards /api/* → http://127.0.0.1:3001,
// so we use an empty string here (relative URLs work correctly).
// In production set VITE_API_BASE_URL to your deployed API origin.
const API_BASE =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, "")
    : "";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

// ---------------------------------------------------------------------------
// Generic fetch helper
// ---------------------------------------------------------------------------
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (networkError) {
    // Network-level failure (server down, no connection, etc.)
    throw new Error(
      "Could not reach the server. Make sure the API is running on port 3001.",
    );
  }

  if (!response.ok) {
    // Try to extract an error message from the JSON body, fall back to status text.
    let detail = response.statusText;
    let code: string | undefined;
    try {
      const body = (await response.json()) as { error?: string; code?: string };
      if (typeof body.error === "string") detail = body.error;
      if (typeof body.code === "string") code = body.code;
    } catch {
      // Body is not JSON — use status text as-is.
    }
    throw new ApiRequestError(`API error ${response.status}: ${detail}`, response.status, code);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// /api/health
// ---------------------------------------------------------------------------
export interface ApiStatus {
  status: string;
  message: string;
}

export function getApiStatus(): Promise<ApiStatus> {
  return request<ApiStatus>("/api/health");
}

// ---------------------------------------------------------------------------
// /api/ai
// ---------------------------------------------------------------------------

export interface AiStatus {
  configured: boolean;
  provider: string;
  model: string;
  message: string | null;
}

export interface AiChatResponse {
  answer: string;
  provider: string;
  model: string;
}

export function getAiStatus(): Promise<AiStatus> {
  return request<AiStatus>("/api/ai/status");
}

export function askAiQuestion(message: string): Promise<AiChatResponse> {
  return request<AiChatResponse>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// ---------------------------------------------------------------------------
// /api/paypal
// ---------------------------------------------------------------------------

export interface PayPalConfig {
  configured: boolean;
  environment: "sandbox";
  clientId: string | null;
  currency: string;
  amount: string;
  description: string;
  message: string | null;
}

export interface PayPalCaptureResult {
  orderId: string;
  status: string;
  captureId: string | null;
  amount: string | null;
}

export function getPayPalConfig(): Promise<PayPalConfig> {
  return request<PayPalConfig>("/api/paypal/status");
}

export async function createPayPalOrder(): Promise<string> {
  const result = await request<{ orderId: string }>("/api/paypal/orders", {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (typeof result.orderId !== "string" || result.orderId.length === 0) {
    throw new Error("PayPal did not return an order ID.");
  }
  return result.orderId;
}

export function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResult> {
  return request<PayPalCaptureResult>("/api/paypal/capture", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

// ---------------------------------------------------------------------------
// /api/orders
// ---------------------------------------------------------------------------

/** Shape returned by GET /api/orders */
interface OrdersResponse {
  source: string;
  note: string;
  orders: Order[];
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return value === "Paid" || value === "Pending" || value === "Refunded" || value === "Cancelled";
}

function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;

  const order = value as Record<string, unknown>;
  return (
    typeof order.id === "string" &&
    typeof order.customer === "string" &&
    typeof order.email === "string" &&
    typeof order.date === "string" &&
    typeof order.amount === "number" &&
    Number.isFinite(order.amount) &&
    isOrderStatus(order.status) &&
    typeof order.item === "string"
  );
}

function isOrdersResponse(value: unknown): value is OrdersResponse {
  if (typeof value !== "object" || value === null) return false;

  const response = value as Record<string, unknown>;
  return (
    typeof response.source === "string" &&
    typeof response.note === "string" &&
    Array.isArray(response.orders) &&
    response.orders.every(isOrder)
  );
}

/**
 * Fetch the order list from GET /api/orders.
 * Validates that the response contains an `orders` array before returning it.
 * Throws a descriptive Error on network failure, non-2xx status, or bad shape.
 */
export async function getOrders(): Promise<Order[]> {
  const data = await request<unknown>("/api/orders");

  if (!isOrdersResponse(data)) {
    throw new Error(
      "Invalid response from /api/orders: expected source, note, and valid order records.",
    );
  }

  return data.orders;
}
