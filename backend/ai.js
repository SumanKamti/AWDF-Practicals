const { GoogleGenAI } = require("@google/genai");
const NodeCache = require("node-cache");

// Rate limit cache: 60 seconds TTL per task / user+title
const aiRateLimitCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

// Verified official Google Gemini model family supported by @google/genai
const SUPPORTED_MODELS = Object.freeze(["gemini-3.8-flash", "gemini-2.5-flash"]);

/**
 * Generate rate limit cache key
 * Uses taskId if present, or userId + normalized title
 */
function getRateLimitKey(userId, title, taskId = null) {
  if (taskId !== null && taskId !== undefined && String(taskId).trim() !== "") {
    return `ai:rate:${userId}:task:${String(taskId).trim()}`;
  }
  const normalizedTitle = String(title || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 100);
  return `ai:rate:${userId}:title:${normalizedTitle}`;
}

/**
 * Check if the user has reached the rate limit (1 request per task per minute)
 */
function checkRateLimit(userId, title, taskId = null) {
  const key = getRateLimitKey(userId, title, taskId);
  const exists = aiRateLimitCache.has(key);
  if (exists) {
    const ttl = aiRateLimitCache.getTtl(key);
    const secondsRemaining = ttl ? Math.max(1, Math.ceil((ttl - Date.now()) / 1000)) : 60;
    return { limited: true, key, secondsRemaining };
  }
  return { limited: false, key };
}

/**
 * Set rate limit key for 60 seconds
 */
function recordRateLimit(key) {
  aiRateLimitCache.set(key, true);
}

/**
 * Clear rate limit key (e.g. on error so user is not penalized)
 */
function clearRateLimit(key) {
  aiRateLimitCache.del(key);
}

/**
 * Flush all rate limits (useful for testing)
 */
function resetRateLimits() {
  aiRateLimitCache.flushAll();
}

/**
 * Resolve the primary Gemini model name to use.
 * Order of precedence: options.modelName > process.env.GEMINI_MODEL > "gemini-3.8-flash"
 * @param {object} options
 * @returns {string}
 */
function getResolvedModel(options = {}) {
  const model = options.modelName || process.env.GEMINI_MODEL || "gemini-3.8-flash";
  return String(model).trim();
}

/**
 * Build the ordered list of model candidates to try.
 * Prioritizes the user/env configured model, then falls back to verified alternatives.
 * @param {object} options
 * @returns {string[]}
 */
function getModelCandidateList(options = {}) {
  if (Array.isArray(options.models) && options.models.length > 0) {
    return options.models.map((m) => String(m).trim()).filter(Boolean);
  }
  const preferred = getResolvedModel(options);
  const candidates = [preferred];
  for (const fallback of SUPPORTED_MODELS) {
    if (!candidates.includes(fallback)) {
      candidates.push(fallback);
    }
  }
  return candidates;
}

/**
 * Safely parse and extract error details from raw exception / API error.
 * Handles both plain Error objects and JSON-encoded error strings returned by @google/genai.
 */
function extractErrorDetails(err) {
  let message = err?.message || String(err || "");
  let statusCode = err?.status || err?.statusCode || null;
  let statusText = err?.statusText || "";

  if (typeof message === "string") {
    const trimmed = message.trim();
    if (trimmed.startsWith("{") && (trimmed.includes('"message"') || trimmed.includes('"error"'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.error) {
          if (parsed.error.message) message = parsed.error.message;
          if (parsed.error.code) statusCode = parsed.error.code;
          if (parsed.error.status) statusText = parsed.error.status;
        }
      } catch (_) {}
    }
  }

  return { message, statusCode, statusText };
}

/**
 * Classify Gemini API errors into actionable categories and determine retryability.
 * Auth errors and quota exhaustion are NOT retryable.
 * Capacity overloads (503 UNAVAILABLE), missing models (404), and temporary network glitches ARE retryable via fallback model.
 */
function classifyAiError(rawError) {
  if (rawError?.status && rawError?.code && rawError?.isFormattedAiError) {
    return { error: rawError, isRetryable: false };
  }

  const { message: rawMessage, statusCode, statusText } = extractErrorDetails(rawError);
  const msg = (rawMessage + " " + statusText).toLowerCase();

  // 1. Invalid or unauthorized API key (401 / 403) - DO NOT RETRY
  if (
    statusCode === 401 ||
    statusCode === 403 ||
    msg.includes("api_key") ||
    msg.includes("api key") ||
    msg.includes("api_key_invalid") ||
    msg.includes("unregistered") ||
    msg.includes("unauthorized")
  ) {
    const err = new Error("Invalid or unauthorized Gemini API key. Please verify your GEMINI_API_KEY in backend/.env.");
    err.status = 401;
    err.code = "AI_AUTH_ERROR";
    err.isFormattedAiError = true;
    return { error: err, isRetryable: false };
  }

  // 2. Quota / Rate limit exceeded (429 / RESOURCE_EXHAUSTED) - DO NOT RETRY
  if (
    statusCode === 429 ||
    statusText === "RESOURCE_EXHAUSTED" ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit")
  ) {
    const err = new Error("Gemini API rate limit or quota exceeded. Please wait a minute or check your quota.");
    err.status = 429;
    err.code = "AI_QUOTA_EXCEEDED";
    err.isFormattedAiError = true;
    return { error: err, isRetryable: false };
  }

  // 3. Client Validation Error (400) - DO NOT RETRY
  if (statusCode === 400 || rawError?.code === "INVALID_TITLE") {
    const err = new Error(rawMessage || "Invalid request to Gemini AI.");
    err.status = 400;
    err.code = rawError?.code || "INVALID_REQUEST";
    err.isFormattedAiError = true;
    return { error: err, isRetryable: false };
  }

  // 4. Model not found or unsupported (404 / NOT_FOUND) - RETRY WITH FALLBACK MODEL
  if (
    statusCode === 404 ||
    statusText === "NOT_FOUND" ||
    msg.includes("not_found") ||
    msg.includes("not found") ||
    msg.includes("no longer available") ||
    msg.includes("unsupported")
  ) {
    const err = new Error("Configured Gemini model is not supported for your account. Please use gemini-3.8-flash or gemini-2.5-flash in backend/.env.");
    err.status = 404;
    err.code = "AI_MODEL_NOT_FOUND";
    err.isFormattedAiError = true;
    return { error: err, isRetryable: true };
  }

  // 5. 503 UNAVAILABLE / High demand / Overloaded - RETRY WITH FALLBACK MODEL
  if (
    statusCode === 503 ||
    statusText === "UNAVAILABLE" ||
    msg.includes("503") ||
    msg.includes("unavailable") ||
    msg.includes("high demand") ||
    msg.includes("overloaded")
  ) {
    const err = new Error("Gemini AI is currently experiencing high demand across all supported models. Please try again shortly or write your task description manually.");
    err.status = 503;
    err.code = "AI_HIGH_DEMAND";
    err.isFormattedAiError = true;
    return { error: err, isRetryable: true };
  }

  // 6. Network Errors (502) - RETRY
  if (msg.includes("fetch failed") || msg.includes("network") || msg.includes("enotfound") || msg.includes("econnrefused")) {
    const err = new Error("Network error connecting to Gemini AI. Check your internet connection.");
    err.status = 502;
    err.code = "AI_NETWORK_ERROR";
    err.isFormattedAiError = true;
    return { error: err, isRetryable: true };
  }

  // 7. General Server Errors (500) - RETRY
  const err = new Error(
    rawMessage && !rawMessage.includes("GoogleGenAI") && !rawMessage.includes("apiKey")
      ? rawMessage
      : "Gemini AI is temporarily unavailable. You can write your task description manually."
  );
  err.status = 500;
  err.code = "AI_SERVICE_ERROR";
  err.isFormattedAiError = true;
  return { error: err, isRetryable: true };
}

/**
 * Generate a task description with Google Gemini AI.
 * Employs an automatic fallback strategy over verified models when a model experiences high demand (HTTP 503)
 * or 404 model unavailability, while failing fast on auth errors and quota limits.
 * @param {string} title - Task title
 * @param {object} options - Optional configuration / mocks for testing
 */
async function generateTaskDescription(title, options = {}) {
  const sanitizedTitle = String(title || "").trim();
  if (!sanitizedTitle) {
    const err = new Error("Task title is required to generate a description");
    err.status = 400;
    err.code = "INVALID_TITLE";
    throw err;
  }

  // Minimum info sent: only sanitized task title (max 200 chars for data privacy)
  const trimmedTitle = sanitizedTitle.slice(0, 200);

  // Check for API key (options.apiKey can be passed in tests)
  const apiKey = (options.apiKey !== undefined ? options.apiKey : process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey === "your_key_here") {
    const err = new Error("Gemini AI API key is not configured. Please add GEMINI_API_KEY in backend/.env.");
    err.status = 503;
    err.code = "AI_KEY_MISSING";
    throw err;
  }

  // Enforce a sensible overall timeout (default 10s)
  const timeoutMs = options.timeoutMs || 10000;
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      const err = new Error("Gemini AI request timed out. Please try again.");
      err.status = 504;
      err.code = "AI_TIMEOUT";
      reject(err);
    }, timeoutMs);
  });

  try {
    const generationPromise = (async () => {
      const candidates = getModelCandidateList(options);
      let lastError = null;

      for (let i = 0; i < candidates.length; i++) {
        const currentModel = candidates[i];
        try {
          let text = "";
          if (options.mockGenerator) {
            const mockRes = await options.mockGenerator(trimmedTitle, currentModel);
            text =
              typeof mockRes === "object" && mockRes !== null && mockRes.description
                ? mockRes.description
                : String(mockRes || "").trim();
          } else {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `You are a helpful task management AI assistant.
Task Title: "${trimmedTitle}"

Generate a concise, clear, and actionable description for this task in 1 to 2 sentences.
Focus on objectives and key deliverables.
Do not include any conversational filler, quotes, headers, or bullet points.
Output only the description text.`;

            const result = await ai.models.generateContent({
              model: currentModel,
              contents: prompt,
              config: {
                temperature: 0.4,
                maxOutputTokens: 500,
              },
            });
            text = (result?.text || "").trim();
          }

          if (text) {
            return {
              description: text,
              model: currentModel,
              disclaimer: "AI-generated suggestion. Please review and edit before saving.",
            };
          }

          throw new Error(`Gemini model ${currentModel} returned an empty description.`);
        } catch (attemptErr) {
          lastError = attemptErr;
          const classification = classifyAiError(attemptErr);

          // If error is not retryable (e.g. invalid key, quota exhaustion, bad input), fail immediately
          if (!classification.isRetryable) {
            throw classification.error;
          }

          // If there are more candidate models left to try, log a safe warning and fallback
          if (i < candidates.length - 1) {
            console.warn(
              `⚠️ [GEMINI_AI] Model '${currentModel}' unavailable (${classification.error.code}: ${classification.error.status}). Falling back to '${candidates[i + 1]}' (attempt ${i + 2}/${candidates.length})...`
            );
          }
        }
      }

      if (lastError) {
        const finalClassification = classifyAiError(lastError);
        throw finalClassification.error;
      }
      throw new Error("Failed to generate task description with Gemini AI.");
    })();

    const result = await Promise.race([generationPromise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    return result;
  } catch (rawError) {
    clearTimeout(timeoutHandle);

    if (rawError?.status) {
      throw rawError;
    }

    const classified = classifyAiError(rawError);
    throw classified.error;
  }
}

module.exports = {
  generateTaskDescription,
  getResolvedModel,
  getModelCandidateList,
  classifyAiError,
  SUPPORTED_MODELS,
  checkRateLimit,
  recordRateLimit,
  clearRateLimit,
  resetRateLimits,
  getRateLimitKey,
};
