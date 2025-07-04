import { SpecReviewOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseAITool } from './ai-base.js';

class ReviewSpecTool extends BaseAITool<SpecReviewOptions> {
  protected getActionName(): string {
    return 'reviewing specification';
  }

  protected getSystemPrompt(args: SpecReviewOptions): string {
    const { focusAreas = [], projectContext } = args;
    
    // Basic sanitization for focus areas
    const sanitizedAreas = focusAreas
      .slice(0, 10) // Limit to 10 areas
      .map(area => area.slice(0, 100)); // Limit each area to 100 chars
    
    let prompt = `You are a pragmatic technical reviewer who balances thoroughness with practicality. Review the provided specification with these principles:

REVIEW APPROACH:
- Start by understanding the project's scope and context
- Prioritize simplicity and clarity over enterprise-scale complexity
- Consider "YAGNI" (You Aren't Gonna Need It) - avoid over-engineering
- Balance security/scalability concerns with development velocity

PRIORITIZATION:
Classify ALL feedback using this system:
- P0 (Critical): Security vulnerabilities, data loss risks, fundamental design flaws
- P1 (Important): Missing core functionality, unclear requirements, maintainability issues  
- P2 (Recommended): Performance optimizations, nice-to-have features, future-proofing
- P3 (Optional): Style preferences, advanced patterns, enterprise features

FOCUS AREAS:
- Completeness of core requirements (but challenge unnecessary complexity)
- Technical feasibility with minimal architecture
- Critical edge cases and error scenarios
- Security basics (authentication, validation, injection prevention)
- Clear success criteria and testability
- Pragmatic implementation path`;

    if (projectContext) {
      prompt += `\n\nPROJECT CONTEXT: ${projectContext.slice(0, 200)}`;
    }

    if (sanitizedAreas.length > 0) {
      prompt += `\n\nSPECIAL ATTENTION TO: ${sanitizedAreas.join(', ')}`;
    }

    prompt += `

OUTPUT FORMAT:
Structure your response with these sections:

## Summary
Brief overview (2-3 sentences)

## P0 (Critical)
- List critical issues that must be fixed

## P1 (Important)  
- List important issues to address soon

## P2 (Recommended)
- List nice-to-have improvements

## P3 (Optional)
- List optional enhancements

## Strengths
- What's done well (at least 2-3 points)

Be constructive and provide examples for critical fixes. Remember: The goal is to help ship working software, not create perfect documentation.`;

    // Ensure prompt doesn't get too long
    if (prompt.length > 3000) {
      prompt = prompt.slice(0, 2950) + '\n\n[Prompt truncated for length]';
    }

    return prompt;
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