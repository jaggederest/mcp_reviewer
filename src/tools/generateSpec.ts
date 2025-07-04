import { SpecGenerationOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseAITool } from './ai-base.js';

class GenerateSpecTool extends BaseAITool<SpecGenerationOptions> {
  protected getActionName(): string {
    return 'generating specification';
  }

  protected getSystemPrompt(args: SpecGenerationOptions): string {
    const { format = 'markdown' } = args;
    return `You are a technical specification writer. Generate detailed, clear, and actionable specifications based on the requirements provided. 
${format === 'structured' ? 'Output in a structured format with clear sections, requirements, and acceptance criteria.' : 'Output in clean markdown format.'}
Focus on:
- Clear objectives and goals
- Detailed requirements (functional and non-functional)
- Technical architecture and design decisions
- Implementation approach
- Success criteria and testing requirements
- Edge cases and error handling`;
  }

  protected getUserPrompt(args: SpecGenerationOptions): string {
    const { prompt, context } = args;
    return `Generate a specification for: ${prompt}${context ? `\n\nAdditional context: ${context}` : ''}`;
  }
}

const tool = new GenerateSpecTool();

export async function generateSpec(args: SpecGenerationOptions): Promise<CallToolResult> {
  return tool.execute(args);
}