export interface FormatSection {
  title: string;
  content: string;
  type?: 'success' | 'error' | 'warning' | 'info';
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