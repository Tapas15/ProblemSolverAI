// Script to update framework images with beautiful gradient placeholders
// This removes reliance on external Unsplash URLs and server/public/images/frameworks directory

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function updateFrameworkImages() {
  // Create a PostgreSQL client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Generate beautiful SVG gradient backgrounds for each framework
    const frameworkGradients = [
      // MECE Framework - Blue-purple gradient
      { id: 1, name: 'MECE Framework', gradient: generateGradientSvg('#667eea', '#764ba2', 'MECE') },
      // Design Thinking - Pink-orange gradient
      { id: 2, name: 'Design Thinking', gradient: generateGradientSvg('#f093fb', '#f5576c', 'Design Thinking') },
      // SWOT Analysis - Teal-blue gradient
      { id: 3, name: 'SWOT Analysis', gradient: generateGradientSvg('#84fab0', '#8fd3f4', 'SWOT') },
      // First Principles - Lavender-purple gradient
      { id: 4, name: 'First Principles', gradient: generateGradientSvg('#a1c4fd', '#c2e9fb', 'First Principles') },
      // Porter's Five Forces - Deep blue-purple gradient
      { id: 5, name: 'Porter\'s Five Forces', gradient: generateGradientSvg('#6a11cb', '#2575fc', 'Porter\'s Five Forces') },
      // Jobs-To-Be-Done - Green gradient
      { id: 6, name: 'Jobs-To-Be-Done', gradient: generateGradientSvg('#d4fc79', '#96e6a1', 'Jobs-To-Be-Done') },
      // Blue Ocean Strategy - Soft blue gradient
      { id: 7, name: 'Blue Ocean Strategy', gradient: generateGradientSvg('#a1c4fd', '#c2e9fb', 'Blue Ocean') },
      // SCAMPER - Orange-pink gradient
      { id: 8, name: 'SCAMPER', gradient: generateGradientSvg('#ffcb8c', '#ff8b8d', 'SCAMPER') },
      // Problem-Tree Analysis - Green-blue gradient
      { id: 9, name: 'Problem-Tree Analysis', gradient: generateGradientSvg('#84fab0', '#8fd3f4', 'Problem-Tree') },
      // Pareto Principle - Orange gradient
      { id: 10, name: 'Pareto Principle', gradient: generateGradientSvg('#ff9a9e', '#fad0c4', 'Pareto') },
    ];

    // Update frameworks with SVG data URLs
    for (const framework of frameworkGradients) {
      await client.query(`
        UPDATE frameworks 
        SET image_url = $1 
        WHERE id = $2
      `, [framework.gradient, framework.id]);
      console.log(`Updated image for framework: ${framework.name}`);
    }

    console.log('All framework images updated successfully!');
  } catch (error) {
    console.error('Error updating framework images:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Generates a beautiful SVG gradient with a framework name
function generateGradientSvg(color1, color2, name) {
  // Create an SVG with a gradient background and text
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1.replace('#', '%23')}" />
        <stop offset="100%" stop-color="${color2.replace('#', '%23')}" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.3" />
      </filter>
    </defs>
    <rect width="500" height="300" fill="url(%23grad)" />
    <g>
      <circle cx="400" cy="50" r="30" fill="white" fill-opacity="0.2" />
      <circle cx="100" cy="250" r="40" fill="white" fill-opacity="0.2" />
      <circle cx="50" cy="50" r="20" fill="white" fill-opacity="0.2" />
      <circle cx="450" cy="250" r="25" fill="white" fill-opacity="0.2" />
      <circle cx="250" cy="150" r="60" fill="white" fill-opacity="0.1" />
    </g>
    <text x="250" y="150" font-family="Arial, sans-serif" font-size="30" font-weight="bold" text-anchor="middle" fill="white" filter="url(%23shadow)">${name}</text>
    <text x="250" y="190" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white" filter="url(%23shadow)">Framework Pro</text>
  </svg>`;
}

// Execute the function
updateFrameworkImages().catch(console.error);