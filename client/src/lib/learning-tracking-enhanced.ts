import axios from 'axios';

// Learning tracking utility for xAPI and SCORM integration
export interface TrackingData {
  verb: string;         // Must match xapi_statements.verb in database
  object: string;       // The object name (module name, framework name, etc.)
  objectType: 'framework' | 'module' | 'quiz';  // Must match xapi_statements.object_type in database
  objectId: number;     // Must match xapi_statements.object_id in database
  result?: {            // Must match xapi_statements.result structure in database
    completion?: boolean;
    success?: boolean;
    score?: {
      scaled: number;  // Value between 0 and 1
      raw: number;     // Actual score
      min: number;     // Minimum possible score
      max: number;     // Maximum possible score
    };
    duration?: string; // ISO 8601 duration format
  };
  context?: {          // Must match xapi_statements.context structure in database
    frameworkId?: number;
    contextActivities?: {
      parent?: { id: string; objectType: string };
      grouping?: { id: string; objectType: string }[];
    };
  };
}

// Define response interface for better type safety
interface ApiResponse<T = any> {
  data: T | null;
}

// For type safety in axios responses
interface AxiosResponse<T = any> {
  data: T;
}

// Utility to format ISO 8601 duration
function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'PT0S';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `PT${hours ? hours + 'H' : ''}${minutes ? minutes + 'M' : ''}${secs ? secs + 'S' : ''}`;
}

// Enhanced xAPI tracking functions with improved error handling and resilience
export const learningTracking = {
  /**
   * Track module completion
   * @param moduleId - ID of the module
   * @param moduleName - Name of the module
   * @param frameworkId - ID of the framework
   * @returns Promise resolving to the tracked statement or null on error
   */
  async trackModuleCompletion(
    moduleId: number,
    moduleName: string,
    frameworkId: number
  ) {
    // Generate unique tracking ID for enhanced logging
    const trackingId = `module-${moduleId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    console.log(`[${new Date().toISOString()}] [${trackingId}] Starting xAPI tracking for module completion`);
    
    try {
      // Use a timeout to ensure we don't block the UI
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('xAPI tracking timeout')), 6000) // Increased timeout for better reliability
      );
      
      const data: TrackingData = {
        verb: 'completed',
        object: moduleName,
        objectType: 'module',
        objectId: moduleId,
        result: {
          completion: true,
          success: true
        },
        context: {
          frameworkId
        }
      };
      
      // Add request ID header for tracing
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Request-ID': trackingId,
        'X-Request-Time': new Date().toISOString()
      };
      
      // Configure retry strategy
      const maxRetries = 2;
      let retryCount = 0;
      let lastError: Error | null = null;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`[${new Date().toISOString()}] [${trackingId}] Module tracking attempt ${retryCount + 1}/${maxRetries + 1}`);
          
          // Use Promise.race to ensure we don't block the UI for too long
          const axiosPromise = axios.post('/api/xapi/statements', data, { headers });
          const response = await Promise.race([axiosPromise, timeoutPromise]) as AxiosResponse;
          
          if (response?.data) {
            console.log(`[${new Date().toISOString()}] [${trackingId}] Module tracking successful on attempt ${retryCount + 1}`);
            return response.data;
          } else {
            console.warn(`[${new Date().toISOString()}] [${trackingId}] Empty response received on attempt ${retryCount + 1}`);
          }
        } catch (err) {
          lastError = err as Error;
          console.warn(`[${new Date().toISOString()}] [${trackingId}] Module tracking attempt ${retryCount + 1} failed:`, lastError.message);
        }
        
        retryCount++;
        
        // Only delay if we have another retry left
        if (retryCount <= maxRetries) {
          const delay = 400 * Math.pow(2, retryCount - 1); // Exponential backoff
          console.log(`[${new Date().toISOString()}] [${trackingId}] Waiting ${delay}ms before retry ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      console.error(`[${new Date().toISOString()}] [${trackingId}] Module tracking failed after all ${maxRetries + 1} attempts`);
      if (lastError) {
        console.error(`[${new Date().toISOString()}] [${trackingId}] Last error:`, lastError.message);
      }
      
      return null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[${new Date().toISOString()}] [${trackingId}] Unexpected module tracking error:`, errorMsg);
      return null;
    }
  },
  
  /**
   * Track framework completion
   * @param frameworkId - ID of the framework
   * @param frameworkName - Name of the framework
   * @param completedModules - Number of completed modules
   * @param totalModules - Total number of modules
   * @returns Promise resolving to the tracked statement or null on error
   */
  async trackFrameworkCompletion(
    frameworkId: number,
    frameworkName: string,
    completedModules: number,
    totalModules: number
  ) {
    // Generate unique tracking ID for enhanced logging
    const trackingId = `framework-${frameworkId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    console.log(`[${new Date().toISOString()}] [${trackingId}] Starting xAPI tracking for framework completion`);
    
    try {
      // Handle potential database schema mismatch
      // Uses a non-blocking approach with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('xAPI tracking timeout')), 6000) // Increased timeout for better reliability
      );
      
      const data: TrackingData = {
        verb: 'completed',
        object: frameworkName,
        objectType: 'framework',
        objectId: frameworkId,
        result: {
          completion: true,
          success: true,
          score: {
            scaled: completedModules / totalModules,
            raw: completedModules,
            min: 0,
            max: totalModules
          }
        }
      };
      
      // Add request ID header for tracing
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Request-ID': trackingId,
        'X-Request-Time': new Date().toISOString()
      };
      
      // Configure retry strategy
      const maxRetries = 3;
      let retryCount = 0;
      let lastError: Error | null = null;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`[${new Date().toISOString()}] [${trackingId}] Framework tracking attempt ${retryCount + 1}/${maxRetries + 1}`);
          
          // Use Promise.race to ensure we don't block the UI for too long
          const axiosPromise = axios.post('/api/xapi/statements', data, { headers });
          const response = await Promise.race([axiosPromise, timeoutPromise]) as AxiosResponse;
          
          if (response?.data) {
            console.log(`[${new Date().toISOString()}] [${trackingId}] Framework tracking successful on attempt ${retryCount + 1}`);
            return response.data;
          } else {
            console.warn(`[${new Date().toISOString()}] [${trackingId}] Empty response received on attempt ${retryCount + 1}`);
          }
        } catch (err) {
          lastError = err as Error;
          console.warn(`[${new Date().toISOString()}] [${trackingId}] Framework tracking attempt ${retryCount + 1} failed:`, lastError.message);
        }
        
        retryCount++;
        
        // Only delay if we have another retry left
        if (retryCount <= maxRetries) {
          const delay = 500 * Math.pow(2, retryCount - 1); // Exponential backoff
          console.log(`[${new Date().toISOString()}] [${trackingId}] Waiting ${delay}ms before retry ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      console.error(`[${new Date().toISOString()}] [${trackingId}] Framework tracking failed after all ${maxRetries + 1} attempts`);
      if (lastError) {
        console.error(`[${new Date().toISOString()}] [${trackingId}] Last error:`, lastError.message);
      }
      
      return null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[${new Date().toISOString()}] [${trackingId}] Unexpected framework tracking error:`, errorMsg);
      return null;
    }
  },
  
  /**
   * Track quiz attempt
   * @param quizId - ID of the quiz
   * @param quizTitle - Title of the quiz
   * @param frameworkId - ID of the framework
   * @param score - Score achieved
   * @param maxScore - Maximum possible score
   * @param passed - Whether the quiz was passed
   * @param timeTaken - Time taken to complete the quiz in seconds
   * @returns Promise resolving to the tracked statement or null on error
   */
  async trackQuizAttempt(
    quizId: number,
    quizTitle: string,
    frameworkId: number,
    score: number,
    maxScore: number,
    passed: boolean,
    timeTaken: number
  ) {
    // Generate unique tracking ID for enhanced logging
    const trackingId = `quiz-${quizId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    console.log(`[${new Date().toISOString()}] [${trackingId}] Starting xAPI tracking for quiz attempt`);
    
    try {
      // Handle potential database schema mismatch
      // Uses a non-blocking approach with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('xAPI tracking timeout')), 6000) // Increased timeout for better reliability
      );
      
      const data: TrackingData = {
        verb: passed ? 'passed' : 'failed',
        object: quizTitle,
        objectType: 'quiz',
        objectId: quizId,
        result: {
          score: {
            scaled: score / maxScore,
            raw: score,
            min: 0,
            max: maxScore
          },
          success: passed,
          completion: true,
          duration: formatDuration(timeTaken)
        },
        context: {
          frameworkId
        }
      };
      
      // Add request ID header for tracing
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Request-ID': trackingId,
        'X-Request-Time': new Date().toISOString()
      };
      
      // Configure retry strategy
      const maxRetries = 3;
      let retryCount = 0;
      let lastError: Error | null = null;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`[${new Date().toISOString()}] [${trackingId}] Quiz tracking attempt ${retryCount + 1}/${maxRetries + 1}`);
          
          // Use Promise.race to ensure we don't block the UI for too long
          const axiosPromise = axios.post('/api/xapi/statements', data, { headers });
          const response = await Promise.race([axiosPromise, timeoutPromise]) as AxiosResponse;
          
          if (response?.data) {
            console.log(`[${new Date().toISOString()}] [${trackingId}] Quiz tracking successful on attempt ${retryCount + 1}`);
            return response.data;
          } else {
            console.warn(`[${new Date().toISOString()}] [${trackingId}] Empty response received on attempt ${retryCount + 1}`);
          }
        } catch (err) {
          lastError = err as Error;
          console.warn(`[${new Date().toISOString()}] [${trackingId}] Quiz tracking attempt ${retryCount + 1} failed:`, lastError.message);
        }
        
        retryCount++;
        
        // Only delay if we have another retry left
        if (retryCount <= maxRetries) {
          const delay = 500 * Math.pow(2, retryCount - 1); // Exponential backoff
          console.log(`[${new Date().toISOString()}] [${trackingId}] Waiting ${delay}ms before retry ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      console.error(`[${new Date().toISOString()}] [${trackingId}] Quiz tracking failed after all ${maxRetries + 1} attempts`);
      if (lastError) {
        console.error(`[${new Date().toISOString()}] [${trackingId}] Last error:`, lastError.message);
      }
      
      return null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[${new Date().toISOString()}] [${trackingId}] Unexpected quiz tracking error:`, errorMsg);
      return null;
    }
  },
  
  /**
   * Complete a module with enhanced tracking, error handling and retry capabilities
   * @param moduleId - ID of the module to complete
   * @param completed - Whether the module is completed
   * @returns Promise resolving to the updated module or null on error
   */
  async completeModuleWithTracking(moduleId: number, completed: boolean): Promise<any> {
    // Generate unique operation ID for logging and tracing
    const operationId = `module-complete-${moduleId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const startTime = Date.now();
    
    console.log(`[${new Date().toISOString()}] [${operationId}] COMPLETION REQUEST: Marking module ${moduleId} as ${completed ? 'completed' : 'not completed'}`);
    
    try {
      // Define a timeout promise with longer timeout to prevent blocking the UI
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Module completion tracking timeout after ${Math.floor((Date.now() - startTime) / 1000)}s`)), 12000)
      );
      
      // Configure retry strategy
      const maxRetries = 3;
      let retryCount = 0;
      let moduleName: string = '';
      let frameworkId: number = 0;
      let moduleResponse: any = null;
      
      // First get the module details with retry logic
      while (retryCount < maxRetries) {
        try {
          console.log(`[${new Date().toISOString()}] [${operationId}] Fetching module details (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Get module details with cache-busting for accurate data
          moduleResponse = await axios.get(`/api/modules/${moduleId}`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'X-Refresh-Cache': Date.now().toString(),
              'X-Request-ID': operationId
            },
            // Set a reasonable timeout for this specific request
            timeout: 5000
          });
          
          if (moduleResponse?.data) {
            moduleName = moduleResponse.data.name || `Module ${moduleId}`;
            frameworkId = moduleResponse.data.frameworkId || 0;
            console.log(`[${new Date().toISOString()}] [${operationId}] Module details retrieved: ${moduleName} (Framework ID: ${frameworkId})`);
            break; // Success, exit retry loop
          } else {
            console.warn(`[${new Date().toISOString()}] [${operationId}] Module data empty (attempt ${retryCount + 1})`);
            retryCount++;
            
            if (retryCount < maxRetries) {
              const backoffDelay = 300 * Math.pow(2, retryCount - 1); // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
          }
        } catch (err) {
          console.warn(`[${new Date().toISOString()}] [${operationId}] Failed to get module details (attempt ${retryCount + 1}):`, (err as Error).message);
          retryCount++;
          
          if (retryCount < maxRetries) {
            const backoffDelay = 300 * Math.pow(2, retryCount - 1); // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          } else {
            console.error(`[${new Date().toISOString()}] [${operationId}] All attempts to fetch module details failed, continuing with limited data`);
            // Continue with default/fallback values if all retries fail
            moduleName = `Module ${moduleId}`;
            if (moduleResponse?.data?.frameworkId) {
              frameworkId = moduleResponse.data.frameworkId;
            }
          }
        }
      }
      
      // Reset retry count for the actual completion request
      retryCount = 0;
      
      // Ensure cache is cleared before we start
      try {
        // Import queryClient dynamically to avoid circular dependencies
        const { queryClient } = await import('@/lib/queryClient');
        
        // Remove stale data first (more aggressive than just invalidating)
        queryClient.removeQueries({ queryKey: [`/api/modules/${moduleId}`] });
        
        // Also clear related queries
        if (frameworkId) {
          queryClient.removeQueries({ queryKey: [`/api/frameworks/${frameworkId}/modules`] });
        }
        
        console.log(`[${new Date().toISOString()}] [${operationId}] Cache pre-invalidation successful`);
      } catch (err) {
        // This is non-critical - we can still proceed with the main operation
        console.warn(`[${new Date().toISOString()}] [${operationId}] Cache pre-invalidation error (non-critical):`, (err as Error).message);
      }
      
      // Generate unique client ID for this request to track potential duplicates
      const clientId = `client-${operationId}-${Math.random().toString(36).substring(2, 10)}`;
      const requestTime = new Date().toISOString();
      
      // Use enhanced headers to prevent caching issues
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Request-ID': clientId,
        'X-Request-Time': requestTime,
        'X-Operation-ID': operationId
      };
      
      // Main completion request with retries
      let response: AxiosResponse | null = null;
      let usedFallbackPath = false;
      
      while (retryCount < maxRetries && !response?.data) {
        try {
          console.log(`[${new Date().toISOString()}] [${operationId}] Sending module completion request (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Preferred path - use the dedicated completion endpoint
          const axiosPromise = axios.patch(`/api/modules/${moduleId}/complete`, {
            completed,
            requestTime,
            clientId,
            operationId
          }, { 
            headers,
            timeout: 10000 // 10 second timeout for this specific request
          });
          
          // Race the API call with the timeout
          response = await Promise.race([axiosPromise, timeoutPromise]) as AxiosResponse;
          
          if (response?.data) {
            console.log(`[${new Date().toISOString()}] [${operationId}] Completion request successful`);
            break; // Success, exit retry loop
          } else {
            console.warn(`[${new Date().toISOString()}] [${operationId}] Empty response data, retrying...`);
            retryCount++;
            
            if (retryCount < maxRetries) {
              const backoffDelay = 500 * Math.pow(2, retryCount - 1); // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
          }
        } catch (err) {
          console.error(`[${new Date().toISOString()}] [${operationId}] Completion request failed (attempt ${retryCount + 1}):`, (err as Error).message);
          retryCount++;
          
          if (retryCount < maxRetries) {
            const backoffDelay = 500 * Math.pow(2, retryCount - 1); // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          } else if (!usedFallbackPath) {
            // On final retry attempt, try the fallback path
            console.log(`[${new Date().toISOString()}] [${operationId}] All standard attempts failed, trying fallback path...`);
            usedFallbackPath = true;
            retryCount = 0; // Reset retry count for fallback attempts
            
            // Continue to fallback approach outside the loop
            break;
          }
        }
      }
      
      // Try fallback path if main path failed
      if (usedFallbackPath || !response?.data) {
        // Reset retry count for fallback path
        retryCount = 0;
        
        while (retryCount < maxRetries && !response?.data) {
          try {
            console.log(`[${new Date().toISOString()}] [${operationId}] Using fallback approach (attempt ${retryCount + 1}/${maxRetries})`);
            
            // Use standard module update endpoint as fallback
            const fallbackResponse = await axios.patch(`/api/modules/${moduleId}`, {
              completed, 
              requestTime: new Date().toISOString(), // Fresh timestamp
              clientId: `fallback-${clientId}`, // New client ID for fallback path
              fromFallback: true, // Flag this as coming from fallback path
              operationId
            }, { 
              headers,
              timeout: 8000 // 8 second timeout for fallback
            });
            
            response = fallbackResponse;
            
            if (response?.data) {
              console.log(`[${new Date().toISOString()}] [${operationId}] Fallback request successful`);
              break; // Success, exit retry loop
            } else {
              console.warn(`[${new Date().toISOString()}] [${operationId}] Empty fallback response data, retrying...`);
              retryCount++;
              
              if (retryCount < maxRetries) {
                const backoffDelay = 500 * Math.pow(2, retryCount - 1); // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
              }
            }
          } catch (fallbackError) {
            console.error(`[${new Date().toISOString()}] [${operationId}] Fallback request failed (attempt ${retryCount + 1}):`, (fallbackError as Error).message);
            retryCount++;
            
            if (retryCount < maxRetries) {
              const backoffDelay = 500 * Math.pow(2, retryCount - 1); // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
          }
        }
      }
      
      // Handle success case - update caches and trigger xAPI tracking
      if (response?.data) {
        try {
          // Import queryClient dynamically to avoid circular dependencies
          const { queryClient } = await import('@/lib/queryClient');
          
          // Invalidate all relevant queries to ensure UI updates correctly
          const promises = [
            // Module-specific invalidations
            queryClient.invalidateQueries({ queryKey: [`/api/modules/${moduleId}`] }),
            
            // Framework and general progress invalidations
            queryClient.invalidateQueries({ queryKey: ['/api/frameworks'] }),
            queryClient.invalidateQueries({ queryKey: ['/api/user/progress'] })
          ];
          
          // Also invalidate framework-specific queries if we have the framework ID
          if (frameworkId) {
            promises.push(queryClient.invalidateQueries({ queryKey: [`/api/frameworks/${frameworkId}`] }));
            promises.push(queryClient.invalidateQueries({ queryKey: [`/api/frameworks/${frameworkId}/modules`] }));
          }
          
          // Wait for all cache invalidations
          await Promise.all(promises);
          console.log(`[${new Date().toISOString()}] [${operationId}] All caches successfully invalidated`);
          
          // If the module was marked as completed, also track with xAPI (non-blocking)
          if (completed && moduleName && frameworkId) {
            // Don't await this call - let it run in the background to not block UI
            this.trackModuleCompletion(moduleId, moduleName, frameworkId)
              .then(result => {
                if (result) {
                  console.log(`[${new Date().toISOString()}] [${operationId}] Module xAPI tracking successful`);
                } else {
                  console.log(`[${new Date().toISOString()}] [${operationId}] Module xAPI tracking failed (non-critical)`);
                }
              })
              .catch(error => {
                console.error(`[${new Date().toISOString()}] [${operationId}] Module xAPI tracking error (suppressed):`, error);
              });
          }
          
          // Schedule multiple additional refreshes to ensure data propagation
          setTimeout(() => {
            try {
              queryClient.refetchQueries({ queryKey: [`/api/modules/${moduleId}`] });
              if (frameworkId) {
                queryClient.refetchQueries({ queryKey: [`/api/frameworks/${frameworkId}`] });
              }
            } catch (e) {
              console.warn(`[${new Date().toISOString()}] [${operationId}] Scheduled refresh error (non-critical):`, e);
            }
          }, 500);
          
          // Second wave of refreshes
          setTimeout(() => {
            try {
              queryClient.refetchQueries({ queryKey: ['/api/user/progress'] });
            } catch (e) {
              console.warn(`[${new Date().toISOString()}] [${operationId}] Scheduled progress refresh error (non-critical):`, e);
            }
          }, 1200);
        } catch (error) {
          console.error(`[${new Date().toISOString()}] [${operationId}] Post-completion error (non-critical):`, error);
        }
      } else {
        console.error(`[${new Date().toISOString()}] [${operationId}] All completion attempts failed`);
      }
      
      // Final stats logging
      const timeElapsed = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] [${operationId}] Module ${moduleId} completion process finished in ${timeElapsed}ms (${timeElapsed/1000}s)`);
      
      return response?.data || null;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[${new Date().toISOString()}] [${operationId}] Unexpected error during module completion:`, errorMsg);
      return null;
    }
  },
  
  // SCORM functions go here if needed
  
  // Add compatibility with old API just in case
  loadScormApiWrapper: () => false,
  initializeScorm: () => false,
  terminateScorm: () => false,
  setScormValue: () => false,
  getScormValue: () => '',
  commitScorm: () => false,
};

export default learningTracking;