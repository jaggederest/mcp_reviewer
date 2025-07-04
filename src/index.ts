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
import { notify } from './tools/notify.js';
import { music } from './tools/music.js';
import { memory } from './tools/memory.js';

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
    },
  },
  async (args) => reviewCode(args)
);

// Register run_tests tool
server.registerTool(
  'run_tests',
  {
    description: 'Run standardized tests for the project (with coverage when no pattern specified)',
    inputSchema: {
      pattern: z.string().optional().describe('Test file pattern to match (runs coverage mode if omitted)'),
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
      fix: z.boolean().optional().default(false).describe('Attempt to fix issues automatically'),
      files: z.array(z.string()).optional().describe('Specific files to lint'),
    },
  },
  async (args) => runLinter(args)
);

// Register notify tool
server.registerTool(
  'notify',
  {
    description: 'Provide audio notifications to users (macOS only)',
    inputSchema: {
      message: z.string().describe('The message to speak'),
      type: z.enum(['question', 'alert', 'confirmation', 'info']).optional().default('info').describe('Type of notification'),
      voice: z.string().optional().describe('Voice to use for speech (e.g., "Daniel", "Samantha")'),
      rate: z.number().optional().describe('Speaking rate in words per minute'),
    },
  },
  async (args) => notify(args)
);

// Register music tool
server.registerTool(
  'music',
  {
    description: 'Control Spotify for background music (macOS only)',
    inputSchema: {
      action: z.enum(['play', 'pause', 'playpause', 'next', 'previous', 'volume', 'mute', 'info']).describe('Music control action'),
      uri: z.string().optional().describe('Spotify URI or search term'),
      volume: z.number().min(0).max(100).optional().describe('Volume level (0-100)'),
      mood: z.string().optional().describe('Mood-based playlist selection (focus, relax, energize, chill, work, or custom)'),
    },
  },
  async (args) => music(args)
);

// Register memory tool
server.registerTool(
  'memory',
  {
    description: 'Store and retrieve temporary key-value pairs in memory (data is lost on MCP server restart)',
    inputSchema: {
      action: z.enum(['set', 'get', 'list', 'delete', 'search', 'clear']).describe('Memory operation to perform'),
      key: z.string().optional().describe('Key for the memory entry'),
      value: z.string().optional().describe('Value to store (required for set action)'),
      tags: z.array(z.string()).optional().describe('Tags for categorization'),
      pattern: z.string().optional().describe('Search pattern (for search action)'),
      persist: z.boolean().optional().describe('Save to disk (for set action)'),
    },
  },
  async (args) => memory(args)
);

async function main(): Promise<void> {
  // Check if running in doctor mode
  const args = process.argv.slice(2);
  if (args.includes('--doctor') || args.includes('--check')) {
    console.log('🏥 Running MCP server health check...\n');
    
    try {
      // Test loading configuration
      const { loadProjectConfig } = await import('./utils/config.js');
      const config = await loadProjectConfig();
      console.log('✅ Configuration loaded successfully');
      console.log(`   AI Provider: ${config.aiProvider ?? 'default'}`);
      console.log(`   Model: ${String(config.aiProvider === 'ollama' ? config.ollamaModel : config.openaiModel)}`);
      
      // Test AI provider initialization
      const { getAIProvider } = await import('./utils/ai.js');
      const provider = await getAIProvider();
      console.log(`✅ AI provider (${provider.name}) initialized`);
      
      // List available tools
      console.log('\n📦 Available tools:');
      console.log('   - generate_spec: Generate technical specifications');
      console.log('   - review_spec: Review specifications for completeness');
      console.log('   - review_code: Review code changes');
      console.log('   - run_tests: Run project tests');
      console.log('   - run_linter: Run project linter');
      console.log('   - notify: Audio notifications (macOS only)');
      console.log('   - music: Control Spotify playback (macOS only)');
      console.log('   - memory: Temporary key-value storage (in-memory)');
      
      console.log('\n✨ All systems operational!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    }
  }
  
  // Normal server mode
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Reviewer MCP service started');
}

main().catch((error: unknown) => {
  console.error('Fatal error:', error);
  process.exit(1);
});