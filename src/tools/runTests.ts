import { TestRunnerOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { loadProjectConfig } from '../utils/config.js';
import { BaseExecTool } from './exec-base.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createErrorResult, createSuccessResult } from './base.js';
import { formatExecOutput, formatExecOutputFull } from '../utils/formatters.js';

const execAsync = promisify(exec);

class RunTestsTool extends BaseExecTool<TestRunnerOptions> {
  private isCoverageMode = false;

  protected getActionName(): string {
    return 'Test';
  }

  protected async buildCommand(args: TestRunnerOptions): Promise<string> {
    const { pattern } = args;
    const config = await loadProjectConfig();
    
    // Track if we're in coverage mode
    this.isCoverageMode = !pattern;
    
    // If no pattern specified, run tests with coverage
    if (!pattern) {
      return 'npm run test:coverage';
    }
    
    // Otherwise run the configured test command with the pattern
    const command = config.testCommand ?? 'npm test';
    return `${command} ${pattern}`;
  }

  // Override execute to control output formatting based on coverage mode
  async execute(args: TestRunnerOptions): Promise<CallToolResult> {
    try {
      const command = await this.buildCommand(args);
      
      let output = '';
      let error = '';
      let exitCode = 0;

      try {
        const result = await execAsync(command, { 
          cwd: process.cwd(),
          env: process.env,
          maxBuffer: 1024 * 1024 * 10,
        });
        output = result.stdout;
        error = result.stderr;
      } catch (execError) {
        const err = execError as { stdout?: string; stderr?: string; message?: string; code?: number };
        output = err.stdout ?? '';
        error = err.stderr ?? err.message ?? 'Unknown error';
        exitCode = err.code ?? 1;
      }

      // Choose formatter based on coverage mode AND exit code
      const formattedOutput = (this.isCoverageMode || exitCode !== 0)
        ? formatExecOutputFull(output, error, exitCode, this.getActionName())
        : formatExecOutput(output, error, exitCode, this.getActionName());
        
      return createSuccessResult(formattedOutput);
    } catch (error) {
      return createErrorResult(this.getActionName(), error);
    }
  }
}

const tool = new RunTestsTool();

export async function runTests(args: TestRunnerOptions): Promise<CallToolResult> {
  return tool.execute(args);
}