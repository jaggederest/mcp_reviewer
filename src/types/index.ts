export interface ProjectConfig {
  testCommand?: string;
  lintCommand?: string;
  openaiModel?: string;
  aiProvider?: 'openai' | 'ollama';
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

export interface SpecGenerationOptions {
  prompt: string;
  context?: string;
  format?: 'markdown' | 'structured';
}

export interface SpecReviewOptions {
  spec: string;
  focusAreas?: string[];
}

export interface CodeReviewOptions {
  diff: string;
  context?: string;
  reviewType?: 'security' | 'performance' | 'style' | 'logic' | 'all';
}

export interface TestRunnerOptions {
  pattern?: string;
}

export interface LinterOptions {
  fix?: boolean;
  files?: string[];
}

// Re-export the CallToolResult type from MCP SDK for convenience
export type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';