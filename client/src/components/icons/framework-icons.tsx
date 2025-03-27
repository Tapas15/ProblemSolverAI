import React from 'react';

// Framework-specific icons as React components
export const FrameworkIcons: Record<string, React.FC<{className?: string; color?: string}>> = {
  // MECE (Mutually Exclusive, Collectively Exhaustive) - Grid pattern representing organization
  'MECE': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      <path d="M10 5H14" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M10 19H14" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M5 10V14" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M19 10V14" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  
  // Design Thinking - Diamond shape representing the double diamond process
  'Design Thinking': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2L12 22" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
      <path d="M4 12H20" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
      <circle cx="12" cy="2" r="1" fill={color} />
      <circle cx="12" cy="22" r="1" fill={color} />
    </svg>
  ),
  
  // SWOT - Quadrant analysis
  'SWOT': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M7 7L7 7.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 7L17 7.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 17L7 17.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17L17 17.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="5.5" y="9" fill={color} fontSize="3" fontWeight="bold">S</text>
      <text x="16" y="9" fill={color} fontSize="3" fontWeight="bold">W</text>
      <text x="5.5" y="19" fill={color} fontSize="3" fontWeight="bold">O</text>
      <text x="16" y="19" fill={color} fontSize="3" fontWeight="bold">T</text>
    </svg>
  ),
  
  // First Principles - Lightbulb with atomic structure
  'First Principles': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M4.93 4.93L6.34 6.34" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M17.66 17.66L19.07 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12H4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M20 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M6.34 17.66L4.93 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M19.07 4.93L17.66 6.34" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  ),
  
  // Porter's Five Forces - Pentagon with arrows pointing inward
  "Porter's Five Forces": ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L19.8 8.4L17.3 17.6H6.7L4.2 8.4L12 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 8L12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8L15 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8L9 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8L15 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8L9 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="2" fill={color} />
    </svg>
  ),
  
  // Jobs-To-Be-Done - Person with task/goal icon
  'Jobs-To-Be-Done': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
      <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 11L18 13L22 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  
  // Blue Ocean Strategy - Wave symbol
  'Blue Ocean': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12C5.5 9.5 8.5 9.5 11 12C13.5 14.5 16.5 14.5 19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 7C5.5 4.5 8.5 4.5 11 7C13.5 9.5 16.5 9.5 19 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17C5.5 14.5 8.5 14.5 11 17C13.5 19.5 16.5 19.5 19 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="7" r="1" fill={color} />
    </svg>
  ),
  
  // SCAMPER - Seven-pointed star (representing the 7 techniques)
  'SCAMPER': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L12.63 8.12L18.4 5.23L14.29 10.29L19.35 14.4L13.12 12.63L16 18.4L10.94 14.3L6.83 19.35L8.6 13.12L2.83 16L6.94 10.94L1.88 6.83L8.12 8.6L5.23 2.83L10.3 6.94L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="1.5" />
    </svg>
  ),
  
  // Problem-Tree Analysis - Tree structure with roots and branches
  'Problem-Tree': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4V16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 4L8 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 4L16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16L8 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16L16 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 10L9 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 10L15 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="4" r="2" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="10" r="1.5" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="16" r="1.5" stroke={color} strokeWidth="1.5" />
    </svg>
  ),
  
  // Pareto Principle - 80/20 diagram
  'Pareto': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="4" height="12" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="10" y="9" width="4" height="9" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="16" y="12" width="4" height="6" rx="1" stroke={color} strokeWidth="1.5" />
      <path d="M4 18C4 18 8 6 20 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
      <path d="M4 18C4 18 8 14 20 14" stroke={color} strokeWidth="1.5" strokeDasharray="2 1" />
    </svg>
  ),
  
  // Default icon for any missing frameworks
  'Default': ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M12 8V12L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// Helper function to get a framework icon by name
export function getFrameworkIcon(name: string, props: { className?: string; color?: string } = {}) {
  const IconComponent = FrameworkIcons[name] || FrameworkIcons['Default'];
  return <IconComponent {...props} />;
}