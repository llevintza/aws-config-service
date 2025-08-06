#!/bin/bash

# Robust Yarn Install Script for GitHub Actions
# This script provides retry logic and fallback mechanisms for yarn install
# to handle transient network errors like "500 Internal Server Error"

set -e

echo "🔄 Installing dependencies with robust retry logic..."

max_attempts=3
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Installing dependencies"
    
    if yarn install --frozen-lockfile --network-timeout 100000; then
        echo "✅ Dependencies installed successfully on attempt $attempt"
        exit 0
    else
        echo "⚠️ Attempt $attempt failed"
        
        if [ $attempt -eq $max_attempts ]; then
            echo "❌ All standard attempts failed. Trying fallback approaches..."
            
            # Clear yarn cache
            echo "Clearing yarn cache..."
            yarn cache clean
            
            # Try with npm registry fallback
            echo "Trying with npm registry fallback..."
            if yarn install --frozen-lockfile --network-timeout 100000 --registry https://registry.npmjs.org/; then
                echo "✅ Dependencies installed with npm registry fallback"
                exit 0
            else
                echo "❌ All retry attempts and fallbacks failed"
                exit 1
            fi
        fi
        
        echo "Waiting 10 seconds before retry..."
        sleep 10
    fi
    
    attempt=$((attempt + 1))
done
