#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { generateSpec } from './tools/generateSpec.js';
import { reviewSpec } from './tools/reviewSpec.js';
import { reviewCode } from './tools/reviewCode.js';
import { runTests } from './tools/runTests.js';
import { runLinter } from './tools/runLinter.js';

dotenv.config();

const server = new McpServer(
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

// Register generate_spec tool
server.registerTool(
  'generate_spec',
  {
    description: 'Generate a specification document using OpenAI O3 model',
    inputSchema: {
      prompt: z.string().describe('Description of what specification to generate'),
      context: z.string().optional().describe('Additional context or requirements'),
      format: z.enum(['markdown', 'structured']).optional().default('markdown').describe('Output format for the specification'),
    },
  },
  async (args) => generateSpec(args)
);

// Register review_spec tool
server.registerTool(
  'review_spec',
  {
    description: 'Review a specification for completeness and provide critical feedback',
    inputSchema: {
      spec: z.string().describe('The specification document to review'),
      focusAreas: z.array(z.string()).optional().describe('Specific areas to focus the review on'),
    },
  },
  async (args) => reviewSpec(args)
);

// Register review_code tool
server.registerTool(
  'review_code',
  {
    description: 'Review code changes and provide feedback',
    inputSchema: {
      diff: z.string().describe('Git diff or code changes to review'),
      context: z.string().optional().describe('Context about the changes'),
      reviewType: z.enum(['security', 'performance', 'style', 'logic', 'all']).optional().default('all').describe('Type of review to perform'),
    },
  },
  async (args) => reviewCode(args)
);

// Register run_tests tool
server.registerTool(
  'run_tests',
  {
    description: 'Run standardized tests for the project',
    inputSchema: {
      testCommand: z.string().optional().describe('Test command to run (defaults to configured command)'),
      pattern: z.string().optional().describe('Test file pattern to match'),
      watch: z.boolean().optional().default(false).describe('Run tests in watch mode'),
    },
  },
  async (args) => runTests(args)
);

// Register run_linter tool
server.registerTool(
  'run_linter',
  {
    description: 'Run standardized linter for the project',
    inputSchema: {
      lintCommand: z.string().optional().describe('Lint command to run (defaults to configured command)'),
      fix: z.boolean().optional().default(false).describe('Attempt to fix issues automatically'),
      files: z.array(z.string()).optional().describe('Specific files to lint'),
    },
  },
  async (args) => runLinter(args)
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Reviewer MCP service started');
}

main().catch((error: unknown) => {
  console.error('Fatal error:', error);
  process.exit(1);
});