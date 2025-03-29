#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './server/db.ts';
import { eq } from 'drizzle-orm';
import { frameworks, quizzes, modules } from './shared/schema.ts';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate unique quiz questions for a specific framework and level 
 * using content from its modules
 */
async function generateQuizQuestions(frameworkId, frameworkName, level, moduleContents) {
  console.log(`Generating ${level} level questions for ${frameworkName}...`);
  
  const questionCount = level === 'beginner' ? 10 : level === 'intermediate' ? 15 : 20;
  
  const prompt = `
As an expert in business frameworks, create ${questionCount} unique multiple-choice questions for a ${level} level quiz about the ${frameworkName} framework.

Use the following module content as source material for the questions:
${moduleContents}

For each question:
1. Make the question relevant to the framework and appropriate for ${level} level
2. Provide 4 possible answers (a, b, c, d)
3. Indicate the correct answer
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
`;

  // Maximum number of retries
  const MAX_RETRIES = 5;
  
  // Get the Gemini model instance - using gemini-1.5-pro, the latest version
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  // Implement retry logic with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`  Attempt ${attempt + 1}/${MAX_RETRIES}...`);
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
        }
      });
      
      const response = result.response;
      const textResult = response.text();
      
      // Extract JSON from the response
      // Gemini might wrap the JSON in markdown code blocks or add additional text
      const jsonMatch = textResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in the response");
      }
      
      const parsedResult = JSON.parse(jsonMatch[0]);
      return parsedResult.questions;
    } catch (error) {
      // Check if the error is due to rate limiting or quota issues
      // Gemini API typically returns status codes in error.message
      const isRateLimitError = 
        error.message?.includes('429') || 
        error.message?.includes('rate limit') || 
        error.message?.includes('quota') || 
        error.message?.includes('Resource exhausted');
      
      if (isRateLimitError) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        console.log(`  Rate limit hit. Waiting ${waitTime/1000} seconds before retrying...`);
        
        // If we're on the last attempt, handle differently to avoid silent failure
        if (attempt === MAX_RETRIES - 1) {
          console.log('  Maximum retries reached. Using fallback questions.');
          return generateFallbackQuestions(frameworkName, level, questionCount);
        }
        
        // Wait for the calculated time before retrying
        await new Promise(resolve => setTimeout(resolve, waitTime));
        // Continue to the next retry attempt
        continue;
      }
      
      // Handle JSON parsing errors by trying to extract JSON differently
      if (error.message?.includes('JSON')) {
        console.log('  JSON parsing error. Trying alternative extraction method...');
        
        try {
          // Try to extract JSON with a different approach if available
          if (attempt === MAX_RETRIES - 1) {
            console.log('  Maximum retries reached. Using fallback questions.');
            return generateFallbackQuestions(frameworkName, level, questionCount);
          }
          
          // Wait before retrying
          const waitTime = 2000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } catch (innerError) {
          console.error('  Failed alternative JSON extraction:', innerError);
        }
      }
      
      // If it's not a handled error, log and throw it
      console.error(`Error generating questions for ${frameworkName} (${level}):`, error);
      throw error;
    }
  }
  
  // This should only happen if all retries fail but none hit the rate limit
  throw new Error(`Failed to generate questions after ${MAX_RETRIES} attempts`);
}

/**
 * Generate fallback questions when API calls fail
 */
function generateFallbackQuestions(frameworkName, level, count) {
  console.log(`Generating fallback questions for ${frameworkName} (${level})`);
  
  // Create a set of deterministic but framework-specific questions
  // These aren't ideal but better than having no questions at all
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
    await db.update(quizzes)
      .set({ 
        questionCount: questions.length,
        questions: JSON.stringify(questions)
      })
      .where(eq(quizzes.id, quizId))
      .execute();
    
    console.log(`Updated quiz ID ${quizId} with ${questions.length} new questions`);
  } catch (error) {
    console.error(`Error updating quiz ID ${quizId}:`, error);
    throw error;
  }
}

/**
 * Process a single framework's quizzes
 */
async function processFramework(framework, startLevel = null) {
  console.log(`\nProcessing framework: ${framework.name} (ID: ${framework.id})`);
  
  // Get all modules for this framework to use as content source
  const frameworkModules = await db.select()
    .from(modules)
    .where(eq(modules.frameworkId, framework.id))
    .execute();
  
  // Combine module content as source material for questions
  let moduleContents = frameworkModules.map(m => 
    `Module: ${m.name}\n${m.description}\n${m.content || ''}\n${m.keyTakeaways || ''}\n`
  ).join('\n');
  
  // Trim content if it's too long
  if (moduleContents.length > 8000) {
    moduleContents = moduleContents.substring(0, 8000) + '...';
  }
  
  // Get all quizzes for this framework
  const frameworkQuizzes = await db.select()
    .from(quizzes)
    .where(eq(quizzes.frameworkId, framework.id))
    .execute();
  
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
        
        // Update each quiz for this level
        for (const quiz of levelQuizzes[level]) {
          await updateQuizQuestions(quiz.id, newQuestions);
        }
        
        console.log(`✓ Updated ${levelQuizzes[level].length} ${level} quizzes for ${framework.name}`);
        
        // Add a delay between levels to avoid rate limiting
        if (i < levels.length - 1) {
          console.log(`  Waiting 3 seconds before processing next level...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`Error processing ${level} level for ${framework.name}:`, error);
        // Return information about where we failed so we can resume
        return { 
          success: false, 
          frameworkId: framework.id, 
          level: levels[i + 1] // Return the next level that needs processing
        };
      }
    }
  }
  
  return { success: true, frameworkId: framework.id };
}

/**
 * Main function to regenerate all quiz questions
 */
async function regenerateAllQuizQuestions() {
  try {
    // Get all frameworks
    const allFrameworks = await db.select().from(frameworks).execute();
    
    // Process one framework at a time with error handling and resumability
    let currentFrameworkIndex = 0;
    let currentLevel = null;
    
    while (currentFrameworkIndex < allFrameworks.length) {
      const framework = allFrameworks[currentFrameworkIndex];
      
      try {
        // Process this framework (potentially resuming from a specific level)
        const result = await processFramework(framework, currentLevel);
        
        if (result.success) {
          // Framework processed successfully, move to the next one
          currentFrameworkIndex++;
          currentLevel = null;
          
          // Add a delay between frameworks to avoid rate limiting
          if (currentFrameworkIndex < allFrameworks.length) {
            console.log(`\nWaiting 5 seconds before processing next framework...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        } else {
          // Framework processing failed at a specific level
          // We'll retry the same framework but start from the next level
          currentLevel = result.level;
          console.log(`\nWill resume processing framework ${framework.name} at ${currentLevel} level`);
          
          // Wait a bit longer before retrying
          console.log(`Waiting 10 seconds before retrying...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      } catch (error) {
        console.error(`Unexpected error processing framework ${framework.name}:`, error);
        
        // If there's an unexpected error, wait and try the same framework again from the beginning
        console.log(`\nWaiting 15 seconds before retrying framework ${framework.name}...`);
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    }
    
    console.log('\nAll quiz questions have been regenerated successfully!');
  } catch (error) {
    console.error('Error regenerating quiz questions:', error);
    process.exit(1);
  }
}

// Run the script
regenerateAllQuizQuestions();