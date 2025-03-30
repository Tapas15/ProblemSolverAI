// deploy.js - Replit Deployment Helper
// This script helps work around the "HostingBuild.image_tag is required" issue

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Log with timestamp for better debugging
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const prefix = isError ? '🛑 ERROR' : '🔄 INFO';
  console.log(`[${timestamp}] ${prefix}: ${message}`);
}

// Check if we're running in Replit
function isReplit() {
  return process.env.REPL_ID && process.env.REPL_OWNER;
}

// Copy the deployment configuration
function setupDeployConfig() {
  try {
    if (fs.existsSync('.replit.deploy') && !fs.existsSync('.replit.backup')) {
      log('Setting up deployment configuration...');
      if (fs.existsSync('.replit')) {
        fs.copyFileSync('.replit', '.replit.backup');
      }
      fs.copyFileSync('.replit.deploy', '.replit');
      log('✅ Deployment configuration updated');
      return true;
    }
    return false;
  } catch (error) {
    log(`Failed to setup deploy config: ${error.message}`, true);
    return false;
  }
}

// Remove problematic directory that causes permission issues during deployment
function removeProblematicDirectory() {
  const problematicPath = path.join(process.cwd(), 'server', 'public', 'images', 'frameworks', 'stock');
  
  try {
    if (fs.existsSync(problematicPath)) {
      log(`Removing problematic directory: ${problematicPath}`);
      // Use recursive option to remove directory and contents
      fs.rmSync(problematicPath, { recursive: true, force: true });
      log('✅ Problematic directory removed successfully');
    } else {
      log('Problematic directory not found, no action needed');
    }
    return true;
  } catch (error) {
    log(`Failed to remove problematic directory: ${error.message}`, true);
    // Continue deployment even if this fails
    return false;
  }
}

// Build the application
function buildApp() {
  try {
    // First remove the problematic directory
    removeProblematicDirectory();
    
    log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    log('✅ Build completed successfully');
    
    if (!fs.existsSync('./dist/index.js')) {
      log('Build output not found. dist/index.js is missing.', true);
      return false;
    }
    return true;
  } catch (error) {
    log(`Build failed: ${error.message}`, true);
    return false;
  }
}

// Run the deploy script
function runDeployScript() {
  try {
    log('Running deploy script...');
    execSync('chmod +x ./deploy.sh && ./deploy.sh', { stdio: 'inherit' });
    log('✅ Deploy script completed');
    return true;
  } catch (error) {
    log(`Deploy script failed: ${error.message}`, true);
    return false;
  }
}

// Main function
async function main() {
  try {
    log('Starting deployment helper for Framework Pro...');
    
    if (isReplit()) {
      log('Running in Replit environment');
      // Only run the setup in Replit environment
      setupDeployConfig();
    } else {
      log('Not running in Replit environment, skipping config setup');
    }

    if (!buildApp()) {
      process.exit(1);
    }

    log('✅ Deployment preparation completed');
    log('Now you can deploy using the Replit deployment interface or run:');
    log('   ./deploy.sh');
    
    // Run the deploy script if requested
    if (process.argv.includes('--run-deploy')) {
      runDeployScript();
    }
    
  } catch (error) {
    log(`Deployment helper failed: ${error.message}`, true);
    process.exit(1);
  }
}

main();