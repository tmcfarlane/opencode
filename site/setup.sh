#!/bin/bash
set -e

echo "🚀 Setting up Cursor Agent Info Center..."

cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
bun install

echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  cd site"
echo "  bun run dev"
echo ""
echo "The site will be available at http://localhost:3001"
