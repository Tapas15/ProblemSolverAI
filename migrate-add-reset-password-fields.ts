import { db, pool } from './server/db';
import { users } from './shared/schema';
import { sql } from 'drizzle-orm';

async function addResetPasswordFields() {
  try {
    console.log('Adding reset password fields to users table...');
    
    // Check if columns already exist
    const check = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('reset_password_token', 'reset_password_expires')
    `);
    
    const existingColumns = check.rows.map((row: any) => row.column_name);
    console.log('Existing columns:', existingColumns);
    
    // Add reset_password_token column if it doesn't exist
    if (!existingColumns.includes('reset_password_token')) {
      console.log('Adding reset_password_token column...');
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN reset_password_token TEXT
      `);
    }
    
    // Add reset_password_expires column if it doesn't exist
    if (!existingColumns.includes('reset_password_expires')) {
      console.log('Adding reset_password_expires column...');
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN reset_password_expires TIMESTAMP
      `);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

addResetPasswordFields();