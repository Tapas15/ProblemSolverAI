// This script uses OpenAI to generate content for learning modules
import OpenAI from 'openai';
import * as fs from 'fs/promises';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define module structure for Pareto Principle
const paretoModules = [
  {
    frameworkId: 10,
    name: "Understanding the 80/20 Rule",
    description: "Learn the core concept of the Pareto Principle and its origins.",
    order: 1
  },
  {
    frameworkId: 10,
    name: "Identifying the Vital Few",
    description: "Techniques for recognizing the critical 20% in business situations.",
    order: 2
  },
  {
    frameworkId: 10,
    name: "Applying Pareto to Time Management",
    description: "Use the 80/20 rule to maximize productivity and focus on high-impact activities.",
    order: 3
  },
  {
    frameworkId: 10,
    name: "Pareto Analysis in Problem Solving",
    description: "Using the principle to prioritize issues and focus on root causes.",
    order: 4
  },
  {
    frameworkId: 10,
    name: "Pareto in Business Strategy",
    description: "Strategic applications of the 80/20 rule for resource allocation and decision-making.",
    order: 5
  },
  {
    frameworkId: 10,
    name: "Advanced Pareto Applications",
    description: "Explore complex applications and variations of the Pareto Principle.",
    order: 6
  }
];

// Function to generate content for a module using OpenAI
async function generateModuleContent(module) {
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  const prompt = `
Create comprehensive educational content for a business framework learning module with the following details:

Module Name: ${module.name}
Description: ${module.description}
Framework: Pareto Principle (80/20 Rule)

Please format your response in JSON with these fields:
1. "content": HTML-formatted main content with h2, h3, p, ul, li tags as appropriate (800-1000 words)
2. "examples": 2-3 clear real-world examples in plain text (200-300 words)
3. "keyTakeaways": 4-6 bullet points of key learnings (prefix each with • symbol, 150 words max)

Make the content educational, practical, and business-focused.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content);
    return {
      ...module,
      content: content.content,
      examples: content.examples,
      keyTakeaways: content.keyTakeaways,
      completed: false
    };
  } catch (error) {
    console.error(`Error generating content for module "${module.name}":`, error);
    return null;
  }
}

// Main function to generate and save all module content
async function generateAllModules() {
  const completedModules = [];
  
  for (const module of paretoModules) {
    console.log(`Generating content for module: ${module.name}`);
    const completedModule = await generateModuleContent(module);
    if (completedModule) {
      completedModules.push(completedModule);
      console.log(`✓ Generated content for ${module.name}`);
    }
  }
  
  // Save the modules to a JSON file
  await fs.writeFile('pareto-modules.json', JSON.stringify(completedModules, null, 2));
  console.log(`Successfully created content for ${completedModules.length} modules!`);
}

// Run the function
generateAllModules().catch(err => console.error('Error in main process:', err));