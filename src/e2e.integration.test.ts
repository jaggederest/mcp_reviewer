import { describe, it, expect, beforeAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * End-to-end integration test that demonstrates the full MCP workflow
 * using a real Ollama instance. This test exercises all tools in sequence
 * to validate the complete happy path.
 */

async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/version');
    return response.ok;
  } catch {
    return false;
  }
}

async function checkOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {return [];}
    const data = await response.json() as { models?: { name: string }[] };
    return data.models?.map(m => m.name) ?? [];
  } catch {
    return [];
  }
}

describe('End-to-End MCP Workflow with Ollama', () => {
  beforeAll(async () => {
    const ollamaAvailable = await checkOllamaConnection();
    if (!ollamaAvailable) {
      console.warn('⚠️  Ollama not available at http://localhost:11434');
      console.warn('   Skipping e2e test. To run this test:');
      console.warn('   1. Install Ollama: https://ollama.ai');
      console.warn('   2. Start Ollama');
      console.warn('   3. Pull a model: ollama pull llama2 (or codellama)');
      return;
    }

    const models = await checkOllamaModels();
    if (models.length === 0) {
      console.warn('⚠️  No Ollama models found');
      console.warn('   Skipping e2e test. To run this test:');
      console.warn('   Pull a model: ollama pull llama2 (or codellama)');
      console.warn('   Available models will be listed with: curl http://localhost:11434/api/tags');
      return;
    }
    console.log(`✓ Ollama available with models: ${models.join(', ')}`);
  });

  it('should complete full workflow: spec -> review -> code -> review -> lint -> test', async () => {
    // Check Ollama again in the test
    const ollamaAvailable = await checkOllamaConnection();
    if (!ollamaAvailable) {
      console.log('Skipping test - Ollama not available');
      return;
    }

    const models = await checkOllamaModels();
    if (models.length === 0) {
      console.log('Skipping test - No Ollama models available');
      return;
    }

    // Use TinyLlama if available, otherwise use the first available model
    const modelToUse = models.find(m => m.includes('tinyllama')) ?? 
                      models.find(m => m.includes('llama2') || m.includes('codellama')) ?? 
                      models[0];

    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'src/index.ts'],
      env: {
        ...process.env,
        AI_PROVIDER: 'ollama',
        OLLAMA_MODEL: modelToUse,
        OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
      },
    });

    console.log(`Using Ollama model: ${modelToUse}`);

    const client = new Client(
      {
        name: 'e2e-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    try {
      await client.connect(transport);
      console.log('✓ Connected to MCP server with Ollama provider');

      // Step 1: Generate a specification
      console.log('\n1. Generating specification...');
      const specResult = await client.callTool({
        name: 'generate_spec',
        arguments: {
          prompt: 'Create a simple Hello World CLI application in JavaScript',
          context: 'Should accept a name parameter and greet the user. Keep it simple and concise.',
          format: 'markdown',
        },
      });

      const specParsed = CallToolResultSchema.parse(specResult);
      expect(specParsed.content).toBeDefined();
      expect(specParsed.content.length).toBeGreaterThan(0);
      
      const specContent = specParsed.content[0];
      expect(specContent.type).toBe('text');
      const originalSpec = specContent.type === 'text' ? specContent.text : '';
      expect(originalSpec).toContain('Hello World');
      console.log('✓ Specification generated successfully');

      // Step 2: Modify and review the specification
      console.log('\n2. Reviewing specification...');
      const modifiedSpec = originalSpec + '\n\n## Additional Requirements\n- Must handle missing name parameter gracefully\n- Should include a help message when called with --help';
      
      const reviewResult = await client.callTool({
        name: 'review_spec',
        arguments: {
          spec: modifiedSpec,
          focusAreas: ['completeness', 'technical feasibility', 'clarity'],
        },
      });

      const reviewParsed = CallToolResultSchema.parse(reviewResult);
      expect(reviewParsed.content).toBeDefined();
      const reviewContent = reviewParsed.content[0];
      expect(reviewContent.type).toBe('text');
      console.log('✓ Specification reviewed successfully');

      // Step 3: Create code based on the specification
      console.log('\n3. Creating code implementation...');
      const helloWorldCode = `#!/usr/bin/env node

// Simple Hello World CLI Application
const args = process.argv.slice(2);

// Handle help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: hello [name]');
  console.log('  name  The name to greet (default: World)');
  console.log('\\nOptions:');
  console.log('  --help, -h  Show this help message');
  process.exit(0);
}

// Get the name parameter or use default
const name = args[0] || 'World';

// Greet the user
console.log(\`Hello, \${name}!\`);
`;

      // Step 4: Review the code
      console.log('\n4. Reviewing code implementation...');
      const codeReviewResult = await client.callTool({
        name: 'review_code',
        arguments: {
          diff: helloWorldCode,
          context: 'New Hello World CLI implementation based on the specification',
          reviewType: 'all',
        },
      });

      const codeReviewParsed = CallToolResultSchema.parse(codeReviewResult);
      expect(codeReviewParsed.content).toBeDefined();
      console.log('✓ Code reviewed successfully');

      // Step 5: Run linter (using echo as a mock linter)
      console.log('\n5. Running linter...');
      const lintResult = await client.callTool({
        name: 'run_linter',
        arguments: {
          lintCommand: 'echo "Checking hello.js...\\n✓ No linting errors found\\n0 errors, 0 warnings"',
        },
      });

      const lintParsed = CallToolResultSchema.parse(lintResult);
      expect(lintParsed.content).toBeDefined();
      const lintContent = lintParsed.content[0];
      if (lintContent.type === 'text') {
        expect(lintContent.text).toContain('0 errors');
        expect(lintContent.text).toContain('PASSED');
      }
      console.log('✓ Linting completed successfully');

      // Step 6: Run tests (using node to execute a simple test)
      console.log('\n6. Running tests...');
      const testResult = await client.callTool({
        name: 'run_tests',
        arguments: {
          testCommand: 'node -e "console.log(\'Running tests...\\n✓ hello command exists\\n✓ handles --help flag\\n✓ greets with custom name\\n✓ uses default name when none provided\\n\\nAll tests passed!\')"',
        },
      });

      const testParsed = CallToolResultSchema.parse(testResult);
      expect(testParsed.content).toBeDefined();
      const testContent = testParsed.content[0];
      if (testContent.type === 'text') {
        expect(testContent.text).toContain('All tests passed');
        expect(testContent.text).toContain('PASSED');
      }
      console.log('✓ Tests completed successfully');

      console.log('\n✅ Full workflow completed successfully!');
      console.log('   - Generated specification using Ollama');
      console.log('   - Reviewed specification for completeness');
      console.log('   - Created code implementation');
      console.log('   - Reviewed code for quality');
      console.log('   - Ran linter with no errors');
      console.log('   - Executed tests successfully');

    } finally {
      await client.close();
    }
  }, 120000); // 120 second timeout for Ollama operations
});