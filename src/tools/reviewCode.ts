import { CodeReviewOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseAITool } from './ai-base.js';

class ReviewCodeTool extends BaseAITool<CodeReviewOptions> {
  protected getActionName(): string {
    return 'reviewing code';
  }

  protected getSystemPrompt(_args: CodeReviewOptions): string {
    return `You are an expert code reviewer providing comprehensive, pragmatic feedback.

Review the code changes and provide feedback organized by priority:

P0 (Critical - Must Fix):
- Bugs that will cause runtime errors or incorrect behavior
- Security vulnerabilities (SQL injection, XSS, auth bypass, etc.)
- Data loss or corruption risks
- Breaking changes to public APIs

P1 (Important - Should Fix):
- Performance problems (O(n²) algorithms, memory leaks, inefficient queries)
- Poor error handling that could impact users
- Code that is difficult to maintain or understand
- Missing critical tests for core functionality

P2 (Recommended - Nice to Have):
- Code style and convention improvements
- Opportunities for better abstraction or DRY
- Minor performance optimizations
- Additional test coverage for edge cases

For each issue:
- Specify the exact line or section
- Explain why it's a problem
- Provide a concrete fix or improvement suggestion

Also acknowledge good patterns and practices when you see them.
Keep feedback actionable and focused on real improvements, not nitpicks.`;
  }

  protected getUserPrompt(args: CodeReviewOptions): string {
    const { diff, context } = args;
    return `Review these code changes:\n\n${diff}${context ? `\n\nContext: ${context}` : ''}`;
  }
}

const tool = new ReviewCodeTool();

export async function reviewCode(args: CodeReviewOptions): Promise<CallToolResult> {
  return tool.execute(args);
}