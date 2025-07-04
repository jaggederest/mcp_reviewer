import { SpecReviewOptions, ToolResult } from '../types/index.js';
import { callOpenAI } from '../utils/openai.js';

export async function reviewSpec(args: SpecReviewOptions): Promise<ToolResult> {
  const { spec, focusAreas = [] } = args;
  
  const systemPrompt = `You are a critical technical reviewer specializing in specification analysis. Review the provided specification and provide constructive, critical feedback.
Focus on:
- Completeness and clarity of requirements
- Technical feasibility and architectural soundness
- Missing edge cases or error scenarios
- Ambiguities that could lead to implementation issues
- Security and performance considerations
- Testability and success criteria clarity
${focusAreas.length > 0 ? `\nPay special attention to these areas: ${focusAreas.join(', ')}` : ''}

Be direct and specific in your feedback. Point out both strengths and weaknesses.`;

  const userPrompt = `Review this specification:\n\n${spec}`;
  
  try {
    const result = await callOpenAI(systemPrompt, userPrompt);
    
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
        text: `Error reviewing specification: ${errorMessage}`,
      }],
    };
  }
}