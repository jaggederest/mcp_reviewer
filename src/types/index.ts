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

export interface NotificationOptions {
  message: string;
  type?: 'question' | 'alert' | 'confirmation' | 'info';
  voice?: string;
  rate?: number;
}

export interface MusicOptions {
  action: 'play' | 'pause' | 'playpause' | 'next' | 'previous' | 'volume' | 'mute' | 'info';
  uri?: string;  // Spotify URI or search term
  volume?: number;  // 0-100
  mood?: 'focus' | 'relax' | 'energize' | 'chill' | 'work';
}

// Re-export the CallToolResult type from MCP SDK for convenience
export type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';