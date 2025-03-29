# Quiz Question Generator Guide

This guide explains how to use the improved quiz question generator scripts to create unique, high-quality quiz questions for all frameworks in the application.

## Overview

The quiz generator uses Google's Gemini AI to create unique multiple-choice questions for all frameworks at each difficulty level (beginner, intermediate, advanced). The scripts automatically:

1. Extract content from all modules within each framework
2. Generate appropriate questions for each difficulty level
3. Update all quizzes in the database with the new questions
4. Handle errors and API rate limits with automatic retries
5. Save progress using checkpoints for resumability

## Requirements

- Node.js environment
- Valid Google Gemini API key set as an environment variable (`GEMINI_API_KEY`)
- Database connection string set as an environment variable (`DATABASE_URL`)

## Available Scripts

Two script versions are provided:

1. **ESM Version**: `improved-quiz-generator.js`
   - Uses ES modules for importing dependencies
   - Works with the existing application's database connection

2. **CommonJS Version**: `improved-quiz-generator.cjs`
   - Uses CommonJS require statements
   - Establishes its own database connection
   - Recommended for standalone use

## Usage

### Regenerate Questions for All Frameworks

To regenerate quiz questions for all frameworks at all difficulty levels:

```bash
# ESM Version
node improved-quiz-generator.js

# CommonJS Version
node improved-quiz-generator.cjs
```

This will:
- Process each framework sequentially
- Generate questions for each difficulty level
- Update all quizzes in the database
- Show progress and completion status

### Process a Single Framework

To regenerate questions for just one framework:

```bash
# ESM Version
node improved-quiz-generator.js --framework [FRAMEWORK_ID]

# CommonJS Version
node improved-quiz-generator.cjs --framework [FRAMEWORK_ID]
```

Replace `[FRAMEWORK_ID]` with the database ID of the framework you want to update.

## Features

### Checkpoint System

The script automatically saves checkpoints after processing each difficulty level. If the script is interrupted, you can run it again, and it will resume from where it left off.

### Error Handling

The script includes robust error handling:
- Automatic retries for API failures with exponential backoff
- JSON validation to ensure question format is correct
- Fallback question generation if all retries fail

### Performance Tuning

You can adjust the script configuration in the `CONFIG` object:
- Change the number of questions per difficulty level
- Adjust delays between API calls
- Modify retry behavior
- Change AI temperature for creativity vs. consistency

## Monitoring Progress

The script provides detailed console output:
- Current framework and difficulty level being processed
- Progress percentage
- Time taken for each framework
- Total time for completion

## Troubleshooting

If you encounter issues:

1. **API Key Problems**: Ensure your Gemini API key is valid and has sufficient quota
2. **Database Connection**: Verify your database connection string
3. **Interrupted Process**: The script will resume from the last checkpoint
4. **Format Errors**: Check the console output for parsing issues

## Examples

### Generate questions for all frameworks:
```bash
node improved-quiz-generator.cjs
```

### Generate questions for MECE Framework (ID: 1):
```bash
node improved-quiz-generator.cjs --framework 1
```

### Generate questions for Design Thinking (ID: 2):
```bash
node improved-quiz-generator.cjs --framework 2
```