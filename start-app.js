// Start application script
import { exec } from 'child_process';
import process from 'process';
import { spawn } from 'child_process';
import fs from 'fs';

console.log('🚀 Starting Framework Pro application...');

// Check if we need to update framework images
const shouldUpdateImages = !process.env.SKIP_IMAGE_UPDATE;

async function startApp() {
  if (shouldUpdateImages) {
    try {
      console.log('📸 Updating framework images to SVG gradients...');
      // Run the update script for frameworks
      const frameworkUpdateProcess = spawn('node', ['update-framework-images.js']);
      
      // Process the output
      frameworkUpdateProcess.stdout.on('data', (data) => {
        console.log(`Framework image update: ${data.toString().trim()}`);
      });
      
      frameworkUpdateProcess.stderr.on('data', (data) => {
        console.error(`Framework image update error: ${data.toString().trim()}`);
      });
      
      // Wait for the process to complete
      await new Promise((resolve, reject) => {
        frameworkUpdateProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Framework images successfully updated to SVG gradients');
            resolve();
          } else {
            console.error(`❌ Framework image update failed with code ${code}`);
            // Continue anyway
            resolve();
          }
        });
        
        frameworkUpdateProcess.on('error', (err) => {
          console.error('❌ Failed to start framework image update process:', err);
          // Continue anyway
          resolve();
        });
      });
      
      // Now update module images
      console.log('📸 Updating module images to SVG gradients...');
      const moduleUpdateProcess = spawn('node', ['update-module-images.js']);
      
      // Process the output
      moduleUpdateProcess.stdout.on('data', (data) => {
        console.log(`Module image update: ${data.toString().trim()}`);
      });
      
      moduleUpdateProcess.stderr.on('data', (data) => {
        console.error(`Module image update error: ${data.toString().trim()}`);
      });
      
      // Wait for the process to complete
      await new Promise((resolve, reject) => {
        moduleUpdateProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Module images successfully updated to SVG gradients');
            resolve();
          } else {
            console.error(`❌ Module image update failed with code ${code}`);
            // Continue anyway
            resolve();
          }
        });
        
        moduleUpdateProcess.on('error', (err) => {
          console.error('❌ Failed to start module image update process:', err);
          // Continue anyway
          resolve();
        });
      });
    } catch (error) {
      console.error('❌ Error during image update:', error);
      // Continue anyway
    }
  }
  
  console.log('🌐 Starting development server...');
  
  // Start the development server
  const devProcess = exec('npm run dev');

  // Forward stdout and stderr to the console
  devProcess.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  devProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  // Handle process exit
  devProcess.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    devProcess.kill();
    process.exit();
  });
}

// Start the application
startApp().catch(err => {
  console.error('❌ Fatal error starting application:', err);
  process.exit(1);
});