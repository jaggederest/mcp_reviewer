#!/bin/bash
# Test script to verify MCP server is working

echo "🔍 Testing MCP server health..."
echo ""

# Run doctor mode
node dist/index.js --doctor

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 MCP server is ready to use in Claude Code!"
    echo ""
    echo "The server has been added to your project. You can now use these tools:"
    echo "  • generate_spec - Generate technical specifications from prompts"
    echo "  • review_spec - Review specifications for completeness"
    echo "  • review_code - Analyze code changes for quality/security/performance"
    echo "  • run_tests - Execute project test suite"
    echo "  • run_linter - Run code linting with automatic fixes"
    echo ""
    echo "Configuration: .reviewer.json"
    echo "AI Provider: $(grep -o '"aiProvider": *"[^"]*"' .reviewer.json | cut -d'"' -f4)"
else
    echo ""
    echo "❌ MCP server health check failed!"
    echo "Please check the error messages above."
    exit 1
fi