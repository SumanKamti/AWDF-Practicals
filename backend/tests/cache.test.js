const { test, describe, beforeEach } = require("node:test");
const assert = require("node:assert");

const {
  cache,
  recordHit,
  recordMiss,
  recordSet,
  getTaskListCacheKey,
  getTaskItemCacheKey,
  invalidateUserTaskCache,
  getCacheMetrics,
} = require("../cache");

describe("Practical 9: In-Memory Caching (node-cache)", () => {
  beforeEach(() => {
    cache.flushAll();
  });

  test("generates predictable, user-scoped cache keys", () => {
    const userId = "usr_alpha_123";
    const taskId = 42;

    const listKey = getTaskListCacheKey(userId);
    const itemKey = getTaskItemCacheKey(userId, taskId);

    assert.strictEqual(listKey, "tasks:user:usr_alpha_123:list");
    assert.strictEqual(itemKey, "tasks:user:usr_alpha_123:item:42");
  });

  test("sets and retrieves cached task items", () => {
    const key = "tasks:user:usr_1:item:1";
    const sampleTask = { id: 1, title: "Test Cache Item", status: "ongoing" };

    cache.set(key, sampleTask);
    const retrieved = cache.get(key);

    assert.deepStrictEqual(retrieved, sampleTask);
  });

  test("invalidates user task list and specific item cache", () => {
    const userId = "usr_invalidation_test";
    const listKey = getTaskListCacheKey(userId);
    const itemKey = getTaskItemCacheKey(userId, 10);
    const otherUserKey = getTaskListCacheKey("other_user");

    cache.set(listKey, [{ id: 10, title: "Task" }]);
    cache.set(itemKey, { id: 10, title: "Task" });
    cache.set(otherUserKey, [{ id: 99, title: "Other" }]);

    const deleted = invalidateUserTaskCache(userId, 10);
    assert.strictEqual(deleted, 2);

    assert.strictEqual(cache.get(listKey), undefined);
    assert.strictEqual(cache.get(itemKey), undefined);
    assert.notStrictEqual(cache.get(otherUserKey), undefined);
  });

  test("calculates cache metrics and hit ratio correctly", () => {
    recordHit();
    recordHit();
    recordMiss();
    recordSet();

    const metrics = getCacheMetrics();
    assert.ok(typeof metrics.hitRatio === "string");
    assert.ok(metrics.hits >= 2);
    assert.ok(metrics.misses >= 1);
    assert.strictEqual(metrics.ttlSeconds, 60);
  });
});
