import { useCallback, useEffect, useReducer } from "react";
import type { Order } from "../types/order";
import { getOrders } from "../services/api";

const ORDER_REFRESH_EVENT = "paypilot:orders-refresh";

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; orders: Order[] }
  | { status: "error"; message: string };

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; orders: Order[] }
  | { type: "FETCH_ERROR"; message: string };

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { status: "loading" };
    case "FETCH_SUCCESS":
      return { status: "success", orders: action.orders };
    case "FETCH_ERROR":
      return { status: "error", message: action.message };
  }
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface UseOrdersResult {
  /** The fetched orders. Empty array while loading or on error. */
  orders: Order[];
  isLoading: boolean;
  /** Human-readable error message, or null when there is no error. */
  error: string | null;
  /** Call to re-run the fetch after an error. */
  retry: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetches orders from GET /api/orders.
 *
 * Falls back gracefully on network errors and invalid server responses.
 * The Vite dev proxy forwards /api/* → http://127.0.0.1:3001 so no
 * cross-origin configuration is needed during development.
 */
export function useOrders(): UseOrdersResult {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });

  const fetchOrders = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const orders = await getOrders();
      dispatch({ type: "FETCH_SUCCESS", orders });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading orders.";
      dispatch({ type: "FETCH_ERROR", message });
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    const refreshListener = () => {
      void fetchOrders();
    };

    window.addEventListener(ORDER_REFRESH_EVENT, refreshListener);
    return () => {
      window.removeEventListener(ORDER_REFRESH_EVENT, refreshListener);
    };
  }, [fetchOrders]);

  return {
    orders: state.status === "success" ? state.orders : [],
    isLoading: state.status === "loading" || state.status === "idle",
    error: state.status === "error" ? state.message : null,
    retry: fetchOrders,
  };
}
