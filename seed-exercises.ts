import { db } from './server/db';
import { exercises } from './shared/schema';
import { eq } from 'drizzle-orm';

async function seedExercises() {
  console.log('Seeding exercises...');

  try {
    // First, check if we already have exercises
    const existingExercises = await db.select().from(exercises);
    
    if (existingExercises.length > 0) {
      console.log(`Found ${existingExercises.length} existing exercises, no need to seed.`);
      return;
    }

    // Sample exercises for MECE Framework (Framework ID: 1)
    const meceExercises = [
      {
        frameworkId: 1,
        moduleId: 1, // Adjust based on your module structure
        title: "Market Segmentation Analysis",
        description: "Apply the MECE framework to segment a market for a new product.",
        scenario: `You are a product manager at a tech company planning to launch a new smartwatch. 
        Your task is to segment the market in a MECE (Mutually Exclusive, Collectively Exhaustive) way to identify potential customer groups and their needs.
        
        Consider different segmentation criteria such as demographics, usage patterns, and buying behaviors.`,
        steps: `1. Identify the overall market for smartwatches.
2. Define 3-5 main segmentation categories that are mutually exclusive.
3. Break down each category into specific segments ensuring collective exhaustiveness.
4. Create a structured MECE framework diagram showing your segmentation.
5. Briefly describe each segment's key characteristics and needs.`,
        difficulty: "Intermediate",
        estimatedTime: 30,
        resources: "https://www.mckinsey.com/business-functions/strategy-and-corporate-finance/our-insights/the-secret-to-unlocking-hidden-value-in-the-balance-sheet",
        sampleSolution: `A strong solution would include:
1. Clear top-level segmentation categories (e.g., by user type, by use case, by price sensitivity)
2. Mutually exclusive sub-segments within each category
3. Collectively exhaustive coverage of the market
4. Logical structure showing MECE principles
5. Clear identification of segment needs`,
      },
      {
        frameworkId: 1,
        moduleId: 2,
        title: "Root Cause Analysis",
        description: "Use MECE to perform a comprehensive root cause analysis of a business problem.",
        scenario: `Your company, an e-commerce retailer, has experienced a 25% decline in customer retention over the past quarter. 
        As a business analyst, you've been tasked with conducting a thorough root cause analysis using the MECE framework.
        
        You need to identify all possible causes for the decline and organize them in a structured, MECE way.`,
        steps: `1. Define the problem statement clearly.
2. Identify major categories of potential causes (make sure they are mutually exclusive).
3. Break down each category into specific factors ensuring no overlaps.
4. Ensure all possible causes are covered (collectively exhaustive).
5. Present your analysis as a MECE issue tree.`,
        difficulty: "Advanced",
        estimatedTime: 45,
        resources: "https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-seven-decisions-that-matter-in-a-digital-transformation",
        sampleSolution: `A comprehensive solution would include:
1. Problem statement: "25% decline in customer retention over past quarter"
2. MECE categories like: Product Issues, Customer Experience Issues, Competitive Factors, External Market Factors
3. Specific factors within each category with no overlaps
4. Structured issue tree showing MECE thinking
5. Brief assessment of the most likely root causes`,
      }
    ];

    // Sample exercises for SWOT Analysis (Framework ID: 3)
    const swotExercises = [
      {
        frameworkId: 3,
        moduleId: 10, // Adjust based on your module structure
        title: "Competitive SWOT Analysis",
        description: "Perform a comprehensive SWOT analysis of a company facing new market entrants.",
        scenario: `You are a strategic consultant hired by a mid-sized retail bookstore chain that has been in business for 15 years. 
        The company is facing increasing competition from both large online retailers and new local independent bookstores with unique value propositions.
        
        The CEO has asked you to conduct a thorough SWOT analysis to help inform their strategic planning for the next 3-5 years.`,
        steps: `1. Identify key internal strengths of the bookstore chain.
2. Analyze notable internal weaknesses in the current business model.
3. Research external opportunities in the current market environment.
4. Evaluate significant threats from competitors and market trends.
5. Organize your findings in a structured SWOT matrix.
6. Provide brief strategic recommendations based on your analysis.`,
        difficulty: "Beginner",
        estimatedTime: 30,
        resources: null,
        sampleSolution: `A strong SWOT analysis would include:
- Strengths: Established brand presence, physical browsing experience, community relationships
- Weaknesses: Higher operational costs, limited online presence, traditional inventory management
- Opportunities: Enhanced digital integration, community events, specialized curation
- Threats: E-commerce dominance, changing reading habits, rising rents
        
Strategic recommendations should focus on leveraging strengths to capture opportunities while addressing weaknesses and mitigating threats.`,
      }
    ];

    // Sample exercises for First Principles (Framework ID: 4)
    const firstPrinciplesExercises = [
      {
        frameworkId: 4,
        moduleId: 15, // Adjust based on your module structure
        title: "First Principles Approach to Business Model Innovation",
        description: "Apply first principles thinking to reimagine an existing business model.",
        scenario: `You work as an innovation consultant for a traditional grocery store chain that has operated with the same business model for decades. 
        The industry is being disrupted by meal kit delivery services, online grocery delivery, and specialized food retailers.
        
        Your task is to use first principles thinking to break down the grocery business model to its fundamental elements and reimagine a new approach.`,
        steps: `1. Identify the fundamental purpose of grocery retail (the core customer need being served).
2. Break down the existing business model into its basic components.
3. Question all assumptions about how grocery retail "should" work.
4. Rebuild a new model based on first principles rather than by analogy to existing models.
5. Outline key innovations in your reimagined business model.`,
        difficulty: "Expert",
        estimatedTime: 60,
        resources: "https://fs.blog/first-principles/",
        sampleSolution: `A strong first principles analysis would:
1. Start with core customer need: convenient access to food and household necessities
2. Question assumptions about physical stores, inventory models, shopping frequency, pricing structures
3. Rebuild from first principles considering technologies and behaviors that weren't available when traditional models emerged
4. Address fundamental inefficiencies in traditional model
5. Potentially integrate supply chain innovations, personalization, sustainability, and community elements`,
      }
    ];

    // Combine all exercises
    const allExercises = [...meceExercises, ...swotExercises, ...firstPrinciplesExercises];

    // Insert exercises into database
    for (const exercise of allExercises) {
      await db.insert(exercises).values({
        ...exercise,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log(`Successfully seeded ${allExercises.length} exercises`);
  } catch (error) {
    console.error('Error seeding exercises:', error);
  }
}

// Run the seeding function
seedExercises()
  .then(() => {
    console.log('Exercise seeding complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed exercises:', error);
    process.exit(1);
  });