// Enhanced script to update all framework and module images with elegant SVG gradients
// This creates professional, consistent visuals without relying on external images

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Read the TypeScript gradient generator utility content and create a JavaScript version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to extract color palettes
function extractFrameworkColorPalettes() {
  // Advanced color palettes for frameworks
  return {
    // MECE Framework - Deep blue to royal purple
    '1': { light: '#4158D0', dark: '#C850C0', accent: '#FFCC70' },
    
    // Design Thinking - Vibrant coral to soft pink
    '2': { light: '#FF3CAC', dark: '#784BA0', accent: '#2B86C5' }, 
    
    // SWOT Analysis - Emerald to teal
    '3': { light: '#43cea2', dark: '#185a9d', accent: '#f8f9fa' },
    
    // First Principles - Deep indigo to electric blue
    '4': { light: '#3A1C71', dark: '#00DBDE', accent: '#FC00FF' },
    
    // Porter's Five Forces - Royal blue to lavender
    '5': { light: '#0061ff', dark: '#60efff', accent: '#1e293b' },
    
    // Jobs-To-Be-Done - Fresh lime to forest green
    '6': { light: '#38ef7d', dark: '#11998e', accent: '#f7f7f7' },
    
    // Blue Ocean Strategy - Ocean blue gradient
    '7': { light: '#396afc', dark: '#2948ff', accent: '#eef2ff' },
    
    // SCAMPER - Sunset orange to warm pink
    '8': { light: '#FA8BFF', dark: '#2BD2FF', accent: '#2BFF88' },
    
    // Problem-Tree Analysis - Mint green to azure
    '9': { light: '#48c6ef', dark: '#6f86d6', accent: '#ffffff' },
    
    // Pareto Principle - Golden amber to terracotta
    '10': { light: '#f83600', dark: '#fe8c00', accent: '#ffd700' },
  };
}

// Get framework colors
function getFrameworkColors(frameworkId) {
  const colorPalettes = extractFrameworkColorPalettes();
  const id = frameworkId.toString();
  return colorPalettes[id] || colorPalettes['1'];
}

// Generate Framework SVG gradient
function generateFrameworkGradient(frameworkId, name, subtitle = 'Framework Pro') {
  const colors = getFrameworkColors(frameworkId);
  
  // Create an SVG with a gradient background and text
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.light.replace('#', '%23')}" />
        <stop offset="100%" stop-color="${colors.dark.replace('#', '%23')}" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${colors.accent.replace('#', '%23')}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${colors.dark.replace('#', '%23')}" stop-opacity="0.1" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.3" />
      </filter>
      <filter id="glow">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="500" height="300" fill="url(%23grad)" />
    
    <!-- Decorative Elements -->
    <g>
      <!-- Larger decorative shapes -->
      <path d="M0,50 Q100,200 250,150 T500,250" stroke="${colors.accent.replace('#', '%23')}" stroke-width="2" fill="none" opacity="0.2" />
      <path d="M0,100 Q150,50 300,200 T500,150" stroke="white" stroke-width="1.5" fill="none" opacity="0.1" />
      
      <!-- Floating circular elements -->
      <circle cx="400" cy="50" r="30" fill="${colors.accent.replace('#', '%23')}" fill-opacity="0.15" />
      <circle cx="100" cy="250" r="40" fill="white" fill-opacity="0.15" />
      <circle cx="50" cy="50" r="20" fill="${colors.accent.replace('#', '%23')}" fill-opacity="0.2" />
      <circle cx="450" cy="250" r="25" fill="white" fill-opacity="0.15" />
      <circle cx="250" cy="180" r="70" fill="url(%23accentGrad)" fill-opacity="0.15" />
      
      <!-- Small accent dots -->
      <circle cx="125" cy="75" r="5" fill="white" fill-opacity="0.4" />
      <circle cx="375" cy="225" r="5" fill="white" fill-opacity="0.4" />
      <circle cx="420" cy="120" r="3" fill="white" fill-opacity="0.4" />
      <circle cx="80" cy="200" r="3" fill="white" fill-opacity="0.4" />
    </g>
    
    <!-- Framework Name with Glow Effect -->
    <text x="250" y="140" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="white" filter="url(%23shadow)">${name}</text>
    
    <!-- Subtle line separator -->
    <line x1="150" y1="160" x2="350" y2="160" stroke="white" stroke-width="1" opacity="0.3" />
    
    <!-- Subtitle -->
    <text x="250" y="190" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="white" filter="url(%23shadow)">${subtitle}</text>
  </svg>`;
}

// Generate Module SVG gradient
function generateModuleGradient(frameworkId, moduleName, frameworkName) {
  const colors = getFrameworkColors(frameworkId);
  
  // Create an SVG with gradient background, text, and decorative elements
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.light.replace('#', '%23')}" />
        <stop offset="100%" stop-color="${colors.dark.replace('#', '%23')}" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.accent.replace('#', '%23')}" stop-opacity="0.4" />
        <stop offset="100%" stop-color="${colors.dark.replace('#', '%23')}" stop-opacity="0.1" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.3" />
      </filter>
      <clipPath id="rounded-rect">
        <rect x="0" y="0" width="500" height="300" rx="10" ry="10" />
      </clipPath>
    </defs>
    
    <!-- Main background with rounded corners -->
    <rect width="500" height="300" fill="url(%23grad)" clip-path="url(%23rounded-rect)" />
    
    <!-- Accent corner effect -->
    <path d="M0,0 L100,0 L0,100 Z" fill="${colors.accent.replace('#', '%23')}" fill-opacity="0.15" />
    <path d="M500,300 L500,200 L400,300 Z" fill="${colors.accent.replace('#', '%23')}" fill-opacity="0.15" />
    
    <!-- Decorative patterns -->
    <g>
      <!-- Subtle grid pattern -->
      <path d="M0,75 L500,75" stroke="white" stroke-width="0.5" stroke-dasharray="10,10" opacity="0.1" />
      <path d="M0,150 L500,150" stroke="white" stroke-width="0.5" stroke-dasharray="10,10" opacity="0.1" />
      <path d="M0,225 L500,225" stroke="white" stroke-width="0.5" stroke-dasharray="10,10" opacity="0.1" />
      
      <!-- Floating elements -->
      <circle cx="400" cy="50" r="25" fill="${colors.accent.replace('#', '%23')}" fill-opacity="0.15" />
      <circle cx="100" cy="250" r="30" fill="white" fill-opacity="0.15" />
      <circle cx="50" cy="50" r="15" fill="${colors.accent.replace('#', '%23')}" fill-opacity="0.2" />
      <circle cx="450" cy="250" r="20" fill="white" fill-opacity="0.1" />
      
      <!-- Accent shapes -->
      <rect x="20" y="200" width="40" height="40" rx="10" fill="${colors.accent.replace('#', '%23')}" fill-opacity="0.1" />
      <rect x="440" y="60" width="40" height="40" rx="10" fill="${colors.accent.replace('#', '%23')}" fill-opacity="0.1" />
    </g>
    
    <!-- Module content box -->
    <rect x="100" y="100" width="300" height="120" rx="5" fill="url(%23accentGrad)" fill-opacity="0.2" />
    
    <!-- Module Name -->
    <text x="250" y="140" font-family="Arial, sans-serif" font-size="26" font-weight="bold" text-anchor="middle" fill="white" filter="url(%23shadow)">${moduleName}</text>
    
    <!-- Subtle separator -->
    <line x1="175" y1="160" x2="325" y2="160" stroke="white" stroke-width="1" opacity="0.3" />
    
    <!-- Framework Name -->
    <text x="250" y="180" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white" filter="url(%23shadow)">${frameworkName}</text>
  </svg>`;
}

async function updateAllImages() {
  console.log('🎨 Starting comprehensive image update with elegant gradients');
  
  // Create a PostgreSQL client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    // Connect to the database
    await client.connect();
    console.log('📊 Connected to the database');
    
    // === UPDATE FRAMEWORK IMAGES ===
    
    // Get all frameworks
    const frameworksResult = await client.query(`
      SELECT id, name FROM frameworks ORDER BY id
    `);
    
    const frameworks = frameworksResult.rows;
    console.log(`🖼️ Found ${frameworks.length} frameworks to update`);
    
    // Update each framework with enhanced SVG gradients
    for (const framework of frameworks) {
      const gradientSvg = generateFrameworkGradient(
        framework.id,
        framework.name
      );
      
      await client.query(`
        UPDATE frameworks 
        SET image_url = $1 
        WHERE id = $2
      `, [gradientSvg, framework.id]);
      
      console.log(`✅ Updated image for framework: ${framework.name} (ID: ${framework.id})`);
    }
    
    console.log('🏆 All framework images updated with elegant gradients');
    
    // === UPDATE MODULE IMAGES ===
    
    // Get all modules with their framework info
    const modulesResult = await client.query(`
      SELECT m.id, m.name, m.framework_id, f.name as framework_name
      FROM modules m
      JOIN frameworks f ON m.framework_id = f.id
      ORDER BY m.framework_id, m.order
    `);
    
    const modules = modulesResult.rows;
    console.log(`📚 Found ${modules.length} modules to update`);
    
    // Update each module with enhanced SVG gradients
    for (const module of modules) {
      const gradientSvg = generateModuleGradient(
        module.framework_id,
        module.name,
        module.framework_name
      );
      
      await client.query(`
        UPDATE modules 
        SET image_url = $1 
        WHERE id = $2
      `, [gradientSvg, module.id]);
      
      console.log(`✅ Updated image for module: ${module.name} (Framework: ${module.framework_name})`);
    }
    
    console.log('🏆 All module images updated with elegant gradients');
    
  } catch (error) {
    console.error('❌ Error updating images:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('🔒 Database connection closed');
  }
}

// Execute the function
updateAllImages().catch(error => {
  console.error('❌ Fatal error during image update:', error);
  process.exit(1);
});