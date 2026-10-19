const { GoogleGenAI } = require("@google/genai");
const NodeCache = require("node-cache");

// Rate limit cache: 60 seconds TTL per task / user+title
const aiRateLimitCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

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
 * Generate a task description with Google Gemini AI
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

  // Enforce a sensible timeout (default 10s)
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
      if (options.mockGenerator) {
        return await options.mockGenerator(trimmedTitle);
      }

      const modelName = options.modelName || process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a helpful task management AI assistant.
Task Title: "${trimmedTitle}"

Generate a concise, clear, and actionable description for this task in 1 to 2 sentences.
Focus on objectives and key deliverables.
Do not include any conversational filler, quotes, headers, or bullet points.
Output only the description text.`;

      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 150,
        },
      });

      const text = result?.text;
      return (text || "").trim();
    })();

    const rawResult = await Promise.race([generationPromise, timeoutPromise]);
    clearTimeout(timeoutHandle);

    const generatedText =
      typeof rawResult === "object" && rawResult !== null && rawResult.description
        ? rawResult.description
        : String(rawResult || "").trim();

    if (!generatedText) {
      throw new Error("Gemini returned an empty description.");
    }

    return {
      description: generatedText,
      disclaimer: "AI-generated suggestion. Please review and edit before saving.",
    };
  } catch (rawError) {
    clearTimeout(timeoutHandle);

    // If it's already a formatted error with a status code (e.g. timeout)
    if (rawError.status) {
      throw rawError;
    }

    const msg = (rawError.message || "").toLowerCase();
    const err = new Error("Failed to generate task description with Gemini AI");
    err.status = 500;
    err.code = "AI_SERVICE_ERROR";

    if (msg.includes("api_key") || msg.includes("api key") || msg.includes("403") || msg.includes("unregistered")) {
      err.message = "Invalid or unauthorized Gemini API key. Please verify your GEMINI_API_KEY in backend/.env.";
      err.status = 401;
      err.code = "AI_AUTH_ERROR";
    } else if (msg.includes("quota") || msg.includes("429") || msg.includes("resource_exhausted")) {
      err.message = "Gemini API rate limit or quota exceeded. Please wait a minute or check your quota.";
      err.status = 429;
      err.code = "AI_QUOTA_EXCEEDED";
    } else if (msg.includes("fetch failed") || msg.includes("network") || msg.includes("enotfound") || msg.includes("econnrefused")) {
      err.message = "Network error connecting to Gemini AI. Check your internet connection.";
      err.status = 502;
      err.code = "AI_NETWORK_ERROR";
    } else {
      err.message = "Gemini AI is temporarily unavailable. You can write your task description manually.";
    }

    throw err;
  }
}

module.exports = {
  generateTaskDescription,
  checkRateLimit,
  recordRateLimit,
  clearRateLimit,
  resetRateLimits,
  getRateLimitKey,
};
