# Architecture Plan

## Overview
The reviewer-mcp service acts as a bridge between Claude Code and OpenAI's O3 model, providing standardized development workflow tools through the MCP protocol.

## Core Components

### 1. MCP Server (`src/index.ts`)
- Handles tool registration and request routing
- Provides standard MCP interface for Claude Code
- Manages tool discovery and invocation

### 2. Tool Implementations (`src/tools/`)
- **generateSpec.ts**: Creates technical specifications
- **reviewSpec.ts**: Reviews and critiques specifications
- **reviewCode.ts**: Analyzes code changes
- **runTests.ts**: Executes tests with formatted output
- **runLinter.ts**: Runs linters with formatted output

### 3. Utilities (`src/utils/`)
- **config.ts**: Manages project-specific configuration
- **openai.ts**: Handles OpenAI API interactions
- **executor.ts** (planned): Manages command execution
- **formatter.ts** (planned): Formats command output for LLM consumption

### 4. Types (`src/types/`)
- Centralized TypeScript type definitions
- Ensures type safety across the codebase

## Design Principles

### 1. Consistency Over Flexibility
- Standardized command execution reduces drift
- Predictable output formats improve LLM parsing
- Project-specific configs handle variations

### 2. LLM-Optimized Output
- Structured, parseable responses
- Clear error messages with context
- Relevant information prioritized

### 3. Fail-Safe Design
- Graceful error handling
- Informative error messages
- No silent failures

### 4. Extensibility
- Easy to add new tools
- Configuration-driven behavior
- Plugin architecture for custom commands

## Data Flow
1. Claude Code invokes MCP tool
2. MCP server routes to appropriate handler
3. Handler validates input and loads config
4. For AI tools: Call OpenAI API
5. For command tools: Execute with formatting
6. Return structured response to Claude Code

## Security Considerations
- API keys stored in environment variables
- No execution of arbitrary commands
- Input validation on all tools
- Sanitized output to prevent injection

## Performance Considerations
- Lazy loading of configurations
- Caching of OpenAI client
- Minimal dependencies
- Async/await for non-blocking operations