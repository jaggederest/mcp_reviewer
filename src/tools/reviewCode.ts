import { CodeReviewOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { callAI } from '../utils/ai.js';

export async function reviewCode(args: CodeReviewOptions): Promise<CallToolResult> {
  const { diff, context, reviewType = 'all' } = args;
  
  const reviewFocus = {
    security: 'Security vulnerabilities, input validation, authentication/authorization issues, data exposure risks',
    performance: 'Performance bottlenecks, inefficient algorithms, memory leaks, unnecessary computations',
    style: 'Code style consistency, naming conventions, code organization, readability',
    logic: 'Business logic errors, edge cases, error handling, correctness of implementation',
    all: 'All aspects including security, performance, code style, and logic',
  };
  
  const systemPrompt = `You are an expert code reviewer. Review the provided code changes critically and provide actionable feedback.
Focus on: ${reviewFocus[reviewType]}

Provide:
- Specific line-by-line feedback where issues are found
- Severity level for each issue (critical, major, minor)
- Concrete suggestions for improvement
- Recognition of good practices when present

Be constructive but thorough in identifying potential issues.`;

  const userPrompt = `Review these code changes:\n\n${diff}${context ? `\n\nContext: ${context}` : ''}`;
  
  try {
    const result = await callAI(systemPrompt, userPrompt);
    
    return {
      content: [{
        type: 'text',
        text: result,
      }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{
        type: 'text',
        text: `Error reviewing code: ${errorMessage}`,
      }],
    };
  }
}