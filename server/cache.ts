import NodeCache from 'node-cache';

// Configure cache with enhanced performance settings for faster loading
export const cache = new NodeCache({
  stdTTL: 3600, // 60 minutes in seconds for much better performance and fewer server requests
  checkperiod: 300, // Check for expired keys every 5 minutes to reduce CPU overhead further
  useClones: false, // Disable cloning for better performance with large objects
  maxKeys: 2000, // Increased limit for more comprehensive caching
  deleteOnExpire: true, // Immediately delete expired items to free memory
});

// Cache keys
export const CACHE_KEYS = {
  FRAMEWORKS: 'frameworks',
  FRAMEWORK: (id: number) => `framework:${id}`,
  MODULES: (frameworkId: number) => `modules:framework:${frameworkId}`,
  ALL_MODULES_BY_FRAMEWORK: 'all_modules_by_framework',
  MODULE: (id: number) => `module:${id}`,
  QUIZZES: (frameworkId: number, level?: string) => 
    level ? `quizzes:framework:${frameworkId}:level:${level}` : `quizzes:framework:${frameworkId}`,
  QUIZ: (id: number) => `quiz:${id}`,
  USER_PROGRESS: (userId: number) => `user:${userId}:progress`,
  USER_QUIZ_ATTEMPTS: (userId: number) => `user:${userId}:quiz-attempts`,
  QUIZ_ATTEMPTS: (quizId: number) => `quiz:${quizId}:attempts`,
  AI_CONVERSATIONS: (userId: number) => `user:${userId}:ai-conversations`,
  // Exercise related cache keys
  EXERCISE_PREFIX: 'exercise:',
  FRAMEWORK_EXERCISES_PREFIX: 'framework:exercises:',
  MODULE_EXERCISES_PREFIX: 'module:exercises:',
  USER_EXERCISE_SUBMISSIONS: (userId: number) => `user:${userId}:exercise-submissions`,
  EXERCISE_SUBMISSIONS: (exerciseId: number) => `exercise:${exerciseId}:submissions`,
  // Wizard related cache keys
  WIZARD_SESSIONS: 'wizard_sessions',
  USER_WIZARD_SESSIONS: (userId: number) => `user:${userId}:wizard-sessions`,
  FRAMEWORK_WIZARD_SESSIONS: (userId: number, frameworkId: number) => 
    `user:${userId}:framework:${frameworkId}:wizard-sessions`,
  WIZARD_SESSION: (id: number) => `wizard-session:${id}`,
  WIZARD_TEMPLATES: 'wizard_templates',
  FRAMEWORK_WIZARD_TEMPLATES: (frameworkId: number) => `framework:${frameworkId}:wizard-templates`,
  WIZARD_TEMPLATE: (id: number) => `wizard-template:${id}`,
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

// Enhanced function to add cache-control headers for static resources
export function addCacheHeaders(req: any, res: any, next: any) {
  const path = req.path;
  
  // Set much more aggressive caching for static resources
  if (path.match(/\.(css|js)$/)) {
    // JavaScript and CSS - 7 days cache
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  } else if (path.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
    // Images - 30 days cache
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  } else if (path.match(/\.(woff|woff2|ttf|eot)$/)) {
    // Fonts - 365 days cache
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Add compression hint
  res.setHeader('Vary', 'Accept-Encoding');
  
  // Add a strong ETag for validation
  if (path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$/)) {
    res.setHeader('ETag', JSON.stringify({
      path: req.path,
      mtime: Date.now()
    }));
  }
  
  next();
}