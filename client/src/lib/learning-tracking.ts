import axios from 'axios';

// Learning tracking utility for xAPI and SCORM integration
export interface TrackingData {
  verb: string;
  object: string;
  objectType: 'framework' | 'module' | 'quiz';
  objectId: number;
  result?: Record<string, any>;
  context?: Record<string, any>;
}

// xAPI tracking functions
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
    try {
      // Use a timeout to ensure we don't block the UI
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('xAPI tracking timeout')), 3000)
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
      
      // Use Promise.race to ensure we don't block the UI for too long
      const axiosPromise = axios.post('/api/xapi/statements', data);
      const response = await Promise.race([axiosPromise, timeoutPromise])
        .catch(err => {
          console.log('Module tracking suppressed:', err.message);
          return { data: null };
        });
      
      return response.data;
    } catch (error) {
      // Gracefully handle errors
      console.log('Module tracking error (suppressed):', error);
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
    try {
      // Handle potential database schema mismatch
      // Uses a non-blocking approach with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('xAPI tracking timeout')), 3000)
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
      
      // Use Promise.race to ensure we don't block the UI for too long
      const axiosPromise = axios.post('/api/xapi/statements', data);
      const response = await Promise.race([axiosPromise, timeoutPromise])
        .catch(err => {
          console.log('Framework tracking suppressed:', err.message);
          return { data: null };
        });
      
      return response.data;
    } catch (error) {
      // Gracefully handle errors during tracking
      console.log('Framework tracking error (suppressed):', error);
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
    try {
      // Handle potential database schema mismatch
      // Uses a non-blocking approach with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('xAPI tracking timeout')), 3000)
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
      
      // Use Promise.race to ensure we don't block the UI for too long
      const axiosPromise = axios.post('/api/xapi/statements', data);
      const response = await Promise.race([axiosPromise, timeoutPromise])
        .catch(err => {
          console.log('xAPI tracking suppressed:', err.message);
          return { data: null };
        });
        
      return response.data;
    } catch (error) {
      // Gracefully handle errors during tracking
      console.log('Quiz tracking error (suppressed):', error);
      return null;
    }
  },
  
  /**
   * Complete a module with tracking enabled
   * @param moduleId - ID of the module to complete
   * @param completed - Whether the module is completed
   * @returns Promise resolving to the updated module or null on error
   */
  async completeModuleWithTracking(moduleId: number, completed: boolean) {
    try {
      // Define a timeout promise to prevent blocking the UI
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Module completion tracking timeout')), 4000)
      );
      
      // Use the enhanced module completion endpoint that includes xAPI tracking
      const axiosPromise = axios.patch(`/api/modules/${moduleId}/complete-with-tracking`, {
        completed
      });
      
      // Race the API call with the timeout
      const response = await Promise.race([axiosPromise, timeoutPromise])
        .catch(async (err) => {
          console.log('Module completion with tracking failed, using fallback:', err.message);
          
          // As a fallback, try the regular endpoint without tracking
          try {
            const fallbackResponse = await axios.patch(`/api/modules/${moduleId}/complete`, {
              completed
            });
            return fallbackResponse;
          } catch (fallbackError) {
            console.log('Fallback completion also failed (suppressed):', fallbackError);
            return { data: null };
          }
        });
      
      return response.data;
    } catch (error) {
      // Gracefully handle errors
      console.log('Module completion error (suppressed):', error);
      return null;
    }
  },
  
  /**
   * Load the SCORM API wrapper script
   * @param version - SCORM version to use (scorm1.2 or scorm2004)
   * @returns Promise resolving to true if script was loaded successfully
   */
  async loadScormApiWrapper(version: 'scorm1.2' | 'scorm2004' = 'scorm2004'): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (document.getElementById('scorm-api-wrapper')) {
        resolve(true);
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.id = 'scorm-api-wrapper';
      script.src = `/api/scorm/api-wrapper.js?version=${version}`;
      script.async = true;
      
      script.onload = () => {
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load SCORM API wrapper');
        resolve(false);
      };
      
      // Add script to document
      document.head.appendChild(script);
    });
  },
  
  /**
   * Initialize a SCORM session
   * @returns True if initialization was successful
   */
  initializeScorm(): boolean {
    try {
      // Check if SCORM 2004 API is available
      if (window.API_1484_11) {
        return window.API_1484_11.Initialize('') === 'true';
      }
      
      // Check if SCORM 1.2 API is available
      if (window.API) {
        return window.API.LMSInitialize('') === 'true';
      }
      
      console.error('SCORM API not available');
      return false;
    } catch (error) {
      console.error('Error initializing SCORM:', error);
      return false;
    }
  },
  
  /**
   * Terminate a SCORM session
   * @returns True if termination was successful
   */
  terminateScorm(): boolean {
    try {
      // Check if SCORM 2004 API is available
      if (window.API_1484_11) {
        return window.API_1484_11.Terminate('') === 'true';
      }
      
      // Check if SCORM 1.2 API is available
      if (window.API) {
        return window.API.LMSFinish('') === 'true';
      }
      
      console.error('SCORM API not available');
      return false;
    } catch (error) {
      console.error('Error terminating SCORM:', error);
      return false;
    }
  },
  
  /**
   * Set a SCORM data model element
   * @param element - SCORM data model element name
   * @param value - Value to set
   * @returns True if the value was set successfully
   */
  setScormValue(element: string, value: string): boolean {
    try {
      // Check if SCORM 2004 API is available
      if (window.API_1484_11) {
        return window.API_1484_11.SetValue(element, value) === 'true';
      }
      
      // Check if SCORM 1.2 API is available
      if (window.API) {
        return window.API.LMSSetValue(element, value) === 'true';
      }
      
      console.error('SCORM API not available');
      return false;
    } catch (error) {
      console.error(`Error setting SCORM value for ${element}:`, error);
      return false;
    }
  },
  
  /**
   * Get a SCORM data model element
   * @param element - SCORM data model element name
   * @returns The value of the element or empty string if not found
   */
  getScormValue(element: string): string {
    try {
      // Check if SCORM 2004 API is available
      if (window.API_1484_11) {
        return window.API_1484_11.GetValue(element);
      }
      
      // Check if SCORM 1.2 API is available
      if (window.API) {
        return window.API.LMSGetValue(element);
      }
      
      console.error('SCORM API not available');
      return '';
    } catch (error) {
      console.error(`Error getting SCORM value for ${element}:`, error);
      return '';
    }
  },
  
  /**
   * Commit changes to the SCORM session
   * @returns True if commit was successful
   */
  commitScorm(): boolean {
    try {
      // Check if SCORM 2004 API is available
      if (window.API_1484_11) {
        return window.API_1484_11.Commit('') === 'true';
      }
      
      // Check if SCORM 1.2 API is available
      if (window.API) {
        return window.API.LMSCommit('') === 'true';
      }
      
      console.error('SCORM API not available');
      return false;
    } catch (error) {
      console.error('Error committing SCORM changes:', error);
      return false;
    }
  }
};

// Utility function to format duration in ISO 8601 format (PT1H30M45S)
function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'PT0S';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `PT${hours ? hours + 'H' : ''}${minutes ? minutes + 'M' : ''}${secs ? secs + 'S' : ''}`;
}

// Add SCORM API types for TypeScript
declare global {
  interface Window {
    API?: {
      LMSInitialize: (param: string) => string;
      LMSFinish: (param: string) => string;
      LMSGetValue: (element: string) => string;
      LMSSetValue: (element: string, value: string) => string;
      LMSCommit: (param: string) => string;
      LMSGetLastError: () => string;
      LMSGetErrorString: (errorCode: string) => string;
      LMSGetDiagnostic: (errorCode: string) => string;
    };
    API_1484_11?: {
      Initialize: (param: string) => string;
      Terminate: (param: string) => string;
      GetValue: (element: string) => string;
      SetValue: (element: string, value: string) => string;
      Commit: (param: string) => string;
      GetLastError: () => string;
      GetErrorString: (errorCode: string) => string;
      GetDiagnostic: (errorCode: string) => string;
    };
  }
}

export default learningTracking;