import { useState, useEffect } from 'react';

interface NavigateToProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

/**
 * A component for handling mobile navigation with proper touch behavior
 * Prevents the common sliding issues by controlling the navigation flow
 */
export function NavigateTo({ 
  children, 
  href, 
  className = "", 
  activeClassName = "",
  onClick
}: NavigateToProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Determine if the current location matches the link
  const isActive = () => {
    const path = window.location.pathname;
    if (href === '/' && path === '/') return true;
    if (href !== '/' && path.startsWith(href)) return true;
    return false;
  };

  // Handle navigation with a slight delay to prevent sliding issues
  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Optional click handler (e.g., for closing menus)
    if (onClick) onClick();
    
    // Delay navigation slightly to allow UI feedback
    setTimeout(() => {
      window.location.href = href;
    }, 10);
  };

  // Reset navigation state if unmounted during navigation
  useEffect(() => {
    return () => {
      setIsNavigating(false);
    };
  }, []);

  // Combine classes, including active state if applicable
  const combinedClassName = `${className} ${isActive() ? activeClassName : ""} nav-item`;

  return (
    <div 
      role="link"
      tabIndex={0}
      className={combinedClassName} 
      onClick={handleNavigation}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNavigation(e as unknown as React.MouseEvent);
        }
      }}
    >
      {children}
    </div>
  );
}