// Simple API debugger
fetch('http://localhost:3000/api/user/progress')
    .then(response => response.json())
    .then(data => {
        console.log('API Response:', data);
        
        // Compute progress like we do in our app
        if (data && data.length > 0) {
            const totalModules = data.reduce((sum, progress) => sum + (progress.totalModules || 0), 0);
            const completedModules = data.reduce((sum, progress) => sum + (progress.completedModules || 0), 0);
            
            console.log('Total Modules:', totalModules);
            console.log('Completed Modules:', completedModules);
            console.log('Overall Progress:', totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0);
            
            // Log individual frameworks progress
            console.log('\nIndividual Framework Progress:');
            data.forEach(progress => {
                console.log(`Framework ID ${progress.frameworkId}:`, {
                    completed: progress.completedModules || 0,
                    total: progress.totalModules || 0,
                    percentage: progress.totalModules ? Math.round((progress.completedModules || 0) / progress.totalModules * 100) : 0
                });
            });
        }
    })
    .catch(error => console.error('Error fetching data:', error));