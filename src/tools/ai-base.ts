import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { callAI } from '../utils/ai.js';
import { createErrorResult, createSuccessResult } from './base.js';

export abstract class BaseAITool<T = unknown> {
  protected abstract getSystemPrompt(args: T): string;
  protected abstract getUserPrompt(args: T): string;
  protected abstract getActionName(): string;
  
  async execute(args: T): Promise<CallToolResult> {
    try {
      const systemPrompt = this.getSystemPrompt(args);
      const userPrompt = this.getUserPrompt(args);
      
      const response = await callAI(systemPrompt, userPrompt);
      return createSuccessResult(response);
    } catch (error) {
      return createErrorResult(this.getActionName(), error);
    }
  }
}