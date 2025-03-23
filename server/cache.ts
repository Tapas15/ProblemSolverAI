import NodeCache from 'node-cache';

// Configure cache with standard TTL of 10 minutes and check period of 60 seconds
export const cache = new NodeCache({
  stdTTL: 600, // 10 minutes in seconds
  checkperiod: 60, // Check for expired keys every 60 seconds
});

// Cache keys
export const CACHE_KEYS = {
  FRAMEWORKS: 'frameworks',
  FRAMEWORK: (id: number) => `framework:${id}`,
  MODULES: (frameworkId: number) => `modules:framework:${frameworkId}`,
  MODULE: (id: number) => `module:${id}`,
  QUIZZES: (frameworkId: number, level?: string) => 
    level ? `quizzes:framework:${frameworkId}:level:${level}` : `quizzes:framework:${frameworkId}`,
  QUIZ: (id: number) => `quiz:${id}`,
  USER_PROGRESS: (userId: number) => `user:${userId}:progress`,
  USER_QUIZ_ATTEMPTS: (userId: number) => `user:${userId}:quiz-attempts`,
  QUIZ_ATTEMPTS: (quizId: number) => `quiz:${quizId}:attempts`,
};

// Helper functions to work with the cache
export function cacheData<T>(key: string, data: T, ttl?: number): T {
  cache.set(key, data, ttl);
  return data;
}

export function getCachedData<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function invalidateCache(key: string): void {
  cache.del(key);
}

// Invalidate multiple related cache keys
export function invalidateRelatedCaches(keys: string[]): void {
  keys.forEach(key => cache.del(key));
}

// Invalidate all cache keys that match a pattern
export function invalidateCachesByPattern(pattern: string): void {
  const allKeys = cache.keys();
  const matchingKeys = allKeys.filter(key => key.includes(pattern));
  invalidateRelatedCaches(matchingKeys);
}

// Cache middleware for Express
export function cachingMiddleware(req: any, res: any, next: any) {
  // Skip caching for non-GET requests or authenticated routes
  if (req.method !== 'GET' || req.path.includes('/api/user')) {
    return next();
  }

  // Skip caching for explicitly marked requests
  if (req.query.skipCache === 'true') {
    return next();
  }

  const key = `__express__${req.originalUrl || req.url}`;
  const cachedBody = getCachedData<string>(key);

  if (cachedBody) {
    res.setHeader('X-Cache', 'HIT');
    return res.send(cachedBody);
  }

  // Store the original send method
  const originalSend = res.send;

  // Replace the original send method with our own
  res.send = function(body: string) {
    // Only cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cacheData(key, body);
    }
    res.setHeader('X-Cache', 'MISS');
    // Call the original send method
    return originalSend.call(this, body);
  };

  next();
}

// Function to add cache-control headers for static resources
export function addCacheHeaders(req: any, res: any, next: any) {
  const path = req.path;
  
  // Add cache headers for static resources
  if (path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    // Add an etag header for better caching
    res.setHeader('ETag', JSON.stringify({
      path: req.path,
      mtime: Date.now()
    }));
  }
  
  next();
}