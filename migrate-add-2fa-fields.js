// Migration script to add 2FA fields to users table
import { pool } from './server/db.js';

async function addTwoFactorFields() {
  try {
    // Connect to the database
    await pool.connect();
    
    console.log('Connected to database, adding 2FA fields to users table...');
    
    // Check if columns already exist to avoid errors
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('two_factor_enabled', 'two_factor_secret', 'two_factor_backup_codes');
    `);
    
    const existingColumns = checkResult.rows.map(row => row.column_name);
    
    // Add columns that don't already exist
    if (!existingColumns.includes('two_factor_enabled')) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
      `);
      console.log('Added two_factor_enabled column');
    }
    
    if (!existingColumns.includes('two_factor_secret')) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN two_factor_secret TEXT;
      `);
      console.log('Added two_factor_secret column');
    }
    
    if (!existingColumns.includes('two_factor_backup_codes')) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN two_factor_backup_codes TEXT;
      `);
      console.log('Added two_factor_backup_codes column');
    }
    
    console.log('2FA fields migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the migration
addTwoFactorFields();