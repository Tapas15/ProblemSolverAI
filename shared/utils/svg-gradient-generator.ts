/**
 * SVG Gradient Generator Utility
 * 
 * This utility generates SVG gradient backgrounds for frameworks and modules
 * Used to provide consistent, beautiful visual elements without relying on external images
 */

// Define color palettes for each framework
export const frameworkColorPalettes = {
  // MECE Framework - Blue-purple gradient
  '1': { light: '#667eea', dark: '#764ba2' },
  // Design Thinking - Pink-orange gradient
  '2': { light: '#f093fb', dark: '#f5576c' }, 
  // SWOT Analysis - Teal-blue gradient
  '3': { light: '#84fab0', dark: '#8fd3f4' },
  // First Principles - Deep blue-purple gradient
  '4': { light: '#6a11cb', dark: '#2575fc' },
  // Porter's Five Forces - Purple-blue gradient
  '5': { light: '#a1c4fd', dark: '#c2e9fb' },
  // Jobs-To-Be-Done - Green gradient
  '6': { light: '#d4fc79', dark: '#96e6a1' },
  // Blue Ocean Strategy - Soft blue gradient  
  '7': { light: '#a1c4fd', dark: '#c2e9fb' },
  // SCAMPER - Orange-pink gradient
  '8': { light: '#ffcb8c', dark: '#ff8b8d' },
  // Problem-Tree Analysis - Green-blue gradient
  '9': { light: '#84fab0', dark: '#8fd3f4' },
  // Pareto Principle - Orange gradient
  '10': { light: '#ff9a9e', dark: '#fad0c4' },
};

/**
 * Get colors for a specific framework
 * @param frameworkId The ID of the framework
 * @returns Color palette for the framework
 */
export const getFrameworkColors = (frameworkId: string | number) => {
  const id = frameworkId.toString();
  // Make sure we have a valid index, defaulting to 1 if not found
  return frameworkColorPalettes[id as keyof typeof frameworkColorPalettes] || frameworkColorPalettes['1'];
};

/**
 * Generate an SVG gradient for a framework
 * @param frameworkId The ID of the framework
 * @param name The name to display on the gradient
 * @param subtitle Optional subtitle to display
 * @returns Data URL containing the SVG
 */
export const generateFrameworkGradient = (
  frameworkId: string | number, 
  name: string, 
  subtitle: string = 'Framework Pro'
): string => {
  const colors = getFrameworkColors(frameworkId);
  
  // Create an SVG with a gradient background and text
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
      <circle cx="400" cy="50" r="30" fill="white" fill-opacity="0.2" />
      <circle cx="100" cy="250" r="40" fill="white" fill-opacity="0.2" />
      <circle cx="50" cy="50" r="20" fill="white" fill-opacity="0.2" />
      <circle cx="450" cy="250" r="25" fill="white" fill-opacity="0.2" />
      <circle cx="250" cy="150" r="60" fill="white" fill-opacity="0.1" />
    </g>
    <text x="250" y="150" font-family="Arial, sans-serif" font-size="30" font-weight="bold" text-anchor="middle" fill="white" filter="url(%23shadow)">${name}</text>
    <text x="250" y="190" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white" filter="url(%23shadow)">${subtitle}</text>
  </svg>`;
};

/**
 * Generate an SVG gradient for a module
 * @param frameworkId The ID of the framework this module belongs to
 * @param moduleName The name of the module
 * @param frameworkName The name of the parent framework
 * @returns Data URL containing the SVG
 */
export const generateModuleGradient = (
  frameworkId: string | number, 
  moduleName: string, 
  frameworkName: string
): string => {
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
};