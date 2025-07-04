import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createErrorResult, createSuccessResult } from './base.js';
import { formatExecResult } from '../utils/formatters.js';

const execAsync = promisify(exec);

export abstract class BaseExecTool<T = unknown> {
  protected abstract getActionName(): string;
  protected abstract buildCommand(args: T): Promise<string> | string;
  
  async execute(args: T): Promise<CallToolResult> {
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

      const formattedOutput = formatExecResult(output, error, exitCode, this.getActionName());
      return createSuccessResult(formattedOutput);
    } catch (error) {
      return createErrorResult(this.getActionName(), error);
    }
  }
}