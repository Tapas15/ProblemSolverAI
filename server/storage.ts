import { users, frameworks, modules, userProgress, aiConversations } from "@shared/schema";
import type { User, InsertUser, Framework, InsertFramework, Module, InsertModule, UserProgress, InsertUserProgress, AiConversation, InsertAiConversation } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
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
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private frameworks: Map<number, Framework>;
  private modules: Map<number, Module>;
  private userProgress: Map<number, UserProgress>;
  private aiConversations: Map<number, AiConversation>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private frameworkIdCounter: number;
  private moduleIdCounter: number;
  private progressIdCounter: number;
  private conversationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.frameworks = new Map();
    this.modules = new Map();
    this.userProgress = new Map();
    this.aiConversations = new Map();
    
    this.userIdCounter = 1;
    this.frameworkIdCounter = 1;
    this.moduleIdCounter = 1;
    this.progressIdCounter = 1;
    this.conversationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Seed some initial frameworks
    this.seedFrameworks();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Framework methods
  async getFramework(id: number): Promise<Framework | undefined> {
    return this.frameworks.get(id);
  }
  
  async getAllFrameworks(): Promise<Framework[]> {
    return Array.from(this.frameworks.values());
  }
  
  async getFrameworkByName(name: string): Promise<Framework | undefined> {
    return Array.from(this.frameworks.values()).find(
      (framework) => framework.name === name,
    );
  }
  
  async createFramework(framework: InsertFramework): Promise<Framework> {
    const id = this.frameworkIdCounter++;
    const newFramework: Framework = { ...framework, id };
    this.frameworks.set(id, newFramework);
    return newFramework;
  }
  
  async updateFramework(id: number, frameworkData: Partial<Framework>): Promise<Framework | undefined> {
    const framework = this.frameworks.get(id);
    if (!framework) return undefined;
    
    const updatedFramework = { ...framework, ...frameworkData };
    this.frameworks.set(id, updatedFramework);
    return updatedFramework;
  }
  
  // Module methods
  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }
  
  async getModulesByFrameworkId(frameworkId: number): Promise<Module[]> {
    return Array.from(this.modules.values())
      .filter(module => module.frameworkId === frameworkId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createModule(module: InsertModule): Promise<Module> {
    const id = this.moduleIdCounter++;
    const newModule: Module = { ...module, id };
    this.modules.set(id, newModule);
    return newModule;
  }
  
  async updateModule(id: number, moduleData: Partial<Module>): Promise<Module | undefined> {
    const module = this.modules.get(id);
    if (!module) return undefined;
    
    const updatedModule = { ...module, ...moduleData };
    this.modules.set(id, updatedModule);
    return updatedModule;
  }
  
  // UserProgress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }
  
  async getUserProgressByFramework(userId: number, frameworkId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values()).find(
      (progress) => progress.userId === userId && progress.frameworkId === frameworkId,
    );
  }
  
  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const id = this.progressIdCounter++;
    const now = new Date();
    const newProgress: UserProgress = { ...progress, id, lastUpdated: now };
    this.userProgress.set(id, newProgress);
    return newProgress;
  }
  
  async updateUserProgress(id: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const progress = this.userProgress.get(id);
    if (!progress) return undefined;
    
    const now = new Date();
    const updatedProgress = { ...progress, ...progressData, lastUpdated: now };
    this.userProgress.set(id, updatedProgress);
    return updatedProgress;
  }
  
  // AI Conversation methods
  async getAiConversations(userId: number): Promise<AiConversation[]> {
    return Array.from(this.aiConversations.values())
      .filter(conversation => conversation.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const newConversation: AiConversation = { ...conversation, id, createdAt: now };
    this.aiConversations.set(id, newConversation);
    return newConversation;
  }
  
  // Seed data for frameworks and modules
  private seedFrameworks() {
    // MECE Framework
    const mece = this.createFramework({
      name: "MECE Framework",
      description: "Mutually Exclusive, Collectively Exhaustive approach to breaking down problems into non-overlapping components.",
      level: "Intermediate",
      duration: 45,
      status: "not_started"
    });
    
    // Design Thinking
    const designThinking = this.createFramework({
      name: "Design Thinking",
      description: "Human-centered approach to innovation that draws from the designer's toolkit to integrate human needs, technology, and business success.",
      level: "Advanced",
      duration: 90,
      status: "not_started"
    });
    
    // SWOT Analysis
    const swot = this.createFramework({
      name: "SWOT Analysis",
      description: "Structured method to evaluate the Strengths, Weaknesses, Opportunities, and Threats involved in a project or business venture.",
      level: "Beginner",
      duration: 30,
      status: "not_started"
    });
    
    // First Principles Thinking
    const firstPrinciples = this.createFramework({
      name: "First Principles Thinking",
      description: "Breaking down complex problems into their most fundamental truths and building solutions from the ground up.",
      level: "Advanced",
      duration: 75,
      status: "not_started"
    });
    
    // Porter's Five Forces
    const portersFiveForces = this.createFramework({
      name: "Porter's Five Forces",
      description: "Framework to analyze competition intensity, attractiveness, and profitability of an industry.",
      level: "Intermediate",
      duration: 50,
      status: "not_started"
    });
    
    // Jobs-To-Be-Done
    const jobsToBeDone = this.createFramework({
      name: "Jobs-To-Be-Done",
      description: "Framework focusing on understanding customer needs and what jobs they are trying to accomplish.",
      level: "Intermediate",
      duration: 40,
      status: "not_started"
    });
    
    // Blue Ocean Strategy
    const blueOcean = this.createFramework({
      name: "Blue Ocean Strategy",
      description: "Framework for finding uncontested market space and making competition irrelevant.",
      level: "Advanced",
      duration: 60,
      status: "not_started"
    });
    
    // SCAMPER
    const scamper = this.createFramework({
      name: "SCAMPER",
      description: "Technique for creative problem-solving and innovation by examining different aspects of a product or service.",
      level: "Intermediate",
      duration: 35,
      status: "not_started"
    });
    
    // Problem-Tree Analysis
    const problemTree = this.createFramework({
      name: "Problem-Tree Analysis",
      description: "Visual method for analyzing problems by identifying causes and effects to find comprehensive solutions.",
      level: "Intermediate",
      duration: 45,
      status: "not_started"
    });
    
    // Pareto Principle
    const pareto = this.createFramework({
      name: "Pareto Principle",
      description: "The 80/20 rule that helps identify which inputs produce the most significant results.",
      level: "Beginner",
      duration: 25,
      status: "not_started"
    });
    
    // Add some modules to frameworks
    Promise.all([
      // MECE modules
      this.createModule({
        frameworkId: 1,
        name: "MECE Fundamentals",
        description: "Learn the core concepts and principles behind MECE thinking and why it's valuable for problem-solving.",
        completed: false,
        order: 1
      }),
      this.createModule({
        frameworkId: 1,
        name: "Creating MECE Structures",
        description: "Learn how to create effective MECE structures for different types of business problems.",
        completed: false,
        order: 2
      }),
      this.createModule({
        frameworkId: 1,
        name: "Real-world Applications",
        description: "Apply MECE thinking to actual business cases and practice structuring complex problems.",
        completed: false,
        order: 3
      }),
      
      // Design Thinking modules
      this.createModule({
        frameworkId: 2,
        name: "Empathize",
        description: "Learn techniques to understand users and their needs through observation and engagement.",
        completed: false,
        order: 1
      }),
      this.createModule({
        frameworkId: 2,
        name: "Define",
        description: "Synthesize observations to define the core problems to be solved.",
        completed: false,
        order: 2
      }),
      this.createModule({
        frameworkId: 2,
        name: "Ideate",
        description: "Generate a range of creative solutions through brainstorming and divergent thinking.",
        completed: false,
        order: 3
      }),
      this.createModule({
        frameworkId: 2,
        name: "Prototype",
        description: "Build representations of one or more of your solutions to test and refine.",
        completed: false,
        order: 4
      }),
      this.createModule({
        frameworkId: 2,
        name: "Test",
        description: "Test prototypes with users to gather feedback and iterate on solutions.",
        completed: false,
        order: 5
      }),
      
      // SWOT modules
      this.createModule({
        frameworkId: 3,
        name: "SWOT Fundamentals",
        description: "Learn the basics of SWOT analysis and when to use it.",
        completed: false,
        order: 1
      }),
      this.createModule({
        frameworkId: 3,
        name: "Applying SWOT",
        description: "Practice applying SWOT analysis to various business scenarios.",
        completed: false,
        order: 2
      })
    ]);
  }
}

export const storage = new MemStorage();
