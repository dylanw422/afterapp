#!/bin/bash
set -e

# Clean up previous builds
echo "Cleaning up previous builds..."
rm -rf dist dist-server

# Install dependencies (only if needed)
if [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build frontend
echo "Building frontend..."
npm run build

# Build server
echo "Building server..."
npm run build:server

echo "Build completed successfully!"
echo "To start the production server, run: npm run serve"