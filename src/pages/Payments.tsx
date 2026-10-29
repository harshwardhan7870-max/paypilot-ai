import { useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { CheckCircle, Clock, RotateCcw } from "lucide-react";
import { mockPayments } from "../data/mockData";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/dashboard/StatCard";
import {
  capturePayPalOrder,
  createPayPalOrder,
  getPayPalConfig,
  type PayPalCaptureResult,
  type PayPalConfig,
} from "../services/api";

const ORDER_REFRESH_EVENT = "paypilot:orders-refresh";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function Payments() {
  const [payPalConfig, setPayPalConfig] = useState<PayPalConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [captureResult, setCaptureResult] = useState<PayPalCaptureResult | null>(null);

  useEffect(() => {
    let active = true;
    getPayPalConfig()
      .then((config) => {
        if (active) setPayPalConfig(config);
      })
      .catch((error: unknown) => {
        if (active) {
          setCheckoutError(error instanceof Error ? error.message : "Could not load PayPal sandbox settings.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingConfig(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const completedTotal = mockPayments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingTotal = mockPayments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const refundedTotal = mockPayments
    .filter((p) => p.status === "Refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="page-stack">
      <div className="welcome-row">
        <div>
          <h2>Payments</h2>
          <p>PayPal sandbox checkout and illustrative payment records.</p>
        </div>
        <span className="demo-pill">Sandbox only</span>
      </div>

      <Card className="paypal-checkout">
        <div className="section-heading">
          <div>
            <h2>Try a PayPal sandbox checkout</h2>
            <p>{payPalConfig?.description ?? "A fixed demo purchase; no real money is used."}</p>
          </div>
          <span className="status-badge status-badge--pending">SANDBOX</span>
        </div>
        {isLoadingConfig && <p className="stat-change">Checking server configuration…</p>}
        {!isLoadingConfig && checkoutError && (
          <p className="paypal-message paypal-message--error" role="alert">{checkoutError}</p>
        )}
        {!isLoadingConfig && payPalConfig && !payPalConfig.configured && (
          <p className="paypal-message" role="status">{payPalConfig.message}</p>
        )}
        {payPalConfig?.configured && payPalConfig.clientId && (
          <>
            <p className="paypal-amount">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: payPalConfig.currency,
              }).format(Number(payPalConfig.amount))}
            </p>
            <p className="paypal-disclaimer">
              Sandbox only. Sign in with a PayPal sandbox buyer account to approve the test payment.
            </p>
            <PayPalScriptProvider options={{
              clientId: payPalConfig.clientId,
              currency: payPalConfig.currency,
              intent: "capture",
            }}>
              <PayPalButtons
                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                createOrder={async () => {
                  setCheckoutError(null);
                  setCaptureResult(null);
                  return createPayPalOrder();
                }}
                onApprove={async (data) => {
                  try {
                    const result = await capturePayPalOrder(data.orderID);
                    setCaptureResult(result);
                    if (result.status !== "COMPLETED" || !result.captureId || !result.amount) {
                      setCheckoutError(`PayPal returned capture status ${result.status}; a completed capture was not confirmed.`);
                    } else {
                      setCheckoutError(null);
                      window.dispatchEvent(new CustomEvent(ORDER_REFRESH_EVENT));
                    }
                  } catch (error) {
                    setCheckoutError(error instanceof Error ? error.message : "PayPal sandbox capture failed.");
                  }
                }}
                onCancel={() => {
                  setCaptureResult(null);
                  setCheckoutError("Checkout was cancelled. No payment was captured.");
                }}
                onError={() => {
                  setCheckoutError("PayPal sandbox checkout encountered an error. Please try again.");
                }}
              />
            </PayPalScriptProvider>
          </>
        )}
        {captureResult?.status === "COMPLETED" && captureResult.captureId && captureResult.amount && (
          <p className="paypal-message paypal-message--success" role="status">
            PayPal sandbox capture completed: {currency.format(Number(captureResult.amount))} (capture {captureResult.captureId}).
          </p>
        )}
      </Card>

      {/* Summary stat cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <StatCard
          label="Completed (sample)"
          value={currency.format(completedTotal)}
          change="Illustrative completed payments"
          icon={<CheckCircle size={20} />}
          tone="green"
        />
        <StatCard
          label="Pending (sample)"
          value={currency.format(pendingTotal)}
          change="Awaiting mock capture"
          icon={<Clock size={20} />}
          tone="orange"
        />
        <StatCard
          label="Refunded (sample)"
          value={currency.format(refundedTotal)}
          change="Illustrative refund volume"
          icon={<RotateCcw size={20} />}
          tone="violet"
        />
      </div>

      {/* Payments table */}
      <Card>
        <div className="section-heading">
          <div>
            <h2>Payment activity</h2>
            <p>Illustrative data — not real PayPal transaction records</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Payment</th>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Method</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <strong>{payment.id}</strong>
                    <span className="table-subtitle">
                      {new Date(`${payment.date}T12:00:00`).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </td>
                  <td>{payment.orderId}</td>
                  <td>{payment.customer}</td>
                  <td>{payment.method}</td>
                  <td>{currency.format(payment.amount)}</td>
                  <td>
                    <span className={`status-badge status-badge--${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
