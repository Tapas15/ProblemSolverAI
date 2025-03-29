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
  
  const questionCount = 5; // Just generate 5 questions for the test
  
  const prompt = `
As an expert in business frameworks, create ${questionCount} unique multiple-choice questions for a ${level} level quiz about the ${frameworkName} framework.

Use the following module content as source material for the questions:
${moduleContents}

Each question should follow this structure:
1. A clear question statement
2. Four options (labeled a, b, c, d)
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
- Each question should be unique
- Questions should be challenging but fair for the indicated level
- Ensure high-quality, professional language
- Make sure questions are clear, unambiguous, and have only one correct answer
`;

  try {
    console.log("Getting Gemini model...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log("Generating content...");
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      }
    });
    
    const response = result.response;
    const textResult = response.text();
    
    console.log("Raw response:");
    console.log(textResult);
    
    // Extract JSON from the response
    // Gemini might wrap the JSON in markdown code blocks or add additional text
    const jsonMatch = textResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No valid JSON found in the response");
      return null;
    }
    
    console.log("Parsing JSON...");
    const parsedResult = JSON.parse(jsonMatch[0]);
    return parsedResult.questions;
  } catch (error) {
    console.error("Error generating questions:", error);
    return null;
  }
}

/**
 * Test Gemini question generation
 */
async function testGeminiQuestions() {
  try {
    // Get the SWOT framework (or any framework with ID 1)
    const [framework] = await db.select()
      .from(frameworks)
      .where(eq(frameworks.id, 1)) // Using a specific framework ID for testing
      .execute();
    
    if (!framework) {
      console.error("Framework not found");
      return;
    }
    
    console.log(`Testing with framework: ${framework.name} (ID: ${framework.id})`);
    
    // Get modules for this framework to use as content source
    const frameworkModules = await db.select()
      .from(modules)
      .where(eq(modules.frameworkId, framework.id))
      .execute();
    
    // Combine module content as source material for questions
    let moduleContents = frameworkModules.map(m => 
      `Module: ${m.name}\n${m.description}\n${m.content || ''}\n${m.keyTakeaways || ''}\n`
    ).join('\n');
    
    // Trim content if it's too long
    if (moduleContents.length > 4000) {
      moduleContents = moduleContents.substring(0, 4000) + '...';
    }
    
    // Test generating beginner level questions
    const questions = await generateQuizQuestions(
      framework.id, 
      framework.name, 
      'beginner', 
      moduleContents
    );
    
    if (questions && questions.length > 0) {
      console.log("\nSuccessfully generated questions:");
      questions.forEach((q, i) => {
        console.log(`\nQuestion ${i+1}: ${q.question}`);
        q.options.forEach((opt, j) => {
          console.log(`  ${j === q.correctAnswer ? '✓' : ' '} ${opt}`);
        });
        console.log(`Explanation: ${q.explanation}`);
      });
      console.log(`\nTotal questions: ${questions.length}`);
    } else {
      console.log("Failed to generate questions");
    }
  } catch (error) {
    console.error("Error testing Gemini questions:", error);
  }
}

// Run the test
testGeminiQuestions();