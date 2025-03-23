import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Running migration: Adding userPreferences column to users table');
    
    // Check if column exists first to make this script idempotent
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='users' AND column_name='user_preferences'
    `);
    
    if (result.rows.length === 0) {
      console.log('Column does not exist. Adding it now...');
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_preferences TEXT`);
      console.log('Successfully added userPreferences column');
    } else {
      console.log('Column already exists. Migration not needed.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

main();