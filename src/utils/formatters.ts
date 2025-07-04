export interface FormatSection {
  title: string;
  content: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

// Strip ANSI escape codes for safety
// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;
const MAX_OUTPUT_SIZE = 100 * 1024; // 100KB limit

// Helper to safely truncate large outputs
function truncateOutput(text: string, maxSize: number = MAX_OUTPUT_SIZE): string {
  if (text.length <= maxSize) {
    return text;
  }
  
  const half = Math.floor(maxSize / 2);
  const start = text.substring(0, half);
  const end = text.substring(text.length - half);
  const truncatedBytes = text.length - maxSize;
  
  return `${start}\n\n[... truncated ${truncatedBytes} bytes ...]\n\n${end}`;
}

export function formatSections(sections: FormatSection[]): string {
  return sections
    .map(section => {
      const emoji = section.type === 'error' ? '❌' : 
                    section.type === 'success' ? '✅' :
                    section.type === 'warning' ? '⚠️' : 
                    section.type === 'info' ? 'ℹ️' : '📋';
      return `${emoji} ${section.title}: ${section.content.replace(/\n/g, ' ')}`;
    })
    .join(' | ');
}

export function formatStatus(exitCode: number, successMessage: string, failureMessage: string): string {
  return exitCode === 0 
    ? `✅ PASSED: ${successMessage}`
    : `❌ FAILED: ${failureMessage}`;
}

export function formatExecOutput(
  output: string,
  error: string | undefined,
  exitCode: number,
  actionName: string
): string {
  const parts: string[] = [];
  
  if (exitCode === 0) {
    parts.push(`✅ ${actionName}: Success`);
    if (output.trim()) {
      // Take first line or first 80 chars of output
      const firstLine = output.trim().split('\n')[0];
      const truncated = firstLine.length > 80 ? firstLine.substring(0, 77) + '...' : firstLine;
      parts.push(truncated);
    }
  } else {
    parts.push(`❌ ${actionName}: Failed (exit ${exitCode})`);
    if (error?.trim()) {
      const firstLine = error.trim().split('\n')[0];
      const truncated = firstLine.length > 80 ? firstLine.substring(0, 77) + '...' : firstLine;
      parts.push(truncated);
    }
  }
  
  return parts.join(' | ');
}

// New formatter for full output (only used for failures)
export function formatExecOutputFull(
  output: string,
  error: string | undefined,
  exitCode: number,
  actionName: string
): string {
  const parts: string[] = [];
  parts.push(`❌ ${actionName}: Failed (exit ${exitCode})`);
  
  // Get full output, preferring stderr over stdout
  const errorOutput = error ?? '';
  const stdOutput = output || '';
  let fullOutput = errorOutput.trim() || stdOutput.trim();
  
  // Strip ANSI codes for safety
  fullOutput = fullOutput.replace(ANSI_REGEX, '');
  
  // Truncate if too large
  fullOutput = truncateOutput(fullOutput);
  
  if (fullOutput) {
    parts.push('\n\n' + fullOutput);
  }
  
  return parts.join('');
}

// Smart formatter selector - centralizes the decision logic
export function formatExecResult(
  output: string,
  error: string | undefined,
  exitCode: number,
  actionName: string
): string {
  // Use full output for failures, truncated for success
  return exitCode === 0
    ? formatExecOutput(output, error, exitCode, actionName)
    : formatExecOutputFull(output, error, exitCode, actionName);
}