import { SpecReviewOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseAITool } from './ai-base.js';

class ReviewSpecTool extends BaseAITool<SpecReviewOptions> {
  protected getActionName(): string {
    return 'reviewing specification';
  }

  protected getSystemPrompt(args: SpecReviewOptions): string {
    const { focusAreas = [] } = args;
    return `You are a critical technical reviewer specializing in specification analysis. Review the provided specification and provide constructive, critical feedback.
Focus on:
- Completeness and clarity of requirements
- Technical feasibility and architectural soundness
- Missing edge cases or error scenarios
- Ambiguities that could lead to implementation issues
- Security and performance considerations
- Testability and success criteria clarity
${focusAreas.length > 0 ? `\nPay special attention to these areas: ${focusAreas.join(', ')}` : ''}

Be direct and specific in your feedback. Point out both strengths and weaknesses.`;
  }

  protected getUserPrompt(args: SpecReviewOptions): string {
    const { spec } = args;
    return `Review this specification:\n\n${spec}`;
  }
}

const tool = new ReviewSpecTool();

export async function reviewSpec(args: SpecReviewOptions): Promise<CallToolResult> {
  return tool.execute(args);
}