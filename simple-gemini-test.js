#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Function to test the Gemini model by generating quiz questions
 */
async function testGemini() {
  try {
    console.log("Testing Gemini API integration...");
    
    // Framework details for the prompt
    const frameworkName = "SWOT Analysis";
    const level = "beginner";
    const questionCount = 5;
    
    // Sample module content for the prompt
    const moduleContents = `
Module: Introduction to SWOT Analysis
SWOT Analysis is a strategic planning tool that helps businesses identify their internal Strengths and Weaknesses, as well as external Opportunities and Threats. It's one of the most widely used frameworks for strategic planning and competitive analysis.

Module: Core Components
Strengths: These are internal attributes and resources that support a successful outcome. Examples include strong brand recognition, loyal customer base, or proprietary technology.
Weaknesses: These are internal attributes and resources that hinder a successful outcome. Examples include high employee turnover, poor product quality, or limited financial resources.
Opportunities: These are external factors that the entity can capitalize on or use to its advantage. Examples include market growth, new consumer trends, or competitor weaknesses.
Threats: These are external factors that could jeopardize the entity's success. Examples include new competitors, changing regulations, or supply chain issues.

Module: Applications
SWOT Analysis can be applied at various levels: from analyzing an entire organization to evaluating specific projects, products, or even individual career decisions. It's commonly used in strategic planning, marketing plans, business development, and personal development.

Module: Best Practices
1. Be specific and realistic in your assessment
2. Use data and research to back up your points
3. Prioritize the most important factors in each category
4. Update your SWOT regularly as conditions change
5. Include diverse perspectives in the analysis process
`;
    
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

    console.log("Getting Gemini model...");
    
    // First, list available models to see what's available
    console.log("Available models:");
    try {
      const models = await genAI.listModels();
      console.log(models);
    } catch (error) {
      console.error("Error listing models:", error);
    }
    
    // Try with gemini-1.5-pro or gemini-1.0-pro
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
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
    
    console.log("\nRaw response:");
    console.log(textResult);
    
    // Extract JSON from the response
    // Gemini might wrap the JSON in markdown code blocks or add additional text
    const jsonMatch = textResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("\nNo valid JSON found in the response");
      return;
    }
    
    console.log("\nParsing JSON...");
    const parsedResult = JSON.parse(jsonMatch[0]);
    const questions = parsedResult.questions;
    
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
    console.error("Error:", error);
  }
}

// Run the test
testGemini();