import { SpecGenerationOptions, ToolResult } from '../types/index.js';
import { callOpenAI } from '../utils/openai.js';

export async function generateSpec(args: SpecGenerationOptions): Promise<ToolResult> {
  const { prompt, context, format = 'markdown' } = args;
  
  const systemPrompt = `You are a technical specification writer. Generate detailed, clear, and actionable specifications based on the requirements provided. 
${format === 'structured' ? 'Output in a structured format with clear sections, requirements, and acceptance criteria.' : 'Output in clean markdown format.'}
Focus on:
- Clear objectives and goals
- Detailed requirements (functional and non-functional)
- Technical architecture and design decisions
- Implementation approach
- Success criteria and testing requirements
- Edge cases and error handling`;

  const userPrompt = `Generate a specification for: ${prompt}${context ? `\n\nAdditional context: ${context}` : ''}`;
  
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
        text: `Error generating specification: ${errorMessage}`,
      }],
    };
  }
}