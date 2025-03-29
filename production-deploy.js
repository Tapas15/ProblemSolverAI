// Enhanced deployment script for Framework Pro
// This script prepares for deployment by handling image updates in a safe manner
import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Log with timestamp for better debugging
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const prefix = isError ? '🛑 ERROR' : '🔄 INFO';
  console.log(`[${timestamp}] ${prefix}: ${message}`);
}

// Set environment to skip problematic directory access
process.env.SKIP_IMAGE_UPDATE = 'true';

// Main function
async function main() {
  try {
    log('Starting deployment preparation for Framework Pro...');
    
    // Setup deployment configuration
    if (fs.existsSync('.replit.deploy') && !fs.existsSync('.replit.backup')) {
      log('Setting up deployment configuration...');
      if (fs.existsSync('.replit')) {
        fs.copyFileSync('.replit', '.replit.backup');
      }
      fs.copyFileSync('.replit.deploy', '.replit');
      log('✅ Deployment configuration updated');
    }

    // Run build
    log('Building application...');
    await new Promise((resolve, reject) => {
      const buildProcess = exec('npm run build');
      
      buildProcess.stdout.on('data', (data) => {
        console.log(data.toString());
      });
      
      buildProcess.stderr.on('data', (data) => {
        console.error(data.toString());
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          log('✅ Build completed successfully');
          resolve();
        } else {
          log(`❌ Build failed with code ${code}`, true);
          reject(new Error(`Build failed with code ${code}`));
        }
      });
    });
    
    log('✅ Deployment preparation completed');
    log('Now you can deploy using the Replit deployment interface');
    
  } catch (error) {
    log(`Deployment preparation failed: ${error.message}`, true);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  log(`Fatal error: ${error.message}`, true);
  process.exit(1);
});