export interface MusicPlaylist {
  uri: string;  // Spotify URI or search term
  name: string;
  description?: string;
}

export interface MusicConfig {
  playlists?: {
    focus?: MusicPlaylist;
    relax?: MusicPlaylist;
    energize?: MusicPlaylist;
    chill?: MusicPlaylist;
    work?: MusicPlaylist;
    [key: string]: MusicPlaylist | undefined;  // Allow custom moods
  };
  defaultMood?: string;
  safeVolume?: number;  // Default: 70
  volumeIncrement?: number;  // Default: 20
  shuffle?: boolean;
  repeat?: boolean;
}

export interface ProjectConfig {
  testCommand?: string;
  lintCommand?: string;
  openaiModel?: string;
  aiProvider?: 'openai' | 'ollama';
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  music?: MusicConfig;
}

export interface SpecGenerationOptions {
  prompt: string;
  context?: string;
  format?: 'markdown' | 'structured';
}

export interface SpecReviewOptions {
  spec: string;
  focusAreas?: string[];
  projectContext?: string; // e.g., "MVP", "learning project", "production API"
}

export interface CodeReviewOptions {
  diff: string;
  context?: string;
}

export interface TestRunnerOptions {
  pattern?: string;
}

export interface LinterOptions {
  fix?: boolean;
  files?: string[];
}

export interface NotificationOptions {
  message: string;
  type?: 'question' | 'alert' | 'confirmation' | 'info';
  voice?: string;
  rate?: number;
}

export interface MusicOptions {
  action: 'play' | 'pause' | 'playpause' | 'next' | 'previous' | 'volume' | 'mute' | 'info';
  uri?: string;  // Spotify URI or search term
  volume?: number;  // 0-100
  mood?: string;  // Allow custom moods from config
}

export interface MemoryOptions {
  action: 'set' | 'get' | 'list' | 'delete' | 'search' | 'clear';
  key?: string;
  value?: string;
  tags?: string[];
  pattern?: string;  // for search
  persist?: boolean; // for set action - saves to disk
}

// Re-export the CallToolResult type from MCP SDK for convenience
export type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';