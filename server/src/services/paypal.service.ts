const PAYPAL_API_BASE_URL = "https://api-m.sandbox.paypal.com";
const CHECKOUT_ITEM = {
  description: "PayPilot AI sandbox demo purchase",
  currency: "USD",
  amount: "5.00",
} as const;

interface PayPalAccessTokenResponse {
  access_token: string;
}

interface PayPalOrderResponse {
  id: string;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units?: {
    payments?: {
      captures?: {
        id?: string;
        status?: string;
        amount?: { value?: string };
      }[];
    };
  }[];
}

export class PayPalServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "PayPalServiceError";
  }
}

export function getPayPalDemoStatus() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const configured = Boolean(clientId && clientSecret);

  return {
    configured,
    environment: "sandbox" as const,
    clientId: configured ? clientId : null,
    currency: CHECKOUT_ITEM.currency,
    amount: CHECKOUT_ITEM.amount,
    description: CHECKOUT_ITEM.description,
    message: configured
      ? null
      : "Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the project root .env file.",
  };
}

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new PayPalServiceError(
      "PayPal sandbox is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the project root .env file.",
      503,
    );
  }

  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  let response: Response;

  try {
    response = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new PayPalServiceError("Could not reach PayPal sandbox.", 502);
  }

  if (!response.ok) {
    throw new PayPalServiceError(
      `PayPal sandbox token request failed (HTTP ${response.status}). Check the sandbox credentials.`,
      response.status === 401 ? 503 : 502,
    );
  }

  const data: unknown = await response.json().catch(() => null);
  if (
    typeof data !== "object" ||
    data === null ||
    !("access_token" in data) ||
    typeof (data as PayPalAccessTokenResponse).access_token !== "string"
  ) {
    throw new PayPalServiceError("PayPal sandbox returned an invalid access token response.", 502);
  }

  return (data as PayPalAccessTokenResponse).access_token;
}

async function postPayPal<T>(path: string, accessToken: string, body: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${PAYPAL_API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new PayPalServiceError("Could not reach PayPal sandbox.", 502);
  }

  if (!response.ok) {
    throw new PayPalServiceError(
      `PayPal sandbox request failed (HTTP ${response.status}).`,
      response.status === 401 ? 503 : 502,
    );
  }

  const data: unknown = await response.json().catch(() => null);
  if (typeof data !== "object" || data === null) {
    throw new PayPalServiceError("PayPal sandbox returned an invalid response.", 502);
  }
  return data as T;
}

export async function createPayPalOrder(): Promise<{ orderId: string }> {
  const accessToken = await getAccessToken();
  const order: unknown = await postPayPal<PayPalOrderResponse>("/v2/checkout/orders", accessToken, {
    intent: "CAPTURE",
    purchase_units: [
      {
        description: CHECKOUT_ITEM.description,
        amount: {
          currency_code: CHECKOUT_ITEM.currency,
          value: CHECKOUT_ITEM.amount,
        },
      },
    ],
  });

  if (
    typeof order !== "object" ||
    order === null ||
    !("id" in order) ||
    typeof (order as PayPalOrderResponse).id !== "string" ||
    (order as PayPalOrderResponse).id.length === 0
  ) {
    throw new PayPalServiceError("PayPal sandbox did not return an order ID.", 502);
  }

  return { orderId: (order as PayPalOrderResponse).id };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  orderId: string;
  status: string;
  captureId: string | null;
  amount: string | null;
}> {
  if (!/^[A-Z0-9-]{1,64}$/i.test(orderId)) {
    throw new PayPalServiceError("A valid PayPal order ID is required.", 400);
  }

  const accessToken = await getAccessToken();
  const capture: unknown = await postPayPal<PayPalCaptureResponse>(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    accessToken,
    {},
  );
  if (typeof capture !== "object" || capture === null || !("status" in capture)) {
    throw new PayPalServiceError("PayPal sandbox returned an invalid capture response.", 502);
  }

  const paypalCapture = capture as PayPalCaptureResponse;
  const paymentCapture = paypalCapture.purchase_units?.[0]?.payments?.captures?.[0];
  if (typeof paypalCapture.id !== "string" || typeof paypalCapture.status !== "string") {
    throw new PayPalServiceError("PayPal sandbox returned an invalid capture response.", 502);
  }

  return {
    orderId: paypalCapture.id,
    status: paymentCapture?.status ?? paypalCapture.status,
    captureId: paymentCapture?.id ?? null,
    amount: paymentCapture?.amount?.value ?? null,
  };
}
