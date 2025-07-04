export interface FormatSection {
  title: string;
  content: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export function formatSections(sections: FormatSection[]): string {
  return sections
    .map(section => {
      const header = `=== ${section.title} ===`;
      const separator = '='.repeat(header.length);
      return `${separator}\n${header}\n${separator}\n\n${section.content}`;
    })
    .join('\n\n');
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
  const sections: FormatSection[] = [];

  if (output.trim()) {
    sections.push({
      title: 'Output',
      content: output.trim(),
    });
  }

  if (error?.trim()) {
    sections.push({
      title: 'Errors',
      content: error.trim(),
      type: 'error',
    });
  }

  sections.push({
    title: 'Status',
    content: formatStatus(
      exitCode,
      `${actionName} completed successfully`,
      `${actionName} failed with exit code ${exitCode}`
    ),
    type: exitCode === 0 ? 'success' : 'error',
  });

  return formatSections(sections);
}