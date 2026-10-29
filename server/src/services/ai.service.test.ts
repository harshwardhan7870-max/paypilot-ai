import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  AI_BUSY_MESSAGE,
  AI_MODEL,
  AiServiceError,
  createAiService,
} from "./ai.service.js";

const TEST_KEY = "unit-test-key-never-real";
const originalKey = process.env.AI_API_KEY;
const originalConsoleError = console.error;
let logs: string[];

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function generatedResponse(text = "OK"): Response {
  return jsonResponse({
    candidates: [{ content: { parts: [{ text }] } }],
  });
}

function googleError(status: number, message: string, googleStatus = "UNAVAILABLE"): Response {
  return jsonResponse({
    error: { code: status, status: googleStatus, message },
  }, status);
}

function listModels(models: unknown[]): Response {
  return jsonResponse({ models });
}

const liteModel = {
  name: "models/gemini-flash-lite-test",
  supportedGenerationMethods: ["generateContent"],
};
const flashModel = {
  name: "models/gemini-flash-test",
  supportedGenerationMethods: ["generateContent"],
};

function service(
  fetcher: typeof fetch,
  options: Parameters<typeof createAiService>[0] = {},
) {
  return createAiService({
    fetcher,
    sleep: async () => {},
    ...options,
  });
}

beforeEach(() => {
  process.env.AI_API_KEY = TEST_KEY;
  logs = [];
  console.error = (...parts: unknown[]) => logs.push(parts.join(" "));
});

afterEach(() => {
  if (originalKey === undefined) delete process.env.AI_API_KEY;
  else process.env.AI_API_KEY = originalKey;
  console.error = originalConsoleError;
});

test("primary model succeeds on the first attempt using the key header", async () => {
  let requests = 0;
  let requestUrl = "";
  let requestHeaders: HeadersInit | undefined;
  const ai = service(async (input, init) => {
    requests += 1;
    requestUrl = String(input);
    requestHeaders = init?.headers;
    return generatedResponse();
  });

  assert.equal(await ai.answerOrderQuestion("Reply briefly"), "OK");
  assert.equal(requests, 1);
  assert.match(requestUrl, new RegExp(`/models/${AI_MODEL}:generateContent$`));
  assert.equal(new Headers(requestHeaders).get("x-goog-api-key"), TEST_KEY);
  assert(!requestUrl.includes(TEST_KEY));
});

test("503 retries once after one second and returns the successful response", async () => {
  let generationRequests = 0;
  const delays: number[] = [];
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([]);
    generationRequests += 1;
    return generationRequests === 1 ? googleError(503, "Temporary overload") : generatedResponse();
  }, { sleep: async (milliseconds) => { delays.push(milliseconds); } });

  assert.equal(await ai.answerOrderQuestion("Question"), "OK");
  assert.equal(generationRequests, 2);
  assert.deepEqual(delays, [1000]);
});

test("500 uses the same bounded retry budget for one model", async () => {
  let generationRequests = 0;
  const delays: number[] = [];
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([]);
    generationRequests += 1;
    return googleError(500, "Internal server error", "INTERNAL");
  }, { sleep: async (milliseconds) => { delays.push(milliseconds); } });

  await assert.rejects(ai.answerOrderQuestion("Question"), { message: AI_BUSY_MESSAGE });
  assert.equal(generationRequests, 3);
  assert.deepEqual(delays, [1000, 2000]);
});

test("Retry-After is respected when it is within the bounded safety limit", async () => {
  let generationRequests = 0;
  const delays: number[] = [];
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([]);
    generationRequests += 1;
    return generationRequests === 1
      ? new Response(JSON.stringify({
          error: { code: 503, status: "UNAVAILABLE", message: "Temporary overload" },
        }), { status: 503, headers: { "Retry-After": "3", "Content-Type": "application/json" } })
      : generatedResponse();
  }, { sleep: async (milliseconds) => { delays.push(milliseconds); } });

  assert.equal(await ai.answerOrderQuestion("Question"), "OK");
  assert.equal(generationRequests, 2);
  assert.deepEqual(delays, [3000]);
});

test("Retry-After above the safety limit prevents another attempt", async () => {
  let generationRequests = 0;
  const delays: number[] = [];
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([]);
    generationRequests += 1;
    return new Response(JSON.stringify({
      error: { code: 503, status: "UNAVAILABLE", message: "Temporary overload" },
    }), { status: 503, headers: { "Retry-After": "11", "Content-Type": "application/json" } });
  }, { sleep: async (milliseconds) => { delays.push(milliseconds); } });

  await assert.rejects(ai.answerOrderQuestion("Question"), { message: AI_BUSY_MESSAGE });
  assert.equal(generationRequests, 1);
  assert.deepEqual(delays, []);
  assert(logs.some((entry) => entry.includes("retry-after-exceeds-safe-limit")));
});

test("429 exhausts primary attempts then falls back to a discovered flash-lite model", async () => {
  const generatedModels: string[] = [];
  const delays: number[] = [];
  const ai = service(async (input, init) => {
    const url = String(input);
    if (init?.method !== "POST") {
      return listModels([flashModel, liteModel]);
    }
    generatedModels.push(url);
    if (url.endsWith(`/models/${AI_MODEL}:generateContent`)) {
      return googleError(429, "High demand");
    }
    return generatedResponse("Fallback answer");
  }, { sleep: async (milliseconds) => { delays.push(milliseconds); } });

  assert.equal(await ai.answerOrderQuestion("Question"), "Fallback answer");
  assert.equal(generatedModels.filter((url) => url.endsWith(`/${AI_MODEL}:generateContent`)).length, 3);
  assert.match(generatedModels.at(-1) ?? "", /models\/gemini-flash-lite-test:generateContent$/);
  assert.deepEqual(delays, [1000, 2000]);
});

test("400 is not retried and does not start fallback discovery", async () => {
  let requests = 0;
  const ai = service(async () => {
    requests += 1;
    return googleError(400, "Malformed request", "INVALID_ARGUMENT");
  });

  await assert.rejects(
    ai.answerOrderQuestion("Question"),
    (error: unknown) => error instanceof AiServiceError && error.code === "AI_REQUEST_ERROR",
  );
  assert.equal(requests, 1);
});

test("authentication failure does not start a pointless fallback chain", async () => {
  let requests = 0;
  const ai = service(async () => {
    requests += 1;
    return googleError(403, "Permission denied", "PERMISSION_DENIED");
  });

  await assert.rejects(
    ai.answerOrderQuestion("Question"),
    (error: unknown) => error instanceof AiServiceError && error.code === "AI_CONFIGURATION_ERROR",
  );
  assert.equal(requests, 1);
});

test("ListModels filters unsupported models and prioritizes flash-lite", async () => {
  const generatedModels: string[] = [];
  const modelList = [
    { name: "models/text-embedding-test", supportedGenerationMethods: ["embedContent"] },
    { name: "models/gemini-image-test", supportedGenerationMethods: ["generateContent"] },
    { name: "models/gemini-tts-test", supportedGenerationMethods: ["generateContent"] },
    { name: "models/gemini-pro-test", supportedGenerationMethods: ["generateContent"] },
    flashModel,
    liteModel,
  ];
  const ai = service(async (input, init) => {
    const url = String(input);
    if (init?.method !== "POST") return listModels(modelList);
    generatedModels.push(url);
    return url.endsWith(`/models/${AI_MODEL}:generateContent`)
      ? googleError(503, "Service unavailable")
      : generatedResponse("Lite fallback");
  });

  assert.equal(await ai.answerOrderQuestion("Question"), "Lite fallback");
  assert.match(generatedModels.at(-1) ?? "", /models\/gemini-flash-lite-test:generateContent$/);
});

test("a model-specific 404 moves to a discovered fallback without retrying that model", async () => {
  const generationModels: string[] = [];
  const ai = service(async (input, init) => {
    const url = String(input);
    if (init?.method !== "POST") return listModels([liteModel]);
    generationModels.push(url);
    return url.endsWith(`/models/${AI_MODEL}:generateContent`)
      ? googleError(404, "Model not found", "NOT_FOUND")
      : generatedResponse("Fallback succeeded");
  });

  assert.equal(await ai.answerOrderQuestion("Question"), "Fallback succeeded");
  assert.equal(generationModels.length, 2);
  assert.match(generationModels[1], /models\/gemini-flash-lite-test:generateContent$/);
});

test("fallback candidate cap is configurable and bounded", async () => {
  const previous = process.env.AI_MAX_FALLBACK_MODELS;
  delete process.env.AI_MAX_FALLBACK_MODELS;
  const attemptedModels: string[] = [];
  const ai = service(async (input, init) => {
    const url = String(input);
    if (init?.method !== "POST") {
      return listModels([
        flashModel,
        liteModel,
        { ...liteModel, name: "models/gemini-2.5-flash-lite" },
      ]);
    }
    attemptedModels.push(url);
    return googleError(url.endsWith(`/models/${AI_MODEL}:generateContent`) ? 503 : 404,
      "Model unavailable", "NOT_FOUND");
  });

  try {
    process.env.AI_MAX_FALLBACK_MODELS = "1";
    await assert.rejects(ai.answerOrderQuestion("Question"), { message: AI_BUSY_MESSAGE });
    assert.equal(attemptedModels.length, 4);
    assert.match(attemptedModels[3], /models\/gemini-2\.5-flash-lite:generateContent$/);
  } finally {
    if (previous === undefined) delete process.env.AI_MAX_FALLBACK_MODELS;
    else process.env.AI_MAX_FALLBACK_MODELS = previous;
  }
});

test("ListModels failure keeps the primary attempt policy and returns a safe busy error", async () => {
  let primaryRequests = 0;
  let listRequests = 0;
  const ai = service(async (_input, init) => {
    if (init?.method === "POST") {
      primaryRequests += 1;
      return googleError(503, "Temporary capacity issue");
    }
    listRequests += 1;
    return googleError(403, "ListModels denied", "PERMISSION_DENIED");
  });

  await assert.rejects(
    ai.answerOrderQuestion("Question"),
    (error: unknown) => error instanceof AiServiceError &&
      error.message === AI_BUSY_MESSAGE &&
      error.code === "AI_TEMPORARILY_UNAVAILABLE",
  );
  assert.equal(primaryRequests, 3);
  assert.equal(listRequests, 1);
});

test("fallback candidates are deduplicated and ListModels results are cached", async () => {
  let listRequests = 0;
  let liteRequests = 0;
  const ai = service(async (input, init) => {
    const url = String(input);
    if (init?.method !== "POST") {
      listRequests += 1;
      return listModels([liteModel, liteModel, flashModel]);
    }
    if (url.endsWith(`/models/${AI_MODEL}:generateContent`)) {
      return googleError(503, "Temporary overload");
    }
    liteRequests += 1;
    return generatedResponse("Fallback");
  });

  assert.equal(await ai.answerOrderQuestion("First question"), "Fallback");
  assert.equal(await ai.answerOrderQuestion("Second question"), "Fallback");
  assert.equal(listRequests, 1);
  assert.equal(liteRequests, 2);
});

test("all model failures return the exact friendly message and logs redact the key", async () => {
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([liteModel, flashModel]);
    return googleError(503, `temporary outage mentions ${TEST_KEY}`);
  });

  await assert.rejects(
    ai.answerOrderQuestion("Question"),
    (error: unknown) => error instanceof AiServiceError &&
      error.message === AI_BUSY_MESSAGE &&
      error.code === "AI_TEMPORARILY_UNAVAILABLE",
  );
  assert.equal(logs.some((entry) => entry.includes(TEST_KEY)), false);
  assert(logs.some((entry) => entry.includes("[REDACTED]")));
});

test("request timeout retries are bounded and return a safe busy error", async () => {
  let generationRequests = 0;
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([]);
    generationRequests += 1;
    return new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener(
        "abort",
        () => reject(new DOMException("Aborted", "AbortError")),
        { once: true },
      );
    });
  }, {
    requestTimeoutMs: 5,
    sleep: async () => {},
  });

  await assert.rejects(
    ai.answerOrderQuestion("Question"),
    (error: unknown) => error instanceof AiServiceError && error.message === AI_BUSY_MESSAGE,
  );
  assert.equal(generationRequests, 3);
  assert(logs.some((entry) => entry.includes("request-timeout")));
});

test("network failures retain nested error codes and retry only within the model budget", async () => {
  let generationRequests = 0;
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([]);
    generationRequests += 1;
    const cause = Object.assign(new Error("Name lookup failed"), { code: "ENOTFOUND" });
    throw new TypeError("fetch failed", { cause });
  });

  await assert.rejects(ai.answerOrderQuestion("Question"), { message: AI_BUSY_MESSAGE });
  assert.equal(generationRequests, 3);
  assert(logs.some((entry) => entry.includes("ENOTFOUND")));
  assert.equal(logs.some((entry) => entry.includes(TEST_KEY)), false);
});

test("unclassified network errors are not retried or sent through model fallback", async () => {
  let generationRequests = 0;
  let listRequests = 0;
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") {
      listRequests += 1;
      return listModels([liteModel]);
    }
    generationRequests += 1;
    throw new TypeError("fetch failed", {
      cause: Object.assign(new Error("Certificate expired"), { code: "CERT_HAS_EXPIRED" }),
    });
  });

  await assert.rejects(
    ai.answerOrderQuestion("Question"),
    (error: unknown) => error instanceof AiServiceError && error.code === "AI_REQUEST_ERROR",
  );
  assert.equal(generationRequests, 1);
  assert.equal(listRequests, 0);
  assert(logs.some((entry) => entry.includes("network-failure-non-retryable")));
});

test("client cancellation stops before any generation request", async () => {
  let requests = 0;
  const ai = service(async () => {
    requests += 1;
    return generatedResponse();
  });
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    ai.answerOrderQuestion("Question", controller.signal),
    (error: unknown) => error instanceof AiServiceError && error.code === "AI_REQUEST_CANCELLED",
  );
  assert.equal(requests, 0);
});

test("cancellation during backoff stops before another generation attempt", async () => {
  let generationRequests = 0;
  const controller = new AbortController();
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([]);
    generationRequests += 1;
    return googleError(503, "Temporary overload");
  }, {
    sleep: async () => controller.abort(),
  });

  await assert.rejects(
    ai.answerOrderQuestion("Question", controller.signal),
    (error: unknown) => error instanceof AiServiceError && error.code === "AI_REQUEST_CANCELLED",
  );
  assert.equal(generationRequests, 1);
});

test("maximum total attempts and exponential backoff delays are bounded", async () => {
  let generationRequests = 0;
  const delays: number[] = [];
  let clock = 0;
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([liteModel, flashModel]);
    generationRequests += 1;
    return googleError(503, "Overloaded");
  }, {
    now: () => clock,
    sleep: async (milliseconds) => {
      delays.push(milliseconds);
      clock += milliseconds;
    },
    overallDeadlineMs: 90_000,
  });

  await assert.rejects(ai.answerOrderQuestion("Question"), {
    message: AI_BUSY_MESSAGE,
  });
  assert.equal(generationRequests, 9);
  assert.deepEqual(delays, [1000, 2000, 1000, 2000, 1000, 2000]);
});

test("an overall deadline prevents extra attempts and retries", async () => {
  let generationRequests = 0;
  const delays: number[] = [];
  let clock = 0;
  const ai = service(async (_input, init) => {
    if (init?.method !== "POST") return listModels([]);
    generationRequests += 1;
    return googleError(503, "Capacity unavailable");
  }, {
    now: () => clock,
    sleep: async (milliseconds) => {
      delays.push(milliseconds);
      clock += milliseconds;
    },
    overallDeadlineMs: 1500,
  });

  await assert.rejects(ai.answerOrderQuestion("Question"), {
    message: AI_BUSY_MESSAGE,
  });
  assert.equal(generationRequests, 2);
  assert.deepEqual(delays, [1000]);
});
