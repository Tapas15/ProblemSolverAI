// Run with: node migrate-add-business-fields.cjs

const pg = require('pg');
const { Pool } = pg;

async function addBusinessFields() {
  // Create a database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log("Adding business information fields to users table...");
    
    // Check if columns already exist
    const checkCompany = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'company'
    `);
    
    if (checkCompany.rows.length === 0) {
      // Add the company column
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN company TEXT
      `);
      console.log("- Added company column");
    } else {
      console.log("- Company column already exists");
    }
    
    const checkLocation = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'location'
    `);
    
    if (checkLocation.rows.length === 0) {
      // Add the location column
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN location TEXT
      `);
      console.log("- Added location column");
    } else {
      console.log("- Location column already exists");
    }
    
    const checkWebsite = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'website'
    `);
    
    if (checkWebsite.rows.length === 0) {
      // Add the website column
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN website TEXT
      `);
      console.log("- Added website column");
    } else {
      console.log("- Website column already exists");
    }
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

addBusinessFields();