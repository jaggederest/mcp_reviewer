import { TestRunnerOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { loadProjectConfig } from '../utils/config.js';
import { BaseExecTool } from './exec-base.js';

class RunTestsTool extends BaseExecTool<TestRunnerOptions> {
  protected getActionName(): string {
    return 'Test';
  }

  protected async buildCommand(args: TestRunnerOptions): Promise<string> {
    const { pattern } = args;
    const config = await loadProjectConfig();
    
    // If no pattern specified, run tests with coverage
    if (!pattern) {
      return 'npm run test:coverage';
    }
    
    // Otherwise run the configured test command with the pattern
    const command = config.testCommand ?? 'npm test';
    return `${command} ${pattern}`;
  }
}

const tool = new RunTestsTool();

export async function runTests(args: TestRunnerOptions): Promise<CallToolResult> {
  return tool.execute(args);
}