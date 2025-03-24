import { db } from './server/db';
import { exercises, exerciseSubmissions } from './shared/schema';
import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

async function addExercisesTables() {
  console.log('Adding exercises tables to database...');

  try {
    // Check if tables already exist by trying to select from them
    try {
      await db.select().from(exercises).limit(1);
      console.log('Exercises table already exists.');
      
      try {
        await db.select().from(exerciseSubmissions).limit(1);
        console.log('Exercise submissions table already exists.');
        return;
      } catch (e) {
        console.log('Exercise submissions table does not exist yet, creating...');
      }
    } catch (e) {
      console.log('Exercises table does not exist yet, creating...');
    }

    // Create exercises table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        framework_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        scenario TEXT NOT NULL,
        steps TEXT NOT NULL,
        sample_solution TEXT,
        difficulty TEXT NOT NULL,
        estimated_time INTEGER NOT NULL,
        resources TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Exercises table created successfully');

    // Create exercise submissions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercise_submissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        solution TEXT NOT NULL,
        status TEXT NOT NULL,
        score INTEGER,
        feedback TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Exercise submissions table created successfully');

  } catch (error) {
    console.error('Error creating exercises tables:', error);
    throw error;
  }
}

// Run the migration
addExercisesTables()
  .then(() => {
    console.log('Exercise tables migration complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create exercise tables:', error);
    process.exit(1);
  });