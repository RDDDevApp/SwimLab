#!/bin/bash
set -euo pipefail

# Install npm dependencies for the web session
echo "Installing npm dependencies..."
npm install

# Set up environment variables for web session
if [ -f "$CLAUDE_PROJECT_DIR/.env.example" ] && [ ! -f "$CLAUDE_PROJECT_DIR/.env" ]; then
  echo "Setting up environment variables from .env.example..."
  cp "$CLAUDE_PROJECT_DIR/.env.example" "$CLAUDE_PROJECT_DIR/.env"
fi

echo "Setup complete!"
