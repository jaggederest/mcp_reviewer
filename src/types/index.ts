export interface ProjectConfig {
  testCommand?: string;
  lintCommand?: string;
  buildCommand?: string;
  openaiModel?: string;
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
  testCommand?: string;
  pattern?: string;
  watch?: boolean;
}

export interface LinterOptions {
  lintCommand?: string;
  fix?: boolean;
  files?: string[];
}

export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}