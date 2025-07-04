import { TestRunnerOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { loadProjectConfig } from '../utils/config.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runTests(args: TestRunnerOptions): Promise<CallToolResult> {
  const { testCommand, pattern, watch = false } = args;
  const config = await loadProjectConfig();
  
  const command = testCommand ?? config.testCommand ?? 'npm test';
  const fullCommand = buildTestCommand(command, pattern, watch);
  
  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      env: { ...process.env, CI: 'true' },
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    
    const output = formatTestOutput(stdout, stderr);
    
    return {
      content: [{
        type: 'text',
        text: output,
      }],
    };
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; message: string };
    const output = formatTestOutput(
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

function buildTestCommand(baseCommand: string, pattern?: string, watch?: boolean): string {
  const parts = [baseCommand];
  
  if (pattern) {
    parts.push(pattern);
  }
  
  if (watch) {
    parts.push('--watch');
  }
  
  return parts.join(' ');
}

function formatTestOutput(stdout: string, stderr: string, success = true): string {
  const status = success ? '✅ PASSED' : '❌ FAILED';
  const sections: string[] = [`## Test Results: ${status}\n`];
  
  if (stdout.trim()) {
    sections.push('### Output\n```\n' + stdout.trim() + '\n```\n');
  }
  
  if (stderr.trim()) {
    sections.push('### Errors\n```\n' + stderr.trim() + '\n```\n');
  }
  
  // Extract test summary if available
  const summaryMatch = stdout.match(/(\d+) (passing|passed)|(\d+) (failing|failed)|(\d+) (pending|skipped)/gi);
  if (summaryMatch) {
    sections.push('### Summary\n' + summaryMatch.join(', ') + '\n');
  }
  
  return sections.join('\n');
}