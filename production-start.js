// Simplified production startup script for Framework Pro
// A direct script for running the application in production mode in Replit
console.log(`[${new Date().toISOString()}] Starting Framework Pro in production mode`);

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '5000';

// Import and run the server directly
try {
  console.log(`[${new Date().toISOString()}] Starting server on port ${process.env.PORT}`);
  
  // Need this for Replit deployment
  process.env.REPLIT_DEPLOYMENT = 'true';
  
  // Import and run the server
  import('./dist/index.js')
    .then(() => {
      console.log(`[${new Date().toISOString()}] ✓ Server started successfully`);
    })
    .catch(error => {
      console.error(`[${new Date().toISOString()}] FATAL ERROR starting server: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
  
  // Handle graceful shutdown
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      console.log(`[${new Date().toISOString()}] Received ${signal}, shutting down gracefully...`);
      setTimeout(() => process.exit(0), 2000);
    });
  });
  
} catch (error) {
  console.error(`[${new Date().toISOString()}] FATAL ERROR: ${error.message}`);
  console.error(error);
  process.exit(1);
}