# PayPilot AI

A beginner-friendly React + TypeScript dashboard and Express API scaffold for a small-business order and payment assistant.

> PayPilot AI uses PayPal sandbox checkout and Google Gemini-powered order/sales chat. Sandbox transactions are not real-money transactions; AI responses use the current sample data.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Get started

1. Install the root and workspace dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` in the project root. Add your PayPal sandbox app Client ID and Secret from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox/) to `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`. Create a Google Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey) and add it as `AI_API_KEY`. These credentials are used only by the backend; never put them in a `VITE_*` variable or commit `.env`.

3. Start the frontend:

   ```bash
   npm run dev
   ```

   Open the URL printed by Vite (normally `http://127.0.0.1:5173`).

4. In a separate terminal, start the API:

   ```bash
   npm run dev:server
   ```

   The API listens on `http://127.0.0.1:3001` by default.

   To start both processes together, run `npm run dev:all`.

## Checks and production build

```bash
npm run typecheck
npm run build
```

## Project layout

- `src/` — React application, reusable components, sample data and API client.
- `server/src/` — Express API routes and service placeholders.
- `public/` — app logo and favicon.

## Integration status

- **Orders and sales summary:** the Dashboard, Orders, and Sales summary pages fetch illustrative demo orders from `GET /api/orders`; the server currently uses an in-memory sample list.
- **Payments:** the Payments page offers a fixed $5.00 USD PayPal sandbox checkout. Use a sandbox personal account to approve the test payment; sandbox transactions do not move real money. The payment activity table remains illustrative sample data.
- **AI assistant:** sends the question, current demo orders (without customer emails), and derived last-seven-day sales data to Google Gemini using `gemini-flash-latest`. Configure `AI_API_KEY` in the root `.env`; the status indicator confirms that a key is present, while Google validates it when you send a question. If the key is rejected, update it and restart the backend. Usage is subject to your Google AI account's pricing and limits.
- **AI reliability:** retries transient Gemini capacity, rate-limit, server, and explicitly classified transient network failures up to three attempts per model with 1-second and 2-second exponential delays. Unclassified network failures are surfaced without retrying. A valid `Retry-After` is honored up to 10 seconds; longer requests are not retried. After primary-model failures it discovers `generateContent`-compatible Flash models with ListModels, preferring Flash Lite; it caches compatible IDs for 15 minutes. `AI_MAX_FALLBACK_MODELS` controls the fallback count (default 2, maximum 5). Requests have a 30-second per-call timeout and a 90-second overall deadline. Authentication, permission, and malformed-request errors do not trigger retries or model fallback.
- **PayPal:** checkout order creation and capture use PayPal's sandbox Orders API. The browser receives only the public client ID; the client secret stays in the backend environment.
- **Secrets:** keep provider credentials in backend-only environment variables. Never add secret values to `VITE_*` variables or commit them.
