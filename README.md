# Reviewer MCP

An MCP (Model Context Protocol) service that provides AI-powered development workflow tools. It supports multiple AI providers (OpenAI and Ollama) and offers standardized tools for specification generation, code review, and project management.

## Features

- **Specification Generation**: Create detailed technical specifications from prompts
- **Specification Review**: Review specifications for completeness and provide critical feedback  
- **Code Review**: Analyze code changes with focus on security, performance, style, or logic
- **Test Runner**: Execute tests with LLM-friendly formatted output
- **Linter**: Run linters with structured output formatting
- **Pluggable AI Providers**: Support for both OpenAI and Ollama (local models)

## Installation

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# AI Provider Configuration
AI_PROVIDER=openai  # Options: openai, ollama

# OpenAI Configuration
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=o1-preview

# Ollama Configuration (for local models)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### Project Configuration

Create a `.reviewer.json` file in your project root to customize commands:

```json
{
  "testCommand": "npm test",
  "lintCommand": "npm run lint",
  "buildCommand": "npm run build",
  "aiProvider": "ollama",
  "ollamaModel": "codellama"
}
```

## Using with Claude Desktop

Add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "reviewer": {
      "command": "node",
      "args": ["/path/to/reviewer-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Using with Ollama

1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama2` or `ollama pull codellama`
3. Set `AI_PROVIDER=ollama` in your `.env` file
4. The service will use your local Ollama instance

## Available Tools

### generate_spec
Generate a technical specification document.

Parameters:
- `prompt` (required): Description of what specification to generate
- `context` (optional): Additional context or requirements
- `format` (optional): Output format - "markdown" or "structured"

### review_spec
Review a specification for completeness and provide critical feedback.

Parameters:
- `spec` (required): The specification document to review
- `focusAreas` (optional): Array of specific areas to focus the review on

### review_code
Review code changes and provide feedback.

Parameters:
- `diff` (required): Git diff or code changes to review
- `context` (optional): Context about the changes
- `reviewType` (optional): Type of review - "security", "performance", "style", "logic", or "all"

### run_tests
Run standardized tests for the project.

Parameters:
- `testCommand` (optional): Test command to run (defaults to configured command)
- `pattern` (optional): Test file pattern to match
- `watch` (optional): Run tests in watch mode

### run_linter
Run standardized linter for the project.

Parameters:
- `lintCommand` (optional): Lint command to run (defaults to configured command)
- `fix` (optional): Attempt to fix issues automatically
- `files` (optional): Array of specific files to lint

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Type checking
npm run typecheck

# Linting
npm run lint
```

## License

MIT