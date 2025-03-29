// CommonJS version of the improved quiz generator
// This version uses direct database connections and doesn't rely on ESM imports

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { drizzle } = require('drizzle-orm/postgres-js');
const { eq } = require('drizzle-orm');
const postgres = require('postgres');
const { pgTable, text, serial, integer, boolean, timestamp } = require('drizzle-orm/pg-core');
const fs = require('fs');

// Define schemas directly since we can't easily import from shared/schema.ts in CommonJS
const frameworks = pgTable("frameworks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  level: text("level"),
  duration: integer("duration"),
  image_url: text("image_url"),
  status: text("status"),
  case_studies: text("case_studies")
});

const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  frameworkId: integer("framework_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  keyTakeaways: text("key_takeaways"),
  order: integer("order").notNull(),
  examples: text("examples"),
  quiz_questions: text("quiz_questions"),
  video_url: text("video_url"),
  resources: text("resources"),
  scorm_path: text("scorm_path"),
  image_url: text("image_url"),
  completed: boolean("completed")
});

const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  frameworkId: integer("framework_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(), // 'beginner', 'intermediate', 'advanced'
  timeLimit: integer("time_limit"), 
  passingScore: integer("passing_score"), 
  questions: text("questions").notNull(), // JSON string of questions
  is_active: boolean("is_active")
});

// Create a schema object for drizzle
const schema = { frameworks, modules, quizzes };

// Get database connection
const client = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Script configuration
const CONFIG = {
  MAX_RETRIES: 5,
  DELAY_BETWEEN_LEVELS: 3000,      // 3 seconds
  DELAY_BETWEEN_FRAMEWORKS: 5000,  // 5 seconds
  RETRY_DELAY: 10000,              // 10 seconds
  ERROR_RETRY_DELAY: 15000,        // 15 seconds
  CHECKPOINT_FILE: './quiz-generation-checkpoint.json',
  QUESTION_COUNTS: {
    beginner: 10,
    intermediate: 15,
    advanced: 20
  },
  MODEL: "gemini-1.5-pro",
  TEMPERATURE: 0.8,  // Slightly increased for more creative questions
  MAX_OUTPUT_TOKENS: 8000
};

/**
 * Generate unique quiz questions for a specific framework and level 
 * using content from its modules
 */
async function generateQuizQuestions(frameworkId, frameworkName, level, moduleContents) {
  console.log(`Generating ${level} level questions for ${frameworkName}...`);
  
  const questionCount = CONFIG.QUESTION_COUNTS[level];
  
  const prompt = `
As an expert in business frameworks, create ${questionCount} unique multiple-choice questions for a ${level} level quiz about the ${frameworkName} framework.

Use the following module content as source material for the questions:
${moduleContents}

For each question:
1. Make the question relevant to the framework and appropriate for ${level} level
2. Provide 4 possible answers (a, b, c, d)
3. Indicate the correct answer (0 for a, 1 for b, 2 for c, 3 for d)
4. Include a brief explanation of the correct answer

Return the results in the following JSON format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["option a", "option b", "option c", "option d"],
      "correctAnswer": 0,
      "explanation": "Explanation why the correct answer is right"
    }
  ]
}

Important guidelines:
- Each question should be unique and not duplicated from other frameworks
- For beginner questions, focus on core concepts and basic applications
- For intermediate questions, include scenario-based questions and deeper understanding
- For advanced questions, include complex scenarios, edge cases, and strategic applications
- Questions should be challenging but fair for the indicated level
- Ensure high-quality, professional language
- Make sure questions are clear, unambiguous, and have only one correct answer
- Do not reference specific company names unless they are mentioned in the source material
- Questions should cover a range of aspects of the framework, not just one area
`;

  // Get the Gemini model instance
  const model = genAI.getGenerativeModel({ 
    model: CONFIG.MODEL 
  });
  
  // Implement retry logic with exponential backoff
  for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`  Attempt ${attempt + 1}/${CONFIG.MAX_RETRIES}...`);
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: CONFIG.TEMPERATURE,
          maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS,
        }
      });
      
      const response = result.response;
      const textResult = response.text();
      
      // Extract JSON from the response
      // Gemini might wrap the JSON in markdown code blocks or add additional text
      const jsonMatch = textResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log("No valid JSON found in the response. Raw response:");
        console.log(textResult.substring(0, 500) + "...");
        throw new Error("No valid JSON found in the response");
      }
      
      try {
        const parsedResult = JSON.parse(jsonMatch[0]);
        if (!parsedResult.questions || !Array.isArray(parsedResult.questions)) {
          throw new Error("Response doesn't contain questions array");
        }
        
        // Validate the structure of each question
        parsedResult.questions.forEach((q, i) => {
          if (!q.question || !q.options || !Array.isArray(q.options) || 
              q.correctAnswer === undefined || !q.explanation) {
            throw new Error(`Question at index ${i} has invalid structure`);
          }
          
          // Ensure exactly 4 options
          if (q.options.length !== 4) {
            throw new Error(`Question at index ${i} has ${q.options.length} options instead of 4`);
          }
          
          // Verify correctAnswer is valid (0-3)
          if (q.correctAnswer < 0 || q.correctAnswer > 3 || !Number.isInteger(q.correctAnswer)) {
            throw new Error(`Question at index ${i} has invalid correctAnswer: ${q.correctAnswer}`);
          }
        });
        
        // Success! Return the validated questions
        return parsedResult.questions;
      } catch (parseError) {
        console.error(`JSON parsing error: ${parseError.message}`);
        
        if (attempt < CONFIG.MAX_RETRIES - 1) {
          console.log("Trying alternative extraction or waiting before retry...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw parseError;
      }
    } catch (error) {
      // Check if the error is due to rate limiting or quota issues
      const isRateLimitError = 
        error.message?.includes('429') || 
        error.message?.includes('rate limit') || 
        error.message?.includes('quota') || 
        error.message?.includes('Resource exhausted');
      
      if (isRateLimitError) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`  Rate limit hit. Waiting ${waitTime/1000} seconds before retrying...`);
        
        // If we're on the last attempt, handle differently to avoid silent failure
        if (attempt === CONFIG.MAX_RETRIES - 1) {
          console.log('  Maximum retries reached. Using fallback questions.');
          return generateFallbackQuestions(frameworkName, level, questionCount);
        }
        
        // Wait for the calculated time before retrying
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // If it's the last attempt, use fallback questions
      if (attempt === CONFIG.MAX_RETRIES - 1) {
        console.log('  Maximum retries reached. Using fallback questions.');
        return generateFallbackQuestions(frameworkName, level, questionCount);
      }
      
      // For other errors, wait before retrying
      console.error(`Error generating questions (attempt ${attempt + 1}):`, error.message);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // This should only happen if all retries fail
  throw new Error(`Failed to generate questions after ${CONFIG.MAX_RETRIES} attempts`);
}

/**
 * Generate fallback questions when API calls fail
 */
function generateFallbackQuestions(frameworkName, level, count) {
  console.log(`Generating fallback questions for ${frameworkName} (${level})`);
  
  // Create a set of deterministic but framework-specific questions
  const fallbackQuestions = [];
  
  for (let i = 0; i < count; i++) {
    fallbackQuestions.push({
      question: `Question ${i+1} about ${frameworkName} (${level} level): What is a key principle of ${frameworkName}?`,
      options: [
        `${frameworkName} principle ${i*4+1}`,
        `${frameworkName} principle ${i*4+2}`,
        `${frameworkName} principle ${i*4+3}`,
        `${frameworkName} principle ${i*4+4}`
      ],
      correctAnswer: i % 4, // Varies the correct answer
      explanation: `This is an automatically generated fallback question because we reached API rate limits. The correct answer demonstrates a key principle of ${frameworkName}.`
    });
  }
  
  return fallbackQuestions;
}

/**
 * Update quiz questions for a specific quiz in the database
 */
async function updateQuizQuestions(quizId, questions) {
  try {
    await db.update(schema.quizzes)
      .set({ 
        questions: JSON.stringify(questions)
      })
      .where(eq(schema.quizzes.id, quizId))
      .execute();
    
    console.log(`Updated quiz ID ${quizId} with ${questions.length} new questions`);
    return true;
  } catch (error) {
    console.error(`Error updating quiz ID ${quizId}:`, error);
    throw error;
  }
}

/**
 * Save the current progress to a checkpoint file
 */
function saveCheckpoint(frameworkId, level) {
  try {
    const checkpoint = { 
      timestamp: new Date().toISOString(),
      frameworkId,
      level
    };
    
    fs.writeFileSync(CONFIG.CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
    console.log(`Checkpoint saved: Framework ID ${frameworkId}, Level: ${level || 'beginning'}`);
  } catch (error) {
    console.error('Failed to save checkpoint:', error);
  }
}

/**
 * Load the saved checkpoint if it exists
 */
function loadCheckpoint() {
  try {
    if (fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
      const data = fs.readFileSync(CONFIG.CHECKPOINT_FILE, 'utf8');
      const checkpoint = JSON.parse(data);
      console.log(`Loaded checkpoint: Framework ID ${checkpoint.frameworkId}, Level: ${checkpoint.level || 'beginning'}`);
      return checkpoint;
    }
  } catch (error) {
    console.error('Failed to load checkpoint:', error);
  }
  
  return null;
}

/**
 * Process a single framework's quizzes
 */
async function processFramework(framework, startLevel = null) {
  console.log(`\nProcessing framework: ${framework.name} (ID: ${framework.id})`);
  
  // Get all modules for this framework to use as content source
  const frameworkModules = await db.select()
    .from(schema.modules)
    .where(eq(schema.modules.frameworkId, framework.id))
    .execute();
  
  if (frameworkModules.length === 0) {
    console.log(`No modules found for framework ${framework.name}. Skipping.`);
    return { success: true, frameworkId: framework.id };
  }
  
  // Combine module content as source material for questions
  let moduleContents = frameworkModules.map(m => {
    let content = `Module: ${m.name}\n${m.description || ''}\n`;
    
    // Extract actual content from HTML if present
    if (m.content) {
      // Simple HTML tag stripping for content
      content += m.content.replace(/<[^>]*>/g, ' ') + '\n';
    }
    
    if (m.keyTakeaways) {
      content += `Key Takeaways: ${m.keyTakeaways}\n`;
    }
    
    return content;
  }).join('\n');
  
  // Trim content if it's too long
  if (moduleContents.length > 8000) {
    moduleContents = moduleContents.substring(0, 8000) + '...';
  }
  
  // Get all quizzes for this framework
  const frameworkQuizzes = await db.select()
    .from(schema.quizzes)
    .where(eq(schema.quizzes.frameworkId, framework.id))
    .execute();
  
  if (frameworkQuizzes.length === 0) {
    console.log(`No quizzes found for framework ${framework.name}. Skipping.`);
    return { success: true, frameworkId: framework.id };
  }
  
  // Group quizzes by level
  const levelQuizzes = {
    beginner: frameworkQuizzes.filter(q => q.level === 'beginner'),
    intermediate: frameworkQuizzes.filter(q => q.level === 'intermediate'),
    advanced: frameworkQuizzes.filter(q => q.level === 'advanced')
  };
  
  // Determine which levels to process based on startLevel
  const levels = ['beginner', 'intermediate', 'advanced'];
  const startIndex = startLevel ? levels.indexOf(startLevel) : 0;
  
  if (startIndex > 0) {
    console.log(`  Resuming from ${startLevel} level`);
  }
  
  // Process each level
  for (let i = startIndex; i < levels.length; i++) {
    const level = levels[i];
    
    if (levelQuizzes[level].length > 0) {
      try {
        // Generate new questions for this level
        const newQuestions = await generateQuizQuestions(
          framework.id, 
          framework.name, 
          level, 
          moduleContents
        );
        
        // Check if we got valid questions
        if (!newQuestions || newQuestions.length === 0) {
          console.error(`No valid questions generated for ${framework.name} ${level} level`);
          saveCheckpoint(framework.id, levels[i+1]);
          return { 
            success: false, 
            frameworkId: framework.id, 
            level: levels[i+1]
          };
        }
        
        // Number the questions sequentially
        const numberedQuestions = newQuestions.map((q, index) => ({
          ...q,
          id: index + 1
        }));
        
        // Update each quiz for this level
        for (const quiz of levelQuizzes[level]) {
          await updateQuizQuestions(quiz.id, numberedQuestions);
        }
        
        console.log(`✓ Updated ${levelQuizzes[level].length} ${level} quizzes for ${framework.name}`);
        
        // Save checkpoint
        if (i < levels.length - 1) {
          saveCheckpoint(framework.id, levels[i+1]);
        } else {
          saveCheckpoint(framework.id + 1, null);
        }
        
        // Add a delay between levels to avoid rate limiting
        if (i < levels.length - 1) {
          console.log(`  Waiting ${CONFIG.DELAY_BETWEEN_LEVELS/1000} seconds before processing next level...`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_LEVELS));
        }
      } catch (error) {
        console.error(`Error processing ${level} level for ${framework.name}:`, error);
        // Save checkpoint and return information about where we failed
        saveCheckpoint(framework.id, levels[i+1]);
        return { 
          success: false, 
          frameworkId: framework.id, 
          level: levels[i+1] 
        };
      }
    } else {
      console.log(`  No ${level} quizzes found for ${framework.name}, skipping this level`);
    }
  }
  
  return { success: true, frameworkId: framework.id };
}

/**
 * Main function to regenerate all quiz questions
 */
async function regenerateAllQuizQuestions() {
  console.log('\n=== Quiz Question Generator ===');
  console.log('Generating unique quiz questions for all frameworks\n');
  
  try {
    // Get all frameworks
    const allFrameworks = await db.select().from(schema.frameworks).execute();
    console.log(`Found ${allFrameworks.length} frameworks to process`);
    
    // Check for checkpoint to resume
    const checkpoint = loadCheckpoint();
    
    // Process one framework at a time with error handling and resumability
    let currentFrameworkIndex = 0;
    let currentLevel = null;
    
    // If checkpoint exists, find the framework to resume from
    if (checkpoint) {
      const resumeFrameworkIndex = allFrameworks.findIndex(f => f.id === checkpoint.frameworkId);
      if (resumeFrameworkIndex >= 0) {
        currentFrameworkIndex = resumeFrameworkIndex;
        currentLevel = checkpoint.level;
        console.log(`Resuming from framework ${allFrameworks[currentFrameworkIndex].name} (ID: ${checkpoint.frameworkId}), level: ${currentLevel || 'beginning'}`);
      }
    }
    
    // Track progress
    let completedFrameworks = 0;
    const startTime = Date.now();
    
    while (currentFrameworkIndex < allFrameworks.length) {
      const framework = allFrameworks[currentFrameworkIndex];
      const frameworkStartTime = Date.now();
      
      try {
        // Process this framework (potentially resuming from a specific level)
        const result = await processFramework(framework, currentLevel);
        
        if (result.success) {
          // Framework processed successfully, move to the next one
          currentFrameworkIndex++;
          currentLevel = null;
          completedFrameworks++;
          
          const frameworkElapsedTime = Math.round((Date.now() - frameworkStartTime) / 1000);
          console.log(`\n✓ Completed framework ${framework.name} in ${frameworkElapsedTime} seconds`);
          console.log(`Progress: ${completedFrameworks}/${allFrameworks.length} frameworks (${Math.round(completedFrameworks/allFrameworks.length*100)}%)`);
          
          // Add a delay between frameworks to avoid rate limiting
          if (currentFrameworkIndex < allFrameworks.length) {
            console.log(`\nWaiting ${CONFIG.DELAY_BETWEEN_FRAMEWORKS/1000} seconds before processing next framework...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_FRAMEWORKS));
          }
        } else {
          // Framework processing failed at a specific level
          // We'll retry the same framework but start from the next level
          currentLevel = result.level;
          console.log(`\nWill resume processing framework ${framework.name} at ${currentLevel} level`);
          
          // Wait before retrying
          console.log(`Waiting ${CONFIG.RETRY_DELAY/1000} seconds before retrying...`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        }
      } catch (error) {
        console.error(`Unexpected error processing framework ${framework.name}:`, error);
        
        // If there's an unexpected error, wait and try the same framework again from the beginning
        console.log(`\nWaiting ${CONFIG.ERROR_RETRY_DELAY/1000} seconds before retrying framework ${framework.name}...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.ERROR_RETRY_DELAY));
      }
    }
    
    // Clean up checkpoint file now that we're done
    if (fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
      fs.unlinkSync(CONFIG.CHECKPOINT_FILE);
    }
    
    const totalElapsedTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✅ All quiz questions have been regenerated successfully!`);
    console.log(`Time taken: ${Math.floor(totalElapsedTime / 60)} minutes, ${totalElapsedTime % 60} seconds`);
    
    // Close the database connection
    await client.end();
  } catch (error) {
    console.error('Error regenerating quiz questions:', error);
    // Close the database connection
    await client.end();
    process.exit(1);
  }
}

/**
 * Process a specific framework by ID
 */
async function processSpecificFramework(frameworkId) {
  try {
    console.log(`\n=== Processing Single Framework (ID: ${frameworkId}) ===`);
    
    // Get the framework
    const [framework] = await db.select()
      .from(schema.frameworks)
      .where(eq(schema.frameworks.id, frameworkId))
      .execute();
    
    if (!framework) {
      console.error(`Framework with ID ${frameworkId} not found`);
      process.exit(1);
    }
    
    // Process just this framework
    await processFramework(framework);
    
    console.log(`\n✅ Successfully updated questions for ${framework.name} (ID: ${frameworkId})`);
  } catch (error) {
    console.error('Error processing framework:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === '--framework' && args[1]) {
  // Process a specific framework ID
  const frameworkId = parseInt(args[1], 10);
  if (isNaN(frameworkId)) {
    console.error('Invalid framework ID. Please provide a valid number.');
    process.exit(1);
  }
  
  processSpecificFramework(frameworkId);
} else {
  // Process all frameworks
  regenerateAllQuizQuestions();
}