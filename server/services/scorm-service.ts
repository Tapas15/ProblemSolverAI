import axios from 'axios';
import { ScormTrackingData } from '@shared/schema';
import { db } from '../db';
import { scormTrackingData } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Common SCORM data model elements
export const ScormDataModel = {
  // SCORM 1.2
  COMPLETION_STATUS: 'cmi.core.lesson_status',
  SCORE_RAW: 'cmi.core.score.raw',
  SCORE_MAX: 'cmi.core.score.max',
  SCORE_MIN: 'cmi.core.score.min',
  TOTAL_TIME: 'cmi.core.total_time',
  SUSPEND_DATA: 'cmi.suspend_data',
  INTERACTIONS: 'cmi.interactions',
  
  // SCORM 2004 4th Edition
  SCORM2004_COMPLETION_STATUS: 'cmi.completion_status',
  SCORM2004_SUCCESS_STATUS: 'cmi.success_status',
  SCORM2004_SCORE_RAW: 'cmi.score.raw',
  SCORM2004_SCORE_SCALED: 'cmi.score.scaled',
  SCORM2004_SCORE_MAX: 'cmi.score.max',
  SCORM2004_SCORE_MIN: 'cmi.score.min',
  SCORM2004_TOTAL_TIME: 'cmi.total_time',
  SCORM2004_SUSPEND_DATA: 'cmi.suspend_data',
  SCORM2004_INTERACTIONS: 'cmi.interactions'
};

export class ScormService {
  // Store SCORM tracking data
  public async storeScormData(
    userId: number,
    scoId: string,
    elementName: string,
    elementValue: string
  ): Promise<ScormTrackingData | null> {
    try {
      const [trackingData] = await db
        .insert(scormTrackingData)
        .values({
          userId,
          scoId,
          elementName,
          elementValue,
          timestamp: new Date()
        })
        .returning();
      
      return trackingData;
    } catch (error) {
      console.error('Error storing SCORM data:', error);
      return null;
    }
  }
  
  // Get all SCORM tracking data for a user and SCO
  public async getScormDataBySCO(
    userId: number,
    scoId: string
  ): Promise<ScormTrackingData[]> {
    try {
      const data = await db
        .select()
        .from(scormTrackingData)
        .where(eq(scormTrackingData.userId, userId))
        .where(eq(scormTrackingData.scoId, scoId));
      
      return data;
    } catch (error) {
      console.error('Error retrieving SCORM data:', error);
      return [];
    }
  }
  
  // Get SCORM tracking data by element name
  public async getScormDataByElement(
    userId: number,
    scoId: string,
    elementName: string
  ): Promise<ScormTrackingData | null> {
    try {
      // Get the most recent value for this element
      const [data] = await db
        .select()
        .from(scormTrackingData)
        .where(eq(scormTrackingData.userId, userId))
        .where(eq(scormTrackingData.scoId, scoId))
        .where(eq(scormTrackingData.elementName, elementName))
        .orderBy(scormTrackingData.timestamp, 'desc')
        .limit(1);
      
      return data || null;
    } catch (error) {
      console.error('Error retrieving SCORM data element:', error);
      return null;
    }
  }
  
  // Transform SCORM data to LMS format
  public transformScormDataToLMS(data: ScormTrackingData[]): Record<string, string> {
    const result: Record<string, string> = {};
    
    // Group by element name and get the latest value
    const elementMap: Record<string, ScormTrackingData> = {};
    
    for (const item of data) {
      if (!elementMap[item.elementName] || new Date(item.timestamp) > new Date(elementMap[item.elementName].timestamp)) {
        elementMap[item.elementName] = item;
      }
    }
    
    // Convert to LMS format
    for (const elementName in elementMap) {
      result[elementName] = elementMap[elementName].elementValue;
    }
    
    return result;
  }
  
  // Check if SCORM object is complete
  public isComplete(lmsData: Record<string, string>): boolean {
    // Check SCORM 1.2 completion
    if (lmsData[ScormDataModel.COMPLETION_STATUS]) {
      return ['completed', 'passed', 'failed'].includes(lmsData[ScormDataModel.COMPLETION_STATUS]);
    }
    
    // Check SCORM 2004 completion
    if (lmsData[ScormDataModel.SCORM2004_COMPLETION_STATUS]) {
      return lmsData[ScormDataModel.SCORM2004_COMPLETION_STATUS] === 'completed';
    }
    
    return false;
  }
  
  // Check if SCORM object is passed
  public isPassed(lmsData: Record<string, string>): boolean {
    // Check SCORM 1.2 status
    if (lmsData[ScormDataModel.COMPLETION_STATUS]) {
      return lmsData[ScormDataModel.COMPLETION_STATUS] === 'passed';
    }
    
    // Check SCORM 2004 success status
    if (lmsData[ScormDataModel.SCORM2004_SUCCESS_STATUS]) {
      return lmsData[ScormDataModel.SCORM2004_SUCCESS_STATUS] === 'passed';
    }
    
    return false;
  }
  
  // Get score from SCORM data
  public getScore(lmsData: Record<string, string>): number {
    // Try SCORM 1.2 score
    if (lmsData[ScormDataModel.SCORE_RAW]) {
      return parseInt(lmsData[ScormDataModel.SCORE_RAW], 10);
    }
    
    // Try SCORM 2004 score
    if (lmsData[ScormDataModel.SCORM2004_SCORE_RAW]) {
      return parseInt(lmsData[ScormDataModel.SCORM2004_SCORE_RAW], 10);
    }
    
    return 0;
  }
  
  // Generate JavaScript for SCORM API wrapper
  public getScormApiWrapperScript(
    version: 'scorm1.2' | 'scorm2004' = 'scorm2004',
    apiEndpoint: string
  ): string {
    const apiName = version === 'scorm1.2' ? 'API' : 'API_1484_11';
    const apiPrefix = version === 'scorm1.2' ? 'LMSInitialize' : 'Initialize';
    
    return `
      // SCORM API Wrapper for ${version}
      var ${apiName} = (function() {
        var data = {};
        var initialized = false;
        var terminated = false;
        
        // Helper function to make API requests to the server
        async function sendRequest(action, params) {
          try {
            const response = await fetch('${apiEndpoint}', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                action: action,
                params: params
              }),
              credentials: 'include'
            });
            
            if (!response.ok) {
              console.error('SCORM API Error:', response.statusText);
              return false;
            }
            
            const result = await response.json();
            return result;
          } catch (error) {
            console.error('SCORM API Error:', error);
            return false;
          }
        }
        
        return {
          ${apiPrefix}: function() {
            if (initialized) return "false";
            initialized = true;
            terminated = false;
            sendRequest('initialize', { version: '${version}' });
            return "true";
          },
          ${apiPrefix === 'LMSInitialize' ? 'LMSFinish' : 'Terminate'}: function() {
            if (!initialized || terminated) return "false";
            initialized = false;
            terminated = true;
            sendRequest('terminate', { version: '${version}' });
            return "true";
          },
          ${apiPrefix === 'LMSInitialize' ? 'LMSGetValue' : 'GetValue'}: function(element) {
            if (!initialized || terminated) return "";
            if (data[element] !== undefined) {
              return data[element];
            }
            return "";
          },
          ${apiPrefix === 'LMSInitialize' ? 'LMSSetValue' : 'SetValue'}: function(element, value) {
            if (!initialized || terminated) return "false";
            data[element] = value;
            sendRequest('setValue', { 
              element: element, 
              value: value,
              version: '${version}'
            });
            return "true";
          },
          ${apiPrefix === 'LMSInitialize' ? 'LMSCommit' : 'Commit'}: function() {
            if (!initialized || terminated) return "false";
            sendRequest('commit', { 
              data: data,
              version: '${version}'
            });
            return "true";
          },
          ${apiPrefix === 'LMSInitialize' ? 'LMSGetLastError' : 'GetLastError'}: function() {
            return "0"; // No error
          },
          ${apiPrefix === 'LMSInitialize' ? 'LMSGetErrorString' : 'GetErrorString'}: function(errorCode) {
            return "No error";
          },
          ${apiPrefix === 'LMSInitialize' ? 'LMSGetDiagnostic' : 'GetDiagnostic'}: function(errorCode) {
            return "No error";
          }
        };
      })();
      
      // Mount the API to the window object
      if (window.${version === 'scorm1.2' ? 'API' : 'API_1484_11'} == null) {
        window.${version === 'scorm1.2' ? 'API' : 'API_1484_11'} = ${apiName};
      }
    `;
  }
}

export const scormService = new ScormService();