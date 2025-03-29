// Script to update module images with beautiful gradient placeholders
// This removes reliance on external Unsplash URLs and problematic file paths

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function updateModuleImages() {
  // Create a PostgreSQL client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Get all modules and their associated frameworks
    const modulesResult = await client.query(`
      SELECT m.id, m.name, m.framework_id, f.name as framework_name
      FROM modules m
      JOIN frameworks f ON m.framework_id = f.id
      ORDER BY m.framework_id, m.order
    `);
    
    const modules = modulesResult.rows;
    console.log(`Found ${modules.length} modules to update`);
    
    // Update each module with an SVG gradient based on its framework_id
    for (const module of modules) {
      const gradient = generateModuleGradientSvg(
        module.framework_id,
        module.name,
        module.framework_name
      );
      
      await client.query(`
        UPDATE modules 
        SET image_url = $1 
        WHERE id = $2
      `, [gradient, module.id]);
      
      console.log(`Updated image for module: ${module.name} (Framework: ${module.framework_name})`);
    }

    console.log('All module images updated successfully!');
  } catch (error) {
    console.error('Error updating module images:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Get framework-specific colors
function getFrameworkColors(frameworkId) {
  const colors = [
    { light: '#667eea', dark: '#764ba2' }, // MECE - Framework 1
    { light: '#f093fb', dark: '#f5576c' }, // Design Thinking - Framework 2 
    { light: '#84fab0', dark: '#8fd3f4' }, // SWOT - Framework 3
    { light: '#6a11cb', dark: '#2575fc' }, // Porter's Five Forces - Framework 4
    { light: '#a1c4fd', dark: '#c2e9fb' }, // First Principles - Framework 5
    { light: '#d4fc79', dark: '#96e6a1' }, // Jobs-To-Be-Done - Framework 6
    { light: '#a1c4fd', dark: '#c2e9fb' }, // Blue Ocean Strategy - Framework 7
    { light: '#ffcb8c', dark: '#ff8b8d' }, // SCAMPER - Framework 8
    { light: '#84fab0', dark: '#8fd3f4' }, // Problem-Tree Analysis - Framework 9
    { light: '#ff9a9e', dark: '#fad0c4' }, // Pareto Principle - Framework 10
  ];
  
  // Get the colors based on frameworkId, defaulting to first set if out of range
  const index = (frameworkId && frameworkId > 0 && frameworkId <= colors.length) 
    ? frameworkId - 1 
    : 0;
    
  return colors[index];
}

// Generates a beautiful module-specific SVG gradient
function generateModuleGradientSvg(frameworkId, moduleName, frameworkName) {
  const colors = getFrameworkColors(frameworkId);
  
  // Create an SVG with gradient background, text, and decorative elements
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.light.replace('#', '%23')}" />
        <stop offset="100%" stop-color="${colors.dark.replace('#', '%23')}" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.3" />
      </filter>
    </defs>
    <rect width="500" height="300" fill="url(%23grad)" />
    <g>
      <circle cx="400" cy="50" r="25" fill="white" fill-opacity="0.15" />
      <circle cx="100" cy="250" r="30" fill="white" fill-opacity="0.15" />
      <circle cx="50" cy="50" r="15" fill="white" fill-opacity="0.15" />
      <circle cx="450" cy="250" r="20" fill="white" fill-opacity="0.15" />
      <circle cx="250" cy="150" r="40" fill="white" fill-opacity="0.1" />
    </g>
    <text x="250" y="130" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white" filter="url(%23shadow)">${moduleName}</text>
    <text x="250" y="170" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white" filter="url(%23shadow)">${frameworkName}</text>
  </svg>`;
}

// Execute the function
updateModuleImages().catch(console.error);