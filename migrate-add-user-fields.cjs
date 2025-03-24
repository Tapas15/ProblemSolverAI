// Migration to add avatar_url, phone, and bio fields to users table
const { Pool } = require('pg');

async function addUserFields() {
  // Connect to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Adding new columns to users table...');
    
    // Check if the columns already exist
    const { rows } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('avatar_url', 'phone', 'bio');
    `);
    
    const existingColumns = rows.map(row => row.column_name);
    
    // Add avatar_url column if it doesn't exist
    if (!existingColumns.includes('avatar_url')) {
      await pool.query(`ALTER TABLE users ADD COLUMN avatar_url TEXT;`);
      console.log('Added avatar_url column to users table');
    } else {
      console.log('avatar_url column already exists');
    }
    
    // Add phone column if it doesn't exist
    if (!existingColumns.includes('phone')) {
      await pool.query(`ALTER TABLE users ADD COLUMN phone TEXT;`);
      console.log('Added phone column to users table');
    } else {
      console.log('phone column already exists');
    }
    
    // Add bio column if it doesn't exist
    if (!existingColumns.includes('bio')) {
      await pool.query(`ALTER TABLE users ADD COLUMN bio TEXT;`);
      console.log('Added bio column to users table');
    } else {
      console.log('bio column already exists');
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addUserFields();