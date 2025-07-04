import { MusicOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseExecTool } from './exec-base.js';
import { createSuccessResult, createErrorResult } from './base.js';
import { platform } from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Note: MCP tools are stateless and cannot directly prompt users for confirmation.
// Instead, we return informative errors that guide users to make explicit choices.
// For example, for unsafe volume increases, we ask users to explicitly confirm
// by re-running the command with additional parameters or adjusted values.

// Mood-based Spotify playlist URIs
const MOOD_PLAYLISTS: Record<string, { uri: string; name: string }> = {
  focus: {
    uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ',
    name: 'Deep Focus'
  },
  relax: {
    uri: 'spotify:playlist:37i9dQZF1DWU0ScTcjJBdj',
    name: 'Relax & Unwind'
  },
  energize: {
    uri: 'spotify:playlist:37i9dQZF1DX3rxVfibe1L0',
    name: 'Mood Booster'
  },
  chill: {
    uri: 'spotify:playlist:37i9dQZF1DX4WYpdgoIcn6',
    name: 'Chill Hits'
  },
  work: {
    uri: 'spotify:playlist:37i9dQZF1DWZk0frd3wbHL',
    name: 'Productive Morning'
  }
};

class MusicTool extends BaseExecTool<MusicOptions> {
  protected getActionName(): string {
    return 'Music Control';
  }

  private createSafetyErrorResult(title: string, message: string, suggestions?: string[]): CallToolResult {
    let result = `❌ SAFETY: ${title} - ${message}`;
    
    if (suggestions && suggestions.length > 0) {
      result += ` | Try: ${suggestions.join('; ')}`;
    }
    
    return createSuccessResult(result);
  }

  private async isSystemMuted(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`osascript -e 'output muted of (get volume settings)'`);
      return stdout.trim() === 'true';
    } catch {
      return false;
    }
  }

  private async getCurrentSystemVolume(): Promise<number> {
    try {
      const { stdout } = await execAsync(`osascript -e 'output volume of (get volume settings)'`);
      return parseInt(stdout.trim(), 10);
    } catch {
      return 50; // Default to middle volume if we can't get it
    }
  }

  private async isSpotifyPlaying(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`osascript -e 'tell application "Spotify" to player state as string'`);
      return stdout.trim() === 'playing';
    } catch {
      return false;
    }
  }

  private async getCurrentSpotifyVolume(): Promise<number> {
    try {
      const { stdout } = await execAsync(`osascript -e 'tell application "Spotify" to sound volume'`);
      return parseInt(stdout.trim(), 10);
    } catch {
      return 50; // Default to middle volume if we can't get it
    }
  }

  protected buildCommand(args: MusicOptions): string {
    // Only support macOS for now
    if (platform() !== 'darwin') {
      throw new Error('Music control is only available on macOS');
    }

    const { action, uri, volume, mood } = args;
    
    // Build AppleScript command based on action
    switch (action) {
      case 'play':
        if (mood) {
          // Play mood-based playlist
          const playlist = MOOD_PLAYLISTS[mood];
          return `osascript -e 'tell application "Spotify" to play track "${playlist.uri}"'`;
        } else if (uri !== undefined) {
          // Play specific URI or search
          if (uri.startsWith('spotify:')) {
            return `osascript -e 'tell application "Spotify" to play track "${uri}"'`;
          } else {
            // Search and play (this is more complex, would need search API)
            return `osascript -e 'tell application "Spotify" to play'`;
          }
        } else {
          // Just play
          return `osascript -e 'tell application "Spotify" to play'`;
        }
        
      case 'pause':
        return `osascript -e 'tell application "Spotify" to pause'`;
        
      case 'playpause':
        return `osascript -e 'tell application "Spotify" to playpause'`;
        
      case 'next':
        return `osascript -e 'tell application "Spotify" to next track'`;
        
      case 'previous':
        return `osascript -e 'tell application "Spotify" to previous track'`;
        
      case 'volume':
        if (volume !== undefined) {
          return `osascript -e 'tell application "Spotify" to set sound volume to ${Math.max(0, Math.min(100, volume))}'`;
        }
        throw new Error('Volume level required for volume action');
        
      case 'mute':
        return `osascript -e 'tell application "Spotify" to set sound volume to 0'`;
        
      case 'info':
        // Get current track info
        return `osascript -e '
          tell application "Spotify"
            if player state is playing then
              set trackName to name of current track
              set artistName to artist of current track
              set albumName to album of current track
              return "Now playing: " & trackName & " by " & artistName & " from " & albumName
            else
              return "Spotify is not playing"
            end if
          end tell'`;
        
      default:
        throw new Error(`Unknown action: ${String(action)}`);
    }
  }
  
  async execute(args: MusicOptions): Promise<CallToolResult> {
    // Check platform first
    if (platform() !== 'darwin') {
      return createErrorResult('Music Control', 'Music control is only available on macOS');
    }
    
    try {
      // Safety check: Check if system is muted
      const isMuted = await this.isSystemMuted();
      if (isMuted && args.action !== 'info') {
        return this.createSafetyErrorResult(
          '🔇 System Audio Muted',
          'System is muted',
          ['unmute first', 'use info action']
        );
      }
      
      // Check if Spotify is running
      const checkCommand = `osascript -e 'tell application "System Events" to (name of processes) contains "Spotify"'`;
      const { stdout: isRunning } = await execAsync(checkCommand);
      const spotifyRunning = isRunning.trim() === 'true';
      
      if (!spotifyRunning && args.action !== 'play') {
        return createErrorResult('Music Control', 'Spotify is not running. Please start Spotify first.');
      }
      
      // Safety check: Avoid interrupting currently playing music
      if (args.action === 'play' && spotifyRunning) {
        const isPlaying = await this.isSpotifyPlaying();
        if (isPlaying) {
          // Check if this is a generic play command or mood playlist switch
          if (args.uri === undefined || args.mood !== undefined) {
            return this.createSafetyErrorResult(
              '🎵 Already Playing',
              args.mood ? `Cannot switch to ${args.mood} playlist` : 'Cannot interrupt playback',
              ['pause first', 'specify track/artist', args.mood ? `pause then play mood ${args.mood}` : 'use next/previous']
            );
          }
        }
      }
      
      // Safety check: Volume protection
      if (args.action === 'volume' && args.volume !== undefined && spotifyRunning) {
        const currentVolume = await this.getCurrentSpotifyVolume();
        const MAX_SAFE_VOLUME = 70; // Maximum safe volume unless explicitly requested
        const GRADUAL_INCREASE_LIMIT = 20; // Maximum volume increase in one step
        
        // If trying to increase volume
        if (args.volume > currentVolume) {
          // Check if it's a significant increase
          if (args.volume > MAX_SAFE_VOLUME && currentVolume <= MAX_SAFE_VOLUME) {
            return this.createSafetyErrorResult(
              '⚠️ Volume Too High',
              `${args.volume}% exceeds safe level (${MAX_SAFE_VOLUME}%). Current: ${currentVolume}%`,
              [`try ${MAX_SAFE_VOLUME}%`, `increase by ${GRADUAL_INCREASE_LIMIT}% max`, 'use multiple steps']
            );
          }
          
          // Warn for any significant volume increase
          if (args.volume - currentVolume > GRADUAL_INCREASE_LIMIT) {
            const suggestedVolume = Math.min(currentVolume + GRADUAL_INCREASE_LIMIT, args.volume);
            return this.createSafetyErrorResult(
              '⚠️ Volume Jump Too Large', 
              `+${args.volume - currentVolume}% increase (${currentVolume}% → ${args.volume}%)`,
              [`try ${suggestedVolume}% first`, 'increase gradually', 'protect hearing']
            );
          }
        }
      }
      
      // If playing and Spotify isn't running, start it first
      if (args.action === 'play' && !spotifyRunning) {
        await execAsync(`osascript -e 'tell application "Spotify" to activate'`);
        // Give Spotify time to start
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Use the parent class execute method for the main command
      const result = await super.execute(args);
      
      // If it's info command and we got output, customize the message
      if (args.action === 'info' && result.content[0] && 'text' in result.content[0]) {
        const text = (result.content[0] as { text: string }).text;
        if (text.includes('Now playing:')) {
          return result;
        }
      }
      
      if (args.action === 'play' && args.mood) {
        const playlist = MOOD_PLAYLISTS[args.mood];
        return createSuccessResult(`Playing ${playlist.name} playlist for ${args.mood} mood`);
      } else if (args.action === 'volume' && args.volume !== undefined) {
        const newVolume = Math.min(args.volume, 100);
        return createSuccessResult(`Volume set to ${newVolume}% (hearing protection active)`);
      }
      
      return result;
    } catch (error) {
      return createErrorResult('Music Control', error);
    }
  }
}

const tool = new MusicTool();
export const music = (args: MusicOptions): Promise<CallToolResult> => tool.execute(args);