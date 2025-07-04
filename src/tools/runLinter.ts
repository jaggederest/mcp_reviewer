import { LinterOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { loadProjectConfig } from '../utils/config.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runLinter(args: LinterOptions): Promise<CallToolResult> {
  const { lintCommand, fix = false, files = [] } = args;
  const config = await loadProjectConfig();
  
  const command = lintCommand ?? config.lintCommand ?? 'npm run lint';
  const fullCommand = buildLintCommand(command, fix, files);
  
  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    
    const output = formatLintOutput(stdout, stderr, true);
    
    return {
      content: [{
        type: 'text',
        text: output,
      }],
    };
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; message: string };
    const output = formatLintOutput(
      execError.stdout ?? '',
      execError.stderr ?? execError.message,
      false
    );
    
    return {
      content: [{
        type: 'text',
        text: output,
      }],
    };
  }
}

function buildLintCommand(baseCommand: string, fix: boolean, files: string[]): string {
  const parts = [baseCommand];
  
  if (fix && !baseCommand.includes('--fix')) {
    parts.push('--fix');
  }
  
  if (files.length > 0) {
    parts.push(...files);
  }
  
  return parts.join(' ');
}

function formatLintOutput(stdout: string, stderr: string, success: boolean): string {
  const status = success ? '✅ PASSED' : '⚠️  ISSUES FOUND';
  const sections: string[] = [`## Lint Results: ${status}\n`];
  
  if (stdout.trim()) {
    sections.push('### Output\n```\n' + stdout.trim() + '\n```\n');
  }
  
  if (stderr.trim() && !success) {
    sections.push('### Errors\n```\n' + stderr.trim() + '\n```\n');
  }
  
  // Parse common lint output patterns
  const errorPattern = /(\d+) error/;
  const warningPattern = /(\d+) warning/;
  const errorMatch = errorPattern.exec(stdout);
  const warningMatch = warningPattern.exec(stdout);
  
  if (errorMatch || warningMatch) {
    const summary: string[] = ['### Summary'];
    if (errorMatch) {
      summary.push(`- ${errorMatch[1]} error(s)`);
    }
    if (warningMatch) {
      summary.push(`- ${warningMatch[1]} warning(s)`);
    }
    sections.push(summary.join('\n') + '\n');
  }
  
  if (!success) {
    sections.push('### Next Steps\n- Review the issues above\n- Fix critical errors first\n- Run with --fix flag to auto-fix some issues\n');
  }
  
  return sections.join('\n');
}