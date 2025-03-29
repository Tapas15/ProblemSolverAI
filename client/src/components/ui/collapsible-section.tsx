import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Code } from 'lucide-react';

export interface CollapsibleSectionProps {
  title: string;
  expanded?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  expanded = false,
  children,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [children]);

  return (
    <div className={`border border-gray-200 rounded-md overflow-hidden mb-4 ${className}`}>
      <div
        className="p-3 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-md font-medium text-gray-800">{title}</h3>
        <button className="text-gray-500">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      <div
        ref={contentRef}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{ 
          maxHeight: isExpanded ? (contentHeight ? `${contentHeight}px` : '1000px') : '0' 
        }}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export interface ReadMoreToggleProps {
  children: React.ReactNode;
  maxHeight?: number;
  label?: string;
  className?: string;
}

export const ReadMoreToggle: React.FC<ReadMoreToggleProps> = ({
  children,
  maxHeight = 200,
  label = 'content',
  className = '',
}) => {
  // Simple expanded state
  const [expanded, setExpanded] = useState(false);
  
  // Container for the full content
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track if content is taller than maxHeight
  const [needsToggle, setNeedsToggle] = useState(false);
  
  // This effect runs once after initial render to check if toggle is needed
  useEffect(() => {
    if (!containerRef.current) return;
    
    // For performance: Use requestAnimationFrame to measure height at the next paint
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      
      // Get the actual height of the content
      const contentHeight = containerRef.current.scrollHeight;
      
      // Content needs a toggle if it's taller than maxHeight
      setNeedsToggle(contentHeight > maxHeight + 20); // Add small buffer to avoid flickering
    });
  }, [maxHeight]); // Only re-run if maxHeight changes
  
  return (
    <div className={`read-more-toggle ${className}`}>
      {/* Content container with hardware-accelerated transitions */}
      <div 
        ref={containerRef}
        className="content-container relative"
        style={{
          maxHeight: expanded ? '5000px' : `${maxHeight}px`, // Use larger value for expanded state
          overflow: expanded ? 'visible' : 'hidden',
          transition: expanded ? 'max-height 0.5s ease' : 'max-height 0.3s ease-out',
          willChange: 'max-height' // Hint to browser to optimize this property
        }}
      >
        {children}
        
        {/* Gradient overlay at the bottom when content is collapsed */}
        {!expanded && needsToggle && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"
            style={{ zIndex: 2 }}
          />
        )}
      </div>
      
      {/* Toggle button - only shown if content is tall enough to need it */}
      {needsToggle && (
        <div className="toggle-controls text-right mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm inline-flex items-center text-primary hover:underline cursor-pointer font-medium transition-colors" 
            style={{ zIndex: 3, position: 'relative' }}
          >
            {expanded ? (
              <>Show Less {label} <ChevronUp className="h-4 w-4 ml-1" /></>
            ) : (
              <>Show More {label} <ChevronDown className="h-4 w-4 ml-1" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto my-4 border border-gray-200 rounded-md ${className}`}>
      {children}
    </div>
  );
};

export interface FormulaBlockProps {
  formula: string;
  caption?: string;
  className?: string;
}

export const FormulaBlock: React.FC<FormulaBlockProps> = ({
  formula,
  caption,
  className = '',
}) => {
  return (
    <div className={`my-4 ${className}`}>
      <div className="bg-gray-50 p-3 border border-gray-200 rounded-md font-mono text-sm flex items-center">
        <Code className="text-gray-500 mr-2 h-4 w-4" />
        <pre className="overflow-x-auto">{formula}</pre>
      </div>
      {caption && (
        <div className="text-center text-xs text-gray-500 mt-1">{caption}</div>
      )}
    </div>
  );
};