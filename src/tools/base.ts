import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export function createErrorResult(action: string, error: unknown): CallToolResult {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return {
    content: [{
      type: 'text',
      text: `Error ${action}: ${errorMessage}`,
    }],
  };
}

export function createSuccessResult(text: string): CallToolResult {
  return {
    content: [{
      type: 'text',
      text,
    }],
  };
}