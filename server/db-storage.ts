import { users, frameworks, modules, userProgress, aiConversations } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import type { User, InsertUser, Framework, InsertFramework, Module, InsertModule, UserProgress, InsertUserProgress, AiConversation, InsertAiConversation } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { IStorage } from "./storage";
import { db, pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class PostgresStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Session store
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true,
    });
    
    // Initialize database
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {      
      // Seed initial data if needed
      const frameworksCount = await db.select().from(frameworks).execute();
      if (frameworksCount.length === 0) {
        console.log("Seeding initial framework data");
        await this.seedFrameworks();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).execute();
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username)).execute();
    return results[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email)).execute();
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await db.insert(users).values(user).returning().execute();
    return results[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const results = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  // Framework methods
  async getFramework(id: number): Promise<Framework | undefined> {
    const results = await db.select().from(frameworks).where(eq(frameworks.id, id)).execute();
    return results[0];
  }
  
  async getAllFrameworks(): Promise<Framework[]> {
    return await db.select().from(frameworks).execute();
  }
  
  async getFrameworkByName(name: string): Promise<Framework | undefined> {
    const results = await db.select().from(frameworks).where(eq(frameworks.name, name)).execute();
    return results[0];
  }
  
  async createFramework(framework: InsertFramework): Promise<Framework> {
    const results = await db.insert(frameworks).values(framework).returning().execute();
    return results[0];
  }
  
  async updateFramework(id: number, frameworkData: Partial<Framework>): Promise<Framework | undefined> {
    const results = await db
      .update(frameworks)
      .set(frameworkData)
      .where(eq(frameworks.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  // Module methods
  async getModule(id: number): Promise<Module | undefined> {
    const results = await db.select().from(modules).where(eq(modules.id, id)).execute();
    return results[0];
  }
  
  async getModulesByFrameworkId(frameworkId: number): Promise<Module[]> {
    return await db
      .select()
      .from(modules)
      .where(eq(modules.frameworkId, frameworkId))
      .orderBy(modules.order)
      .execute();
  }
  
  async createModule(module: InsertModule): Promise<Module> {
    const results = await db.insert(modules).values(module).returning().execute();
    return results[0];
  }
  
  async updateModule(id: number, moduleData: Partial<Module>): Promise<Module | undefined> {
    const results = await db
      .update(modules)
      .set(moduleData)
      .where(eq(modules.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  // UserProgress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .execute();
  }
  
  async getUserProgressByFramework(userId: number, frameworkId: number): Promise<UserProgress | undefined> {
    const results = await db
      .select()
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.frameworkId, frameworkId)
      ))
      .execute();
    return results[0];
  }
  
  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const results = await db
      .insert(userProgress)
      .values({
        ...progress,
        lastUpdated: new Date()
      })
      .returning()
      .execute();
    return results[0];
  }
  
  async updateUserProgress(id: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const results = await db
      .update(userProgress)
      .set({
        ...progressData,
        lastUpdated: new Date()
      })
      .where(eq(userProgress.id, id))
      .returning()
      .execute();
    return results[0];
  }
  
  // AI Conversation methods
  async getAiConversations(userId: number): Promise<AiConversation[]> {
    return await db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.createdAt))
      .execute();
  }
  
  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const results = await db
      .insert(aiConversations)
      .values({
        ...conversation,
        createdAt: new Date()
      })
      .returning()
      .execute();
    return results[0];
  }
  
  // Seed data for frameworks and modules
  private async seedFrameworks() {
    try {
      // MECE Framework
      const mece = await this.createFramework({
        name: "MECE Framework",
        description: "Mutually Exclusive, Collectively Exhaustive approach to breaking down problems into non-overlapping components.",
        level: "Intermediate",
        duration: 45,
        status: "not_started"
      });
      const meceId = mece.id;
      
      // Design Thinking
      const designThinking = await this.createFramework({
        name: "Design Thinking",
        description: "Human-centered approach to innovation that draws from the designer's toolkit to integrate human needs, technology, and business success.",
        level: "Advanced",
        duration: 90,
        status: "not_started"
      });
      const designThinkingId = designThinking.id;
      
      // SWOT Analysis
      const swot = await this.createFramework({
        name: "SWOT Analysis",
        description: "Structured method to evaluate the Strengths, Weaknesses, Opportunities, and Threats involved in a project or business venture.",
        level: "Beginner",
        duration: 30,
        status: "not_started"
      });
      const swotId = swot.id;
      
      // First Principles Thinking
      const firstPrinciples = await this.createFramework({
        name: "First Principles Thinking",
        description: "Breaking down complex problems into their most fundamental truths and building solutions from the ground up.",
        level: "Advanced", 
        duration: 75,
        status: "not_started"
      });
      const firstPrinciplesId = firstPrinciples.id;
      
      // Porter's Five Forces
      const portersFiveForces = await this.createFramework({
        name: "Porter's Five Forces",
        description: "Framework to analyze competition intensity, attractiveness, and profitability of an industry.",
        level: "Intermediate",
        duration: 50,
        status: "not_started"
      });
      const portersFiveForcesId = portersFiveForces.id;
      
      // Jobs-To-Be-Done
      const jobsToBeDone = await this.createFramework({
        name: "Jobs-To-Be-Done",
        description: "Framework focusing on understanding customer needs and what jobs they are trying to accomplish.",
        level: "Intermediate",
        duration: 40,
        status: "not_started"
      });
      const jobsToBeDoneId = jobsToBeDone.id;
      
      // Blue Ocean Strategy
      const blueOcean = await this.createFramework({
        name: "Blue Ocean Strategy",
        description: "Framework for finding uncontested market space and making competition irrelevant.",
        level: "Advanced",
        duration: 60,
        status: "not_started"
      });
      const blueOceanId = blueOcean.id;
      
      // SCAMPER
      const scamper = await this.createFramework({
        name: "SCAMPER",
        description: "Technique for creative problem-solving and innovation by examining different aspects of a product or service.",
        level: "Intermediate",
        duration: 35,
        status: "not_started"
      });
      const scamperId = scamper.id;
      
      // Problem-Tree Analysis
      const problemTree = await this.createFramework({
        name: "Problem-Tree Analysis",
        description: "Visual method for analyzing problems by identifying causes and effects to find comprehensive solutions.",
        level: "Intermediate",
        duration: 45,
        status: "not_started"
      });
      const problemTreeId = problemTree.id;
      
      // Pareto Principle
      const pareto = await this.createFramework({
        name: "Pareto Principle",
        description: "The 80/20 rule that helps identify which inputs produce the most significant results.",
        level: "Beginner",
        duration: 25,
        status: "not_started"
      });
      const paretoId = pareto.id;
      
      // Add some modules to MECE framework
      await Promise.all([
        // MECE modules
        this.createModule({
          frameworkId: meceId,
          name: "MECE Fundamentals",
          description: "Learn the core concepts and principles behind MECE thinking and why it's valuable for problem-solving.",
          content: "<h2>Introduction to MECE</h2><p>MECE stands for Mutually Exclusive, Collectively Exhaustive. It is a principle used by management consultants to organize information. Using the MECE principle helps ensure that categories of information do not overlap (Mutually Exclusive) and that all relevant categories have been considered (Collectively Exhaustive).</p><h2>Why MECE Matters</h2><p>MECE thinking creates clarity and prevents confusion in your problem-solving approach. By creating distinct, non-overlapping categories that cover all possibilities, you can systematically analyze problems without missing anything important.</p>",
          examples: "Example 1: Market Segmentation\nA MECE way to segment customers might be by age groups: 0-18, 19-35, 36-50, 51-65, 65+. Each customer falls into exactly one category, and all possible ages are covered.\n\nExample 2: Revenue Analysis\nA MECE breakdown of company revenue could be: Product A sales, Product B sales, Product C sales, Services revenue, Licensing revenue.",
          keyTakeaways: "• MECE helps break problems into non-overlapping components\n• MECE ensures you don't miss anything in your analysis\n• MECE creates clarity and prevents confusion\n• MECE is a foundational principle in management consulting",
          completed: false,
          order: 1
        }),
        this.createModule({
          frameworkId: meceId,
          name: "Creating MECE Structures",
          description: "Learn how to create effective MECE structures for different types of business problems.",
          content: "<h2>Building MECE Frameworks</h2><p>Creating effective MECE structures requires careful thought about how to divide information. Some common ways to create MECE structures include:</p><ul><li>Process steps (sequential stages that cover the entire process)</li><li>Mathematical relationships (components that add up to 100%)</li><li>Organizational elements (different departments that together make up the whole company)</li><li>Customer segments (different customer types that together represent all customers)</li></ul>",
          examples: "Example 1: Cost Structure Analysis\nA MECE breakdown of company costs: Fixed costs (rent, salaries, insurance) and Variable costs (raw materials, commissions, utilities).\n\nExample 2: Product Development Process\nA MECE breakdown: Research → Design → Prototype → Test → Manufacture → Launch → Support",
          keyTakeaways: "• Choose logical categories that don't overlap\n• Ensure your categories cover all possibilities\n• Test your structure by checking if any items could fit in multiple categories\n• Verify that no important aspects are left out",
          completed: false,
          order: 2
        }),
        this.createModule({
          frameworkId: meceId,
          name: "MECE Problem Analysis",
          description: "Apply MECE thinking to analyze complex business problems in a structured way.",
          completed: false,
          order: 3
        }),
        this.createModule({
          frameworkId: meceId,
          name: "Advanced MECE Applications",
          description: "Master advanced MECE techniques for strategic business analysis and decision-making.",
          completed: false,
          order: 4
        }),
        this.createModule({
          frameworkId: meceId,
          name: "Real-world Case Studies",
          description: "Study real-world examples where MECE principles led to breakthrough insights.",
          completed: false,
          order: 5
        }),
        
        // Design Thinking modules
        this.createModule({
          frameworkId: designThinkingId,
          name: "Design Thinking Introduction",
          description: "Understand the core philosophy and principles of design thinking.",
          content: "<h2>What is Design Thinking?</h2><p>Design Thinking is a human-centered approach to innovation that draws from the designer's toolkit to integrate the needs of people, the possibilities of technology, and the requirements for business success.</p><h2>Core Principles</h2><p>Design thinking emphasizes:</p><ul><li>Human-centered design that puts the user first</li><li>Collaboration between multidisciplinary teams</li><li>Iterative approach with rapid prototyping</li><li>Action-oriented mindset focused on creating and testing</li></ul>",
          examples: "Example 1: IDEO Shopping Cart\nIDEO's famous redesign of the shopping cart used design thinking to observe shoppers, identify pain points, and create a more user-friendly cart with features like removable baskets and a scanner to skip checkout lines.\n\nExample 2: Airbnb\nWhen Airbnb was struggling, they used design thinking to understand why properties weren't booking. By visiting hosts and improving photography, they transformed their business.",
          keyTakeaways: "• Design thinking puts humans at the center of the process\n• The approach encourages bold, creative ideas\n• Design thinking combines analytical and creative thinking\n• The process is highly adaptable to various industries and problems",
          completed: false,
          order: 1
        }),
        this.createModule({
          frameworkId: designThinkingId,
          name: "Empathize Phase",
          description: "Learn techniques to understand users and their needs through observation and engagement.",
          completed: false,
          order: 2
        }),
        this.createModule({
          frameworkId: designThinkingId,
          name: "Define Phase",
          description: "Synthesize observations to define the core problems to be solved.",
          completed: false,
          order: 3
        }),
        this.createModule({
          frameworkId: designThinkingId,
          name: "Ideate Phase",
          description: "Generate a range of creative solutions through brainstorming and divergent thinking.",
          completed: false,
          order: 4
        }),
        this.createModule({
          frameworkId: designThinkingId,
          name: "Prototype Phase",
          description: "Build representations of one or more of your solutions to test and refine.",
          completed: false,
          order: 5
        }),
        this.createModule({
          frameworkId: designThinkingId,
          name: "Test Phase",
          description: "Test prototypes with users to gather feedback and iterate on solutions.",
          completed: false,
          order: 6
        }),
        this.createModule({
          frameworkId: designThinkingId,
          name: "Design Thinking in Business",
          description: "Apply design thinking to solve business challenges and drive innovation.",
          completed: false,
          order: 7
        }),
        
        // SWOT modules
        this.createModule({
          frameworkId: swotId,
          name: "SWOT Fundamentals",
          description: "Learn the basics of SWOT analysis and when to use it.",
          content: "<h2>Understanding SWOT Analysis</h2><p>SWOT Analysis is a strategic planning technique used to help a person or organization identify Strengths, Weaknesses, Opportunities, and Threats related to business competition or project planning.</p><h2>The Four Elements</h2><ul><li><strong>Strengths:</strong> Internal attributes and resources that support a successful outcome</li><li><strong>Weaknesses:</strong> Internal attributes and resources that work against a successful outcome</li><li><strong>Opportunities:</strong> External factors that the project or business could leverage to its advantage</li><li><strong>Threats:</strong> External factors that could jeopardize the project or business</li></ul>",
          examples: "Example 1: Tesla SWOT\nStrengths: Brand recognition, innovative technology, first-mover advantage\nWeaknesses: Production challenges, high costs, limited service centers\nOpportunities: Growing EV market, expansion to energy storage, international markets\nThreats: Increasing competition, regulatory changes, supply chain disruptions\n\nExample 2: Small Coffee Shop SWOT\nStrengths: Quality products, loyal customer base, prime location\nWeaknesses: Limited space, higher prices than chains, small marketing budget\nOpportunities: Growing specialty coffee trend, local partnerships, online ordering\nThreats: New competitors, economic downturn, rising rent costs",
          keyTakeaways: "• SWOT provides a structured way to evaluate internal and external factors\n• Internal factors are Strengths and Weaknesses (things you can control)\n• External factors are Opportunities and Threats (things you can't control)\n• SWOT is most valuable when it leads to actionable strategies",
          completed: false,
          order: 1
        }),
        this.createModule({
          frameworkId: swotId,
          name: "Identifying Strengths",
          description: "Techniques for identifying and accurately assessing organizational strengths.",
          completed: false,
          order: 2
        }),
        this.createModule({
          frameworkId: swotId,
          name: "Analyzing Weaknesses",
          description: "Methods for objectively evaluating internal weaknesses and vulnerabilities.",
          completed: false,
          order: 3
        }),
        this.createModule({
          frameworkId: swotId,
          name: "Spotting Opportunities",
          description: "How to identify external opportunities that can give competitive advantage.",
          completed: false,
          order: 4
        }),
        this.createModule({
          frameworkId: swotId,
          name: "Evaluating Threats",
          description: "Techniques for assessing external threats and developing mitigation strategies.",
          completed: false,
          order: 5
        }),
        this.createModule({
          frameworkId: swotId,
          name: "SWOT in Action",
          description: "Apply SWOT analysis to various business scenarios with detailed case studies.",
          completed: false,
          order: 6
        })
      ]);
      
      console.log("Framework and module data seeded successfully");
    } catch (error) {
      console.error("Error seeding framework data:", error);
    }
  }
}