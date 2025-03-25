// Add this to your browser's console when logged in
(async function() {
  try {
    const response = await fetch('/api/user/progress');
    const data = await response.json();
    console.log('Progress data:', data);
    
    // Output the structure of each progress item
    if (data && data.length > 0) {
      console.log('First progress item structure:', Object.keys(data[0]));
      
      // Calculate individual progress percentages
      data.forEach(progress => {
        console.log(`Framework ${progress.frameworkId}:`, {
          completedModules: progress.completedModules,
          totalModules: progress.totalModules,
          percentage: progress.totalModules ? 
            Math.round((progress.completedModules / progress.totalModules) * 100) : 0
        });
      });
      
      // Check for any progress items with missing values
      const problemItems = data.filter(p => 
        p.completedModules === undefined || 
        p.completedModules === null || 
        p.totalModules === undefined || 
        p.totalModules === null ||
        p.totalModules === 0
      );
      
      if (problemItems.length > 0) {
        console.log('Problem items with missing values:', problemItems);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();