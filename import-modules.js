// Import modules from JSON files into the database
import fs from 'fs/promises';
import { db } from './server/db.js';
import { modules } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function importModules(jsonFilePath, shouldUpdate = false) {
  try {
    // Read JSON file
    const data = await fs.readFile(jsonFilePath, 'utf8');
    const modulesToImport = JSON.parse(data);
    
    console.log(`Importing ${modulesToImport.length} modules from ${jsonFilePath}...`);
    
    for (const moduleData of modulesToImport) {
      // Check if module already exists
      const existingModules = await db.select()
        .from(modules)
        .where(
          eq(modules.frameworkId, moduleData.frameworkId),
          eq(modules.name, moduleData.name)
        );
      
      if (existingModules.length > 0) {
        const existingModule = existingModules[0];
        
        if (shouldUpdate) {
          // Update existing module
          console.log(`Updating module: ${moduleData.name}`);
          await db.update(modules)
            .set({
              description: moduleData.description,
              content: moduleData.content,
              examples: moduleData.examples,
              keyTakeaways: moduleData.keyTakeaways,
              order: moduleData.order,
              completed: moduleData.completed || false
            })
            .where(eq(modules.id, existingModule.id));
        } else {
          console.log(`Module already exists: ${moduleData.name} (skipping)`);
        }
      } else {
        // Create new module
        console.log(`Creating module: ${moduleData.name}`);
        await db.insert(modules).values(moduleData);
      }
    }
    
    console.log(`Successfully processed ${modulesToImport.length} modules from ${jsonFilePath}`);
  } catch (error) {
    console.error(`Error importing modules from ${jsonFilePath}:`, error);
  }
}

async function main() {
  // Import modules from different JSON files
  try {
    await importModules('./scamper-modules.json', true);
    await importModules('./pareto-modules.json', true);
    
    console.log('All modules imported successfully!');
  } catch (error) {
    console.error('Error in import process:', error);
  } finally {
    process.exit(0);
  }
}

main();