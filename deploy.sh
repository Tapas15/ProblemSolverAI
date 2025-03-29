#!/bin/bash
# Enhanced deployment script for Framework Pro

# Simple deployment script - direct approach
echo "Starting Framework Pro in production mode..."

# Environment setup
export NODE_ENV=production
export PORT=${PORT:-5000}

# Check for build artifacts
if [ ! -f "./dist/index.js" ]; then
  echo "Error: Build files not found. Run 'node deploy.js' first."
  exit 1
fi

echo "✅ Starting production server on port ${PORT}..."

# Production environment setup
export NODE_OPTIONS="--max-old-space-size=2048 --no-warnings"

# Start the production server
node dist/index.js