// This script adds username recovery fields to the users table
import { drizzle } from "drizzle-orm/neon-serverless";
import pkg from "pg";
const { Pool } = pkg;
import { sql } from "drizzle-orm";

async function addUsernameRecoveryFields() {
  console.log("Starting migration to add username recovery fields to users table...");
  
  try {
    // Create a connection pool to the database
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL
    });
    
    const db = drizzle(pool);
    
    // Check if username_recovery_token column exists
    const checkResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'username_recovery_token'
    `);
    
    if (checkResult.length > 0) {
      console.log("Username recovery fields already exist. Skipping migration.");
      await pool.end();
      return;
    }
    
    // Add username_recovery_token and username_recovery_expires columns
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS username_recovery_token TEXT,
      ADD COLUMN IF NOT EXISTS username_recovery_expires TIMESTAMP
    `);
    
    console.log("Migration completed successfully.");
    await pool.end();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Execute the migration
addUsernameRecoveryFields();