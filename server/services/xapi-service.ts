import axios from 'axios';
import CryptoJS from 'crypto-js';
import { XapiStatement, LrsConfiguration } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { xapiStatements, lrsConfigurations } from '@shared/schema';

// Basic xAPI statement structure
interface XApiStatementInterface {
  actor: {
    objectType: string;
    name: string;
    mbox: string;
  };
  verb: {
    id: string;
    display: {
      [language: string]: string;
    };
  };
  object: {
    id: string;
    objectType: string;
    definition?: {
      name?: {
        [language: string]: string;
      };
      description?: {
        [language: string]: string;
      };
      type?: string;
    };
  };
  result?: {
    score?: {
      scaled?: number;
      raw?: number;
      min?: number;
      max?: number;
    };
    success?: boolean;
    completion?: boolean;
    duration?: string;
  };
  context?: {
    contextActivities?: {
      parent?: { id: string; objectType: string }[];
      grouping?: { id: string; objectType: string }[];
      category?: { id: string; objectType: string }[];
    };
    extensions?: {
      [key: string]: any;
    };
  };
  timestamp: string;
}

// Common xAPI verbs
export const xApiVerbs = {
  COMPLETED: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: { 'en-US': 'completed' }
  },
  EXPERIENCED: {
    id: 'http://adlnet.gov/expapi/verbs/experienced',
    display: { 'en-US': 'experienced' }
  },
  ATTEMPTED: {
    id: 'http://adlnet.gov/expapi/verbs/attempted',
    display: { 'en-US': 'attempted' }
  },
  ANSWERED: {
    id: 'http://adlnet.gov/expapi/verbs/answered',
    display: { 'en-US': 'answered' }
  },
  PASSED: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: { 'en-US': 'passed' }
  },
  FAILED: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: { 'en-US': 'failed' }
  },
  INTERACTED: {
    id: 'http://adlnet.gov/expapi/verbs/interacted',
    display: { 'en-US': 'interacted' }
  },
  INITIALIZED: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: { 'en-US': 'initialized' }
  },
  TERMINATED: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: { 'en-US': 'terminated' }
  }
};

// Common xAPI activity types
export const xApiActivityTypes = {
  COURSE: 'http://adlnet.gov/expapi/activities/course',
  MODULE: 'http://adlnet.gov/expapi/activities/module',
  ASSESSMENT: 'http://adlnet.gov/expapi/activities/assessment',
  QUESTION: 'http://adlnet.gov/expapi/activities/question'
};

// Utility to create an ISO 8601 duration from seconds
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'PT0S';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `PT${hours ? hours + 'H' : ''}${minutes ? minutes + 'M' : ''}${secs ? secs + 'S' : ''}`;
}

export class XApiService {
  private async getLrsConfiguration(): Promise<LrsConfiguration | null> {
    const [lrsConfig] = await db
      .select()
      .from(lrsConfigurations)
      .where(eq(lrsConfigurations.isActive, true))
      .limit(1);
    
    return lrsConfig || null;
  }

  private createBasicAuth(username: string, password: string): string {
    const token = `${username}:${password}`;
    const encoded = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(token));
    return `Basic ${encoded}`;
  }

  private async sendStatementToLrs(
    statement: XApiStatementInterface,
    lrsConfig: LrsConfiguration
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${lrsConfig.endpoint}/statements`,
        statement,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.createBasicAuth(lrsConfig.username, lrsConfig.password),
            'X-Experience-API-Version': '1.0.3'
          }
        }
      );
      
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('Failed to send xAPI statement to LRS:', error);
      return false;
    }
  }

  // Transform our internal format to standard xAPI statement
  private transformToXApiStatement(
    statement: XapiStatement,
    user: { name: string; email: string },
    objectInfo: { 
      name: string; 
      description?: string;
      type: string;
    }
  ): XApiStatementInterface {
    // Parse result and context if they exist
    const resultData = statement.result ? JSON.parse(statement.result) : undefined;
    const contextData = statement.context ? JSON.parse(statement.context) : undefined;
    
    // Get verb data from our predefined verbs
    const verbKey = statement.verb.toUpperCase() as keyof typeof xApiVerbs;
    const verb = xApiVerbs[verbKey] || {
      id: `http://adlnet.gov/expapi/verbs/${statement.verb}`,
      display: { 'en-US': statement.verb }
    };
    
    // Construct the statement object
    return {
      actor: {
        objectType: 'Agent',
        name: user.name,
        mbox: `mailto:${user.email}`
      },
      verb: verb,
      object: {
        id: `${process.env.BASE_URL || 'https://questionpro.ai'}/api/${statement.objectType}/${statement.objectId}`,
        objectType: 'Activity',
        definition: {
          name: {
            'en-US': objectInfo.name
          },
          description: objectInfo.description ? {
            'en-US': objectInfo.description
          } : undefined,
          type: objectInfo.type
        }
      },
      result: resultData,
      context: contextData,
      timestamp: new Date(statement.timestamp || Date.now()).toISOString()
    };
  }

  // Save a statement to our database and optionally send to LRS
  public async createStatement(
    statement: Omit<XapiStatement, 'id' | 'timestamp' | 'stored'>,
    user: { name: string; email: string },
    objectInfo: {
      name: string;
      description?: string;
      type: string;
    },
    sendToLrs: boolean = true
  ): Promise<XapiStatement | null> {
    try {
      // Insert statement into our database
      const [newStatement] = await db
        .insert(xapiStatements)
        .values({
          ...statement,
          timestamp: new Date(),
          stored: false
        })
        .returning();
      
      if (sendToLrs) {
        const lrsConfig = await this.getLrsConfiguration();
        
        if (lrsConfig) {
          // Transform to standard xAPI format
          const xapiStatement = this.transformToXApiStatement(newStatement, user, objectInfo);
          
          // Send to LRS
          const success = await this.sendStatementToLrs(xapiStatement, lrsConfig);
          
          if (success) {
            // Mark as stored in LRS
            await db
              .update(xapiStatements)
              .set({ stored: true })
              .where(eq(xapiStatements.id, newStatement.id));
              
            return { ...newStatement, stored: true };
          }
        }
      }
      
      return newStatement;
    } catch (error) {
      console.error('Error creating xAPI statement:', error);
      return null;
    }
  }

  // Create module completion statement
  public async trackModuleCompletion(
    userId: number,
    moduleId: number,
    moduleName: string,
    frameworkId: number,
    frameworkName: string,
    user: { name: string; email: string }
  ): Promise<XapiStatement | null> {
    const result = {
      completion: true,
      success: true
    };
    
    const context = {
      contextActivities: {
        parent: [
          {
            id: `${process.env.BASE_URL || 'https://questionpro.ai'}/api/frameworks/${frameworkId}`,
            objectType: 'Activity'
          }
        ]
      }
    };
    
    return this.createStatement(
      {
        userId,
        verb: 'completed',
        object: moduleName,
        objectType: 'module',
        objectId: moduleId,
        result: JSON.stringify(result),
        context: JSON.stringify(context)
      },
      user,
      {
        name: moduleName,
        description: `Module ${moduleName} in ${frameworkName} framework`,
        type: xApiActivityTypes.MODULE
      }
    );
  }
  
  // Create quiz attempt statement
  public async trackQuizAttempt(
    userId: number,
    quizId: number,
    quizTitle: string,
    frameworkId: number,
    frameworkName: string,
    score: number,
    maxScore: number,
    passed: boolean,
    timeTaken: number,
    user: { name: string; email: string }
  ): Promise<XapiStatement | null> {
    const verb = passed ? 'passed' : 'failed';
    
    const result = {
      score: {
        scaled: score / maxScore,
        raw: score,
        min: 0,
        max: maxScore
      },
      success: passed,
      completion: true,
      duration: formatDuration(timeTaken)
    };
    
    const context = {
      contextActivities: {
        parent: [
          {
            id: `${process.env.BASE_URL || 'https://questionpro.ai'}/api/frameworks/${frameworkId}`,
            objectType: 'Activity'
          }
        ]
      }
    };
    
    return this.createStatement(
      {
        userId,
        verb,
        object: quizTitle,
        objectType: 'quiz',
        objectId: quizId,
        result: JSON.stringify(result),
        context: JSON.stringify(context)
      },
      user,
      {
        name: quizTitle,
        description: `Quiz ${quizTitle} for ${frameworkName} framework`,
        type: xApiActivityTypes.ASSESSMENT
      }
    );
  }
  
  // Create framework completion statement
  public async trackFrameworkCompletion(
    userId: number,
    frameworkId: number,
    frameworkName: string,
    completedModules: number,
    totalModules: number,
    user: { name: string; email: string }
  ): Promise<XapiStatement | null> {
    const result = {
      completion: true,
      success: true,
      score: {
        scaled: completedModules / totalModules,
        raw: completedModules,
        min: 0,
        max: totalModules
      }
    };
    
    return this.createStatement(
      {
        userId,
        verb: 'completed',
        object: frameworkName,
        objectType: 'framework',
        objectId: frameworkId,
        result: JSON.stringify(result)
      },
      user,
      {
        name: frameworkName,
        description: `Framework ${frameworkName}`,
        type: xApiActivityTypes.COURSE
      }
    );
  }
}

export const xapiService = new XApiService();