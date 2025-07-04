import { LinterOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { loadProjectConfig } from '../utils/config.js';
import { BaseExecTool } from './exec-base.js';

class RunLinterTool extends BaseExecTool<LinterOptions> {
  protected getActionName(): string {
    return 'Lint';
  }

  protected async buildCommand(args: LinterOptions): Promise<string> {
    const { fix = false, files = [] } = args;
    const config = await loadProjectConfig();
    
    const command = config.lintCommand ?? 'npm run lint';
    const parts = [command];
    
    if (fix && !command.includes('--fix')) {
      parts.push('--fix');
    }
    
    if (files.length > 0) {
      parts.push(...files);
    }
    
    return parts.join(' ');
  }
}

const tool = new RunLinterTool();

export async function runLinter(args: LinterOptions): Promise<CallToolResult> {
  return tool.execute(args);
}