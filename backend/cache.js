const NodeCache = require("node-cache");

// Practical 9: In-Memory Caching and Query Optimization
// Default TTL of 60 seconds, checkperiod of 120 seconds for garbage collection
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: true, // Prevents accidental mutations of cached objects
});

// Cache hit and miss counters
const cacheStats = {
  hits: 0,
  misses: 0,
  keysSet: 0,
  keysInvalidated: 0,
};

// Helper to record a cache hit
function recordHit() {
  cacheStats.hits++;
}

// Helper to record a cache miss
function recordMiss() {
  cacheStats.misses++;
}

// Helper to record cache set
function recordSet() {
  cacheStats.keysSet++;
}

// Helper to record invalidation
function recordInvalidation(count = 1) {
  cacheStats.keysInvalidated += count;
}

// Key Generator Helpers - Strictly scoped to authenticated userId
function getTaskListCacheKey(userId) {
  return `tasks:user:${userId}:list`;
}

function getTaskItemCacheKey(userId, taskId) {
  return `tasks:user:${userId}:item:${taskId}`;
}

/**
 * Invalidate all cached data for a specific user
 * - Invalidates their task list cache
 * - Optionally invalidates a specific task item cache
 */
function invalidateUserTaskCache(userId, taskId = null) {
  const keysToDel = [getTaskListCacheKey(userId)];

  if (taskId !== null && taskId !== undefined) {
    keysToDel.push(getTaskItemCacheKey(userId, taskId));
  } else {
    // If no specific taskId given, also scan and invalidate any item keys for this user
    const allKeys = cache.keys();
    const userPrefix = `tasks:user:${userId}:item:`;
    allKeys.forEach((key) => {
      if (key.startsWith(userPrefix)) {
        keysToDel.push(key);
      }
    });
  }

  const deletedCount = cache.del(keysToDel);
  recordInvalidation(deletedCount);
  return deletedCount;
}

/**
 * Returns safe debug metrics without sensitive information
 */
function getCacheMetrics() {
  const totalRequests = cacheStats.hits + cacheStats.misses;
  const hitRatio = totalRequests > 0 ? `${((cacheStats.hits / totalRequests) * 100).toFixed(2)}%` : "0.00%";
  const internalStats = cache.getStats();

  return {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    totalRequests,
    hitRatio,
    keysSet: cacheStats.keysSet,
    keysInvalidated: cacheStats.keysInvalidated,
    activeKeysCount: cache.keys().length,
    ttlSeconds: 60,
    internalStats: {
      keys: internalStats.keys,
      hits: internalStats.hits,
      misses: internalStats.misses,
      ksize: internalStats.ksize,
      vsize: internalStats.vsize,
    },
  };
}

module.exports = {
  cache,
  recordHit,
  recordMiss,
  recordSet,
  recordInvalidation,
  getTaskListCacheKey,
  getTaskItemCacheKey,
  invalidateUserTaskCache,
  getCacheMetrics,
};
