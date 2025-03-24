import { users, frameworks, modules, userProgress, aiConversations, quizzes, quizAttempts, exercises, exerciseSubmissions } from "@shared/schema";
import type { 
  User, InsertUser, Framework, InsertFramework, 
  Module, InsertModule, UserProgress, InsertUserProgress, 
  AiConversation, InsertAiConversation,
  Quiz, InsertQuiz, QuizAttempt, InsertQuizAttempt,
  Exercise, InsertExercise, ExerciseSubmission, InsertExerciseSubmission
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { PostgresStorage } from "./db-storage";

const MemoryStore = createMemoryStore(session);

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Framework methods
  getFramework(id: number): Promise<Framework | undefined>;
  getAllFrameworks(): Promise<Framework[]>;
  getFrameworkByName(name: string): Promise<Framework | undefined>;
  createFramework(framework: InsertFramework): Promise<Framework>;
  updateFramework(id: number, frameworkData: Partial<Framework>): Promise<Framework | undefined>;
  
  // Module methods
  getModule(id: number): Promise<Module | undefined>;
  getModulesByFrameworkId(frameworkId: number): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, moduleData: Partial<Module>): Promise<Module | undefined>;
  
  // UserProgress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressByFramework(userId: number, frameworkId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(id: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined>;
  
  // AI Conversation methods
  getAiConversations(userId: number): Promise<AiConversation[]>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  deleteAiConversation(id: number): Promise<void>;
  
  // Quiz methods
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByFramework(frameworkId: number, level?: string): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, quizData: Partial<Quiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<void>;
  
  // Quiz Attempt methods
  getQuizAttempt(id: number): Promise<QuizAttempt | undefined>;
  getUserQuizAttempts(userId: number): Promise<QuizAttempt[]>;
  getQuizAttemptsByQuiz(quizId: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  
  // Session store
  sessionStore: any;
  
  // Exercise methods
  getExercise(id: number): Promise<Exercise | undefined>;
  getExercisesByModule(moduleId: number): Promise<Exercise[]>;
  getExercisesByFramework(frameworkId: number): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, exerciseData: Partial<Exercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<void>;
  
  // Exercise Submission methods
  getExerciseSubmission(id: number): Promise<ExerciseSubmission | undefined>;
  getUserExerciseSubmissions(userId: number): Promise<ExerciseSubmission[]>;
  getExerciseSubmissionsByExercise(exerciseId: number): Promise<ExerciseSubmission[]>;
  createExerciseSubmission(submission: InsertExerciseSubmission): Promise<ExerciseSubmission>;
  updateExerciseSubmission(id: number, submissionData: Partial<ExerciseSubmission>): Promise<ExerciseSubmission | undefined>;
  deleteExerciseSubmission(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private frameworks: Map<number, Framework>;
  private modules: Map<number, Module>;
  private userProgress: Map<number, UserProgress>;
  private aiConversations: Map<number, AiConversation>;
  private quizzes: Map<number, Quiz>;
  private quizAttempts: Map<number, QuizAttempt>;
  sessionStore: any;
  
  private userIdCounter: number;
  private frameworkIdCounter: number;
  private moduleIdCounter: number;
  private progressIdCounter: number;
  private conversationIdCounter: number;
  private quizIdCounter: number;
  private quizAttemptIdCounter: number;
  private exercises: Map<number, Exercise>;
  private exerciseSubmissions: Map<number, ExerciseSubmission>;
  private exerciseIdCounter: number;
  private exerciseSubmissionIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.frameworks = new Map();
    this.modules = new Map();
    this.userProgress = new Map();
    this.aiConversations = new Map();
    this.quizzes = new Map();
    this.quizAttempts = new Map();
    this.exercises = new Map();
    this.exerciseSubmissions = new Map();
    
    this.userIdCounter = 1;
    this.frameworkIdCounter = 1;
    this.moduleIdCounter = 1;
    this.progressIdCounter = 1;
    this.conversationIdCounter = 1;
    this.quizIdCounter = 1;
    this.quizAttemptIdCounter = 1;
    this.exerciseIdCounter = 1;
    this.exerciseSubmissionIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Seed some initial data
    this.seedFrameworks();
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      apiKey: insertUser.apiKey || null,
      aiProvider: insertUser.aiProvider || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getFramework(id: number): Promise<Framework | undefined> {
    return this.frameworks.get(id);
  }
  
  async getAllFrameworks(): Promise<Framework[]> {
    return Array.from(this.frameworks.values());
  }
  
  async getFrameworkByName(name: string): Promise<Framework | undefined> {
    for (const framework of this.frameworks.values()) {
      if (framework.name === name) {
        return framework;
      }
    }
    return undefined;
  }
  
  async createFramework(framework: InsertFramework): Promise<Framework> {
    const id = this.frameworkIdCounter++;
    const newFramework: Framework = { 
      ...framework, 
      id,
      status: framework.status || "not_started",
      case_studies: framework.case_studies || null
    };
    this.frameworks.set(id, newFramework);
    return newFramework;
  }
  
  async updateFramework(id: number, frameworkData: Partial<Framework>): Promise<Framework | undefined> {
    const existingFramework = this.frameworks.get(id);
    if (!existingFramework) return undefined;
    
    const updatedFramework = { ...existingFramework, ...frameworkData };
    this.frameworks.set(id, updatedFramework);
    return updatedFramework;
  }
  
  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }
  
  async getModulesByFrameworkId(frameworkId: number): Promise<Module[]> {
    const result: Module[] = [];
    for (const module of this.modules.values()) {
      if (module.frameworkId === frameworkId) {
        result.push(module);
      }
    }
    // Sort by order
    return result.sort((a, b) => a.order - b.order);
  }
  
  async createModule(module: InsertModule): Promise<Module> {
    const id = this.moduleIdCounter++;
    const newModule: Module = { 
      ...module, 
      id,
      completed: module.completed || false,
      content: module.content || null,
      examples: module.examples || null,
      keyTakeaways: module.keyTakeaways || null,
      quizQuestions: module.quizQuestions || null,
      videoUrl: module.videoUrl || null,
      resources: module.resources || null,
      scormPath: module.scormPath || null
    };
    this.modules.set(id, newModule);
    return newModule;
  }
  
  async updateModule(id: number, moduleData: Partial<Module>): Promise<Module | undefined> {
    const existingModule = this.modules.get(id);
    if (!existingModule) return undefined;
    
    const updatedModule = { ...existingModule, ...moduleData };
    this.modules.set(id, updatedModule);
    return updatedModule;
  }
  
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    const result: UserProgress[] = [];
    for (const progress of this.userProgress.values()) {
      if (progress.userId === userId) {
        result.push(progress);
      }
    }
    return result;
  }
  
  async getUserProgressByFramework(userId: number, frameworkId: number): Promise<UserProgress | undefined> {
    for (const progress of this.userProgress.values()) {
      if (progress.userId === userId && progress.frameworkId === frameworkId) {
        return progress;
      }
    }
    return undefined;
  }
  
  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const id = this.progressIdCounter++;
    const now = new Date();
    const newProgress: UserProgress = { 
      ...progress, 
      id, 
      lastUpdated: now,
      status: progress.status || "not_started",
      completedModules: progress.completedModules || 0 
    };
    this.userProgress.set(id, newProgress);
    return newProgress;
  }
  
  async updateUserProgress(id: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const existingProgress = this.userProgress.get(id);
    if (!existingProgress) return undefined;
    
    const now = new Date();
    const updatedProgress = { ...existingProgress, ...progressData, lastUpdated: now };
    this.userProgress.set(id, updatedProgress);
    return updatedProgress;
  }
  
  async getAiConversations(userId: number): Promise<AiConversation[]> {
    const result: AiConversation[] = [];
    for (const conversation of this.aiConversations.values()) {
      if (conversation.userId === userId) {
        result.push(conversation);
      }
    }
    // Sort by most recent
    return result.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
  
  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const newConversation: AiConversation = { 
      ...conversation, 
      id, 
      createdAt: now,
      frameworkId: conversation.frameworkId || null
    };
    this.aiConversations.set(id, newConversation);
    return newConversation;
  }
  
  async deleteAiConversation(id: number): Promise<void> {
    this.aiConversations.delete(id);
  }
  
  // Quiz methods
  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }
  
  async getQuizzesByFramework(frameworkId: number, level?: string): Promise<Quiz[]> {
    const result: Quiz[] = [];
    for (const quiz of this.quizzes.values()) {
      if (quiz.frameworkId === frameworkId && (level === undefined || quiz.level === level)) {
        result.push(quiz);
      }
    }
    return result;
  }
  
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.quizIdCounter++;
    const newQuiz: Quiz = {
      ...quiz,
      id,
      isActive: quiz.isActive !== undefined ? quiz.isActive : true,
    };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }
  
  async updateQuiz(id: number, quizData: Partial<Quiz>): Promise<Quiz | undefined> {
    const existingQuiz = this.quizzes.get(id);
    if (!existingQuiz) return undefined;
    
    const updatedQuiz = { ...existingQuiz, ...quizData };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }
  
  async deleteQuiz(id: number): Promise<void> {
    this.quizzes.delete(id);
  }
  
  // Quiz Attempt methods
  async getQuizAttempt(id: number): Promise<QuizAttempt | undefined> {
    return this.quizAttempts.get(id);
  }
  
  async getUserQuizAttempts(userId: number): Promise<QuizAttempt[]> {
    const result: QuizAttempt[] = [];
    for (const attempt of this.quizAttempts.values()) {
      if (attempt.userId === userId) {
        result.push(attempt);
      }
    }
    return result;
  }
  
  async getQuizAttemptsByQuiz(quizId: number): Promise<QuizAttempt[]> {
    const result: QuizAttempt[] = [];
    for (const attempt of this.quizAttempts.values()) {
      if (attempt.quizId === quizId) {
        result.push(attempt);
      }
    }
    return result;
  }
  
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.quizAttemptIdCounter++;
    const now = new Date();
    const newAttempt: QuizAttempt = {
      ...attempt,
      id,
      completedAt: now,
    };
    this.quizAttempts.set(id, newAttempt);
    return newAttempt;
  }
  
  // Exercise methods
  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }
  
  async getExercisesByModule(moduleId: number): Promise<Exercise[]> {
    const result: Exercise[] = [];
    for (const exercise of this.exercises.values()) {
      if (exercise.moduleId === moduleId) {
        result.push(exercise);
      }
    }
    return result;
  }
  
  async getExercisesByFramework(frameworkId: number): Promise<Exercise[]> {
    const result: Exercise[] = [];
    for (const exercise of this.exercises.values()) {
      if (exercise.frameworkId === frameworkId) {
        result.push(exercise);
      }
    }
    return result;
  }
  
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseIdCounter++;
    const now = new Date();
    const newExercise: Exercise = {
      ...exercise,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.exercises.set(id, newExercise);
    return newExercise;
  }
  
  async updateExercise(id: number, exerciseData: Partial<Exercise>): Promise<Exercise | undefined> {
    const existingExercise = this.exercises.get(id);
    if (!existingExercise) return undefined;
    
    const now = new Date();
    const updatedExercise = { ...existingExercise, ...exerciseData, updatedAt: now };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }
  
  async deleteExercise(id: number): Promise<void> {
    this.exercises.delete(id);
  }
  
  // Exercise Submission methods
  async getExerciseSubmission(id: number): Promise<ExerciseSubmission | undefined> {
    return this.exerciseSubmissions.get(id);
  }
  
  async getUserExerciseSubmissions(userId: number): Promise<ExerciseSubmission[]> {
    const result: ExerciseSubmission[] = [];
    for (const submission of this.exerciseSubmissions.values()) {
      if (submission.userId === userId) {
        result.push(submission);
      }
    }
    return result;
  }
  
  async getExerciseSubmissionsByExercise(exerciseId: number): Promise<ExerciseSubmission[]> {
    const result: ExerciseSubmission[] = [];
    for (const submission of this.exerciseSubmissions.values()) {
      if (submission.exerciseId === exerciseId) {
        result.push(submission);
      }
    }
    return result;
  }
  
  async createExerciseSubmission(submission: InsertExerciseSubmission): Promise<ExerciseSubmission> {
    const id = this.exerciseSubmissionIdCounter++;
    const now = new Date();
    const newSubmission: ExerciseSubmission = {
      ...submission,
      id,
      completedAt: now,
      status: submission.status || "submitted",
    };
    this.exerciseSubmissions.set(id, newSubmission);
    return newSubmission;
  }
  
  async updateExerciseSubmission(id: number, submissionData: Partial<ExerciseSubmission>): Promise<ExerciseSubmission | undefined> {
    const existingSubmission = this.exerciseSubmissions.get(id);
    if (!existingSubmission) return undefined;
    
    const updatedSubmission = { ...existingSubmission, ...submissionData };
    this.exerciseSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }
  
  async deleteExerciseSubmission(id: number): Promise<void> {
    this.exerciseSubmissions.delete(id);
  }
  
  // Seed initial framework and module data
  private seedFrameworks() {
    if (this.frameworks.size > 0) return; // already seeded
  
    // MECE Framework
    const meceId = this.frameworkIdCounter++;
    const mece: Framework = {
      id: meceId,
      name: "MECE Framework",
      description: "Mutually Exclusive, Collectively Exhaustive approach to breaking down problems into non-overlapping components.",
      level: "Intermediate",
      duration: 45,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(meceId, mece);
    
    // Design Thinking
    const designThinkingId = this.frameworkIdCounter++;
    const designThinking: Framework = {
      id: designThinkingId,
      name: "Design Thinking",
      description: "Human-centered approach to innovation that draws from the designer's toolkit to integrate human needs, technology, and business success.",
      level: "Advanced",
      duration: 90,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(designThinkingId, designThinking);
    
    // SWOT Analysis
    const swotId = this.frameworkIdCounter++;
    const swot: Framework = {
      id: swotId,
      name: "SWOT Analysis",
      description: "Structured method to evaluate the Strengths, Weaknesses, Opportunities, and Threats involved in a project or business venture.",
      level: "Beginner",
      duration: 30,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(swotId, swot);
    
    // First Principles Thinking
    const firstPrinciplesId = this.frameworkIdCounter++;
    const firstPrinciples: Framework = {
      id: firstPrinciplesId,
      name: "First Principles Thinking",
      description: "Breaking down complex problems into their most fundamental truths and building solutions from the ground up.",
      level: "Advanced",
      duration: 75,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(firstPrinciplesId, firstPrinciples);
    
    // Porter's Five Forces
    const portersFiveForcesId = this.frameworkIdCounter++;
    const portersFiveForces: Framework = {
      id: portersFiveForcesId,
      name: "Porter's Five Forces",
      description: "Framework to analyze competition intensity, attractiveness, and profitability of an industry.",
      level: "Intermediate",
      duration: 50,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(portersFiveForcesId, portersFiveForces);
    
    // Jobs-To-Be-Done
    const jobsToBeDoneId = this.frameworkIdCounter++;
    const jobsToBeDone: Framework = {
      id: jobsToBeDoneId,
      name: "Jobs-To-Be-Done",
      description: "Framework focusing on understanding customer needs and what jobs they are trying to accomplish.",
      level: "Intermediate",
      duration: 40,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(jobsToBeDoneId, jobsToBeDone);
    
    // Blue Ocean Strategy
    const blueOceanId = this.frameworkIdCounter++;
    const blueOcean: Framework = {
      id: blueOceanId,
      name: "Blue Ocean Strategy",
      description: "Framework for finding uncontested market space and making competition irrelevant.",
      level: "Advanced",
      duration: 60,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(blueOceanId, blueOcean);
    
    // SCAMPER
    const scamperId = this.frameworkIdCounter++;
    const scamper: Framework = {
      id: scamperId,
      name: "SCAMPER",
      description: "Technique for creative problem-solving and innovation by examining different aspects of a product or service.",
      level: "Intermediate",
      duration: 35,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(scamperId, scamper);
    
    // Problem-Tree Analysis
    const problemTreeId = this.frameworkIdCounter++;
    const problemTree: Framework = {
      id: problemTreeId,
      name: "Problem-Tree Analysis",
      description: "Visual method for analyzing problems by identifying causes and effects to find comprehensive solutions.",
      level: "Intermediate",
      duration: 45,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(problemTreeId, problemTree);
    
    // Pareto Principle
    const paretoId = this.frameworkIdCounter++;
    const pareto: Framework = {
      id: paretoId,
      name: "Pareto Principle",
      description: "The 80/20 rule that helps identify which inputs produce the most significant results.",
      level: "Beginner",
      duration: 25,
      status: "not_started",
      case_studies: null
    };
    this.frameworks.set(paretoId, pareto);
    
    // Add some modules to frameworks
    // MECE Modules
    this.createModule({
      frameworkId: meceId,
      name: "MECE Fundamentals",
      description: "Learn the core concepts and principles behind MECE thinking and why it's valuable for problem-solving.",
      content: "<h2>Introduction to MECE</h2><p>MECE stands for Mutually Exclusive, Collectively Exhaustive. It is a principle used by management consultants to organize information.</p>",
      examples: "Example 1: Market Segmentation\nA MECE way to segment customers might be by age groups: 0-18, 19-35, 36-50, 51-65, 65+.",
      keyTakeaways: "• MECE helps break problems into non-overlapping components\n• MECE ensures you don't miss anything in your analysis",
      completed: false,
      order: 1
    });
    
    this.createModule({
      frameworkId: meceId,
      name: "Creating MECE Structures",
      description: "Learn how to create effective MECE structures for different types of business problems.",
      completed: false,
      order: 2
    });
    
    this.createModule({
      frameworkId: meceId,
      name: "MECE Problem Analysis",
      description: "Apply MECE thinking to analyze complex business problems in a structured way.",
      completed: false,
      order: 3
    });
    
    this.createModule({
      frameworkId: meceId,
      name: "Advanced MECE Applications",
      description: "Master advanced MECE techniques for strategic business analysis and decision-making.",
      completed: false,
      order: 4
    });
    
    this.createModule({
      frameworkId: meceId,
      name: "Real-world Case Studies",
      description: "Study real-world examples where MECE principles led to breakthrough insights.",
      completed: false,
      order: 5
    });
    
    // Design Thinking modules
    this.createModule({
      frameworkId: designThinkingId,
      name: "Design Thinking Introduction",
      description: "Understand the core philosophy and principles of design thinking.",
      content: "<h2>What is Design Thinking?</h2><p>Design Thinking is a human-centered approach to innovation that draws from the designer's toolkit.</p>",
      examples: "Example: IDEO Shopping Cart\nIDEO's famous redesign of the shopping cart used design thinking to observe shoppers and identify pain points.",
      keyTakeaways: "• Design thinking puts humans at the center of the process\n• The approach encourages bold, creative ideas",
      completed: false,
      order: 1
    });
    
    this.createModule({
      frameworkId: designThinkingId,
      name: "Empathize Phase",
      description: "Learn techniques to understand users and their needs through observation and engagement.",
      completed: false,
      order: 2
    });
    
    // SWOT modules
    this.createModule({
      frameworkId: swotId,
      name: "SWOT Fundamentals",
      description: "Learn the basics of SWOT analysis and when to use it.",
      content: "<h2>Understanding SWOT Analysis</h2><p>SWOT Analysis is a strategic planning technique used to help identify Strengths, Weaknesses, Opportunities, and Threats.</p>",
      examples: "Example: Tesla SWOT\nStrengths: Brand recognition, innovative technology\nWeaknesses: Production challenges, high costs\nOpportunities: Growing EV market, expansion to energy storage\nThreats: Increasing competition, regulatory changes",
      keyTakeaways: "• SWOT provides a structured way to evaluate internal and external factors\n• Internal factors are Strengths and Weaknesses (things you can control)",
      completed: false,
      order: 1
    });
    
    this.createModule({
      frameworkId: swotId,
      name: "Identifying Strengths",
      description: "Techniques for identifying and accurately assessing organizational strengths.",
      completed: false,
      order: 2
    });
  }
}

// Import the PostgresStorage from db-storage.ts file
import { PostgresStorage as DatabaseStorage } from "./db-storage";

// Use PostgreSQL for persistent storage
export const storage = new DatabaseStorage();