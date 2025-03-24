import { useEffect } from 'react';
import { useLocation } from 'wouter';

// This is a placeholder component that redirects to the Frameworks page
// In a future enhancement, this could be a dedicated learning path page
export default function LearningPathPage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to the frameworks page since they're currently showing the same content
    setLocation('/');
  }, [setLocation]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-700">Redirecting to Frameworks...</p>
    </div>
  );
}