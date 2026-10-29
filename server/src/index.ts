import { config } from "dotenv";
import { resolve } from "node:path";
import { app } from "./app.js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../.env") });

const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

app.listen(port, "127.0.0.1", () => {
  console.log(`PayPilot API listening on http://127.0.0.1:${port}`);
});
