# Project Context for Claude

## Project Overview
This is an MCP (Model Context Protocol) service called "reviewer-mcp" that integrates with OpenAI's O3 model to provide AI-powered development workflow tools.

## Key Features
1. **Spec Generation**: Generate detailed technical specifications from prompts
2. **Spec Review**: Review specifications for completeness and provide critical feedback
3. **Code Review**: Analyze code changes with focus on security, performance, style, or logic
4. **Test Runner**: Standardized test execution with consistent output formatting
5. **Linter**: Standardized linting with consistent output formatting

## Technical Stack
- TypeScript with strict type checking
- Node.js with ES modules
- MCP SDK for tool protocol
- OpenAI API for AI capabilities
- Vitest for testing
- ESLint with TypeScript rules

## Development Guidelines
- Always run `npm run typecheck`, `npm run lint`, and `npm test` before committing
- Maintain strict TypeScript types - no `any` types allowed
- Follow existing code patterns and conventions
- Test all new functionality with unit tests
- Handle errors gracefully with informative messages

## Configuration
The service supports project-specific configuration via `.reviewer.json`:
```json
{
  "testCommand": "npm test",
  "lintCommand": "npm run lint",
  "buildCommand": "npm run build",
  "openaiModel": "o1-preview"
}
```

## Environment Variables
- `OPENAI_API_KEY`: Required for OpenAI API access
- `OPENAI_MODEL`: Override default model (defaults to o1-preview)

## Testing Strategy
- Unit tests for all utility functions
- Mock external dependencies (OpenAI API, file system)
- Test error handling paths
- Maintain high code coverage

## Current Status
- Basic project structure established
- TypeScript and ESLint configured with strict rules
- Spec generation and review tools partially implemented
- Test framework set up with initial tests
- Git repository initialized for version control

## Next Steps
See docs/plan/ directory for detailed planning documents.