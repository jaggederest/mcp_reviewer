import { CodeReviewOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseAITool } from './ai-base.js';

class ReviewCodeTool extends BaseAITool<CodeReviewOptions> {
  private readonly reviewFocus = {
    security: 'Security vulnerabilities, input validation, authentication/authorization issues, data exposure risks',
    performance: 'Performance bottlenecks, inefficient algorithms, memory leaks, unnecessary computations',
    style: 'Code style consistency, naming conventions, code organization, readability',
    logic: 'Business logic errors, edge cases, error handling, correctness of implementation',
    all: 'All aspects including security, performance, code style, and logic',
  };

  protected getActionName(): string {
    return 'reviewing code';
  }

  protected getSystemPrompt(args: CodeReviewOptions): string {
    const { reviewType = 'all' } = args;
    return `You are an expert code reviewer. Review the provided code changes critically and provide actionable feedback.
Focus on: ${this.reviewFocus[reviewType]}

Provide:
- Specific line-by-line feedback where issues are found
- Severity level for each issue (critical, major, minor)
- Concrete suggestions for improvement
- Recognition of good practices when present

Be constructive but thorough in identifying potential issues.`;
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