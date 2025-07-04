# Project Context for Claude

## Project Overview
This is an MCP (Model Context Protocol) service called "reviewer-mcp" that provides AI-powered development workflow tools with pluggable AI providers (OpenAI and Ollama). It runs as a stateless stdio-based server that can be self-hosted in any project.

## Key Features
1. **Spec Generation**: Generate detailed technical specifications from prompts
2. **Spec Review**: Review specifications for completeness and provide critical feedback
3. **Code Review**: Analyze code changes with comprehensive, prioritized feedback
4. **Test Runner**: Standardized test execution with consistent output formatting
5. **Linter**: Standardized linting with consistent output formatting
6. **Music Control**: Spotify integration with configurable playlists and safety features (macOS only)
7. **Notifications**: Audio notifications for alerts and status updates (macOS only)
8. **Memory Storage**: Key-value storage with optional disk persistence for maintaining context across sessions

## Architecture
- **Base Classes**: `BaseAITool` for AI-powered tools, `BaseExecTool` for command execution
- **Common Utilities**: Centralized error handling (`createErrorResult`) and output formatting
- **Stateless Design**: Each tool invocation reads config fresh, no persistent state
- **Transport**: Uses stdio for MCP communication (JSON-RPC)

## Technical Stack
- TypeScript with strict type checking
- Node.js with ES modules
- MCP SDK for tool protocol
- Pluggable AI: OpenAI API or Ollama (local models)
- Vitest for testing with coverage reporting
- ESLint with TypeScript rules

## Development Guidelines
- **IMPORTANT**: Use MCP tools for testing and linting - DO NOT run these commands manually via bash:
  - Use `mcp__reviewer__run_tests` for running tests
  - Use `mcp__reviewer__run_linter` for linting
  - TypeScript checking can still be done manually
- Always verify code quality before committing using the MCP tools
- Maintain strict TypeScript types - no `any` types allowed
- Follow existing code patterns and conventions
- Test all new functionality with unit tests
- Handle errors gracefully with informative messages

## Memory Management
- **Review memories on startup**: Use `mcp__reviewer__memory` with action 'list' to see stored context and important project information
- **Store important information**: After discussing key decisions, patterns, or project-specific knowledge with the user, ask if they'd like to persist it as a memory
- **Memory persistence**: Use `persist: true` to save memories to `.claude/memories/` for team sharing via Git
- **Suggested memories to maintain**:
  - Project-specific conventions and patterns
  - API endpoints and credentials (with user permission)
  - Common debugging steps for this project
  - Team preferences and workflows
  - Important implementation decisions
- **Regular memory review**: Check memories at the start of each session to maintain context

## Configuration
The service supports project-specific configuration via `.reviewer.json`:
```json
{
  "testCommand": "npm test",
  "lintCommand": "npm run lint",
  "aiProvider": "ollama",
  "ollamaModel": "tinyllama",
  "ollamaBaseUrl": "http://localhost:11434",
  "openaiModel": "o1-preview",
  "music": {
    "playlists": {
      "focus": {
        "uri": "spotify:playlist:37i9dQZF1DWZeKCadgRdKQ",
        "name": "Classical Focus",
        "description": "Classical pieces for deep concentration"
      }
    },
    "safeVolume": 70,
    "volumeIncrement": 20
  }
}
```

## Environment Variables
- `OPENAI_API_KEY`: Required when using OpenAI provider
- `OPENAI_MODEL`: Override default OpenAI model
- `AI_PROVIDER`: Override provider choice (openai/ollama)
- `OLLAMA_MODEL`: Override Ollama model
- `OLLAMA_BASE_URL`: Override Ollama endpoint

## MCP Server Setup
1. **Build**: `npm run build`
2. **Add to project**: `claude mcp add reviewer --scope project -- node dist/index.js`
3. **Health check**: `node dist/index.js --doctor`
4. **Test script**: `./test-mcp.sh`

## Testing Commands
- `npm test` - Run all tests with bail on first failure
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run e2e tests with Ollama
- `npm run test:coverage` - Run tests with coverage report (target: 20%)
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint with auto-fix

## Testing Strategy
- Unit tests for all utility functions
- E2e integration test validates full workflow with Ollama
- Mock external dependencies where appropriate
- Test error handling paths
- Coverage target: 20% (currently ~19%)

## Current Status
- ✅ All 5 tools fully implemented and tested
- ✅ Base class architecture reduces code duplication by ~40%
- ✅ Pluggable AI providers (OpenAI and Ollama)
- ✅ E2e tests passing with TinyLlama model
- ✅ Self-hostable as MCP server in any project
- ✅ Doctor mode for health checks
- ✅ Project configured to use its own MCP server