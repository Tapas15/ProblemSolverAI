// Run with: node migrate-add-business-fields.js

import { db } from "./server/db.js";
import { sql } from "drizzle-orm/sql";

// Fix path issue by modifying import
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { pool } = require("./server/db.ts");
const { drizzle } = require("drizzle-orm/postgres-js");
const dbClient = drizzle(pool);

async function addBusinessFields() {
  try {
    console.log("Adding business information fields to users table...");
    
    // Check if columns already exist
    const checkCompany = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'company'
    `);
    
    if (checkCompany.rows.length === 0) {
      // Add the company column
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN company TEXT
      `);
      console.log("- Added company column");
    } else {
      console.log("- Company column already exists");
    }
    
    const checkLocation = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'location'
    `);
    
    if (checkLocation.rows.length === 0) {
      // Add the location column
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN location TEXT
      `);
      console.log("- Added location column");
    } else {
      console.log("- Location column already exists");
    }
    
    const checkWebsite = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'website'
    `);
    
    if (checkWebsite.rows.length === 0) {
      // Add the website column
      await db.execute(sql`
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
    await db.end();
  }
}

addBusinessFields();