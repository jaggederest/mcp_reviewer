import { describe, it, expect } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Server Integration', () => {
  it('should connect to server and list tools', async () => {
    // Create client with stdio transport that spawns our server
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/index.ts'],
      env: {
        ...process.env,
        // Set a dummy API key to prevent the server from failing
        OPENAI_API_KEY: 'test-key-for-integration-tests',
      },
    });

    const client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    try {
      await client.connect(transport);
      
      // List available tools
      const result = await client.listTools();
      
      expect(result.tools).toHaveLength(5);
      const toolNames = result.tools.map(tool => tool.name);
      expect(toolNames).toContain('generate_spec');
      expect(toolNames).toContain('review_spec');
      expect(toolNames).toContain('review_code');
      expect(toolNames).toContain('run_tests');
      expect(toolNames).toContain('run_linter');
      
      // Check that tools have proper schemas
      const runTestsTool = result.tools.find(t => t.name === 'run_tests');
      expect(runTestsTool).toBeDefined();
      expect(runTestsTool?.inputSchema).toBeDefined();
      expect(runTestsTool?.description).toBe('Run standardized tests for the project');
    } finally {
      await client.close();
    }
  }, 15000); // 15 second timeout

  it('should execute run_tests tool with echo command', async () => {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/index.ts'],
      env: {
        ...process.env,
        OPENAI_API_KEY: 'test-key-for-integration-tests',
      },
    });

    const client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    try {
      await client.connect(transport);
      
      // Call the run_tests tool with a simple echo command
      const result = await client.callTool({
        name: 'run_tests',
        arguments: {
          testCommand: 'echo "Hello from integration test"',
        },
      });

      // Validate the result matches the schema
      const parsed = CallToolResultSchema.parse(result);
      expect(parsed.content).toBeDefined();
      expect(parsed.content.length).toBeGreaterThan(0);
      
      const textContent = parsed.content[0];
      expect(textContent.type).toBe('text');
      if (textContent.type === 'text') {
        expect(textContent.text).toContain('Hello from integration test');
        expect(textContent.text).toContain('Test Results:');
        expect(textContent.text).toContain('PASSED');
      }
    } finally {
      await client.close();
    }
  }, 15000);

  it('should execute run_linter tool with echo command', async () => {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/index.ts'],
      env: {
        ...process.env,
        OPENAI_API_KEY: 'test-key-for-integration-tests',
      },
    });

    const client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    try {
      await client.connect(transport);
      
      // Call the run_linter tool
      const result = await client.callTool({
        name: 'run_linter',
        arguments: {
          lintCommand: 'echo "0 errors, 0 warnings"',
        },
      });

      const parsed = CallToolResultSchema.parse(result);
      expect(parsed.content).toBeDefined();
      
      const textContent = parsed.content[0];
      expect(textContent.type).toBe('text');
      if (textContent.type === 'text') {
        expect(textContent.text).toContain('0 errors, 0 warnings');
        expect(textContent.text).toContain('Lint Results:');
      }
    } finally {
      await client.close();
    }
  }, 15000);
});