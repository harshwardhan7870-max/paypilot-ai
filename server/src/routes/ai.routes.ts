import { Router } from "express";
import {
  AI_MODEL,
  AI_PROVIDER,
  AiServiceError,
  answerOrderQuestion,
  getAiStatus,
  validateAiQuestion,
} from "../services/ai.service.js";

export const aiRouter = Router();

aiRouter.get("/status", (_request, response) => {
  response.json(getAiStatus());
});

aiRouter.post("/chat", async (request, response, next) => {
  let question: string;
  try {
    question = validateAiQuestion(request.body?.message);
  } catch (error) {
    if (error instanceof AiServiceError && error.statusCode === 400) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    next(error);
    return;
  }

  const controller = new AbortController();
  const abortIfDisconnected = () => controller.abort();
  const onResponseClose = () => {
    if (!response.writableEnded) controller.abort();
  };
  request.once("aborted", abortIfDisconnected);
  response.once("close", onResponseClose);

  try {
    const answer = await answerOrderQuestion(question, controller.signal);
    response.json({ answer, provider: AI_PROVIDER, model: AI_MODEL });
  } catch (error) {
    if (controller.signal.aborted || response.destroyed) return;
    next(error);
  } finally {
    request.removeListener("aborted", abortIfDisconnected);
    response.removeListener("close", onResponseClose);
  }
});
