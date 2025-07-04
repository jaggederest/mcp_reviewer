import { NotificationOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseExecTool } from './exec-base.js';
import { createSuccessResult } from './base.js';
import { platform } from 'os';
import { isSpotifyPlaying, pauseSpotify, resumeSpotify } from './music.js';

class NotifyTool extends BaseExecTool<NotificationOptions> {
  protected getActionName(): string {
    return 'Notify';
  }

  protected buildCommand(args: NotificationOptions): string {
    const { message, type = 'info', voice, rate } = args;
    
    // Only support macOS say command for now
    if (platform() !== 'darwin') {
      // For non-macOS, we'll just log to console and return empty command
      console.log(`[${type.toUpperCase()}] ${message}`);
      return 'echo "Notification sent to console"';
    }
    
    // Build the say command with options
    const parts = ['say'];
    
    // Add voice option if specified
    if (voice) {
      parts.push('-v', voice);
    }
    
    // Add rate option if specified (words per minute)
    if (rate) {
      parts.push('-r', rate.toString());
    }
    
    // Add prefix based on notification type
    let prefix = '';
    switch (type) {
      case 'question':
        prefix = 'Question: ';
        break;
      case 'alert':
        prefix = 'Alert! ';
        break;
      case 'confirmation':
        prefix = 'Please confirm: ';
        break;
      case 'info':
      default:
        prefix = '';
    }
    
    // Add the message with proper escaping
    const fullMessage = prefix + message;
    parts.push(`"${fullMessage.replace(/"/g, '\\"')}"`);
    
    return parts.join(' ');
  }
  
  async execute(args: NotificationOptions): Promise<CallToolResult> {
    // For non-macOS platforms, handle differently
    if (platform() !== 'darwin') {
      const { message, type = 'info' } = args;
      console.log(`[${type.toUpperCase()}] ${message}`);
      return createSuccessResult('Notification displayed in console (audio not available on this platform)');
    }
    
    // Check if Spotify is playing and pause it
    const wasPlaying = await isSpotifyPlaying();
    if (wasPlaying) {
      await pauseSpotify();
    }
    
    // Execute the notification
    const result = await super.execute(args);
    
    // Resume Spotify if it was playing
    if (wasPlaying) {
      // Add a small delay to ensure the notification finishes speaking
      await new Promise(resolve => setTimeout(resolve, 1500));
      await resumeSpotify();
    }
    
    return result;
  }
}

const tool = new NotifyTool();
export const notify = (args: NotificationOptions): Promise<CallToolResult> => tool.execute(args);