#!/bin/bash

echo "Checking Ollama availability..."

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "⚠️  Ollama is not running"
    echo ""
    echo "To run the e2e test:"
    echo "1. Install Ollama from https://ollama.ai"
    echo "2. Start Ollama"
    echo "3. Pull a model: ollama pull llama2"
    echo ""
    echo "Skipping e2e test."
    exit 0
fi

# Check if models are available
models=$(curl -s http://localhost:11434/api/tags | jq -r '.models[]?.name' 2>/dev/null)
if [ -z "$models" ]; then
    echo "⚠️  No Ollama models found"
    echo ""
    echo "To run the e2e test:"
    echo "Pull a model: ollama pull llama2"
    echo ""
    echo "Skipping e2e test."
    exit 0
fi

echo "✓ Ollama is available with models:"
echo "$models" | sed 's/^/  - /'
echo ""
echo "Running e2e test..."
npm run test:e2e