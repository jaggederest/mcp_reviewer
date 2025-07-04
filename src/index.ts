#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { generateSpec } from './tools/generateSpec.js';
import { reviewSpec } from './tools/reviewSpec.js';
import { reviewCode } from './tools/reviewCode.js';
import { runTests } from './tools/runTests.js';
import { runLinter } from './tools/runLinter.js';

dotenv.config();

const server = new Server(
  {
    name: 'reviewer-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_spec',
        description: 'Generate a specification document using OpenAI O3 model',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Description of what specification to generate' },
            context: { type: 'string', description: 'Additional context or requirements' },
            format: { 
              type: 'string', 
              enum: ['markdown', 'structured'], 
              description: 'Output format for the specification',
              default: 'markdown'
            }
          },
          required: ['prompt'],
        },
      },
      {
        name: 'review_spec',
        description: 'Review a specification for completeness and provide critical feedback',
        inputSchema: {
          type: 'object',
          properties: {
            spec: { type: 'string', description: 'The specification document to review' },
            focusAreas: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Specific areas to focus the review on'
            }
          },
          required: ['spec'],
        },
      },
      {
        name: 'review_code',
        description: 'Review code changes and provide feedback',
        inputSchema: {
          type: 'object',
          properties: {
            diff: { type: 'string', description: 'Git diff or code changes to review' },
            context: { type: 'string', description: 'Context about the changes' },
            reviewType: {
              type: 'string',
              enum: ['security', 'performance', 'style', 'logic', 'all'],
              default: 'all'
            }
          },
          required: ['diff'],
        },
      },
      {
        name: 'run_tests',
        description: 'Run standardized tests for the project',
        inputSchema: {
          type: 'object',
          properties: {
            testCommand: { type: 'string', description: 'Test command to run (defaults to configured command)' },
            pattern: { type: 'string', description: 'Test file pattern to match' },
            watch: { type: 'boolean', description: 'Run tests in watch mode', default: false }
          },
        },
      },
      {
        name: 'run_linter',
        description: 'Run standardized linter for the project',
        inputSchema: {
          type: 'object',
          properties: {
            lintCommand: { type: 'string', description: 'Lint command to run (defaults to configured command)' },
            fix: { type: 'boolean', description: 'Attempt to fix issues automatically', default: false },
            files: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Specific files to lint'
            }
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'generate_spec':
      return await generateSpec(args);
    case 'review_spec':
      return await reviewSpec(args);
    case 'review_code':
      return await reviewCode(args);
    case 'run_tests':
      return await runTests(args);
    case 'run_linter':
      return await runLinter(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Reviewer MCP service started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});