#!/bin/bash
echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Starting server..."
npm run start