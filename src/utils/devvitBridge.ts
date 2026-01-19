// Devvit PostMessage Bridge
// Handles communication between the webview (React app) and Devvit backend

import { DevvitMessage, GameState, Cell, LeaderboardEntry } from '@/types/game';

type MessageHandler = (payload: unknown) => void;

class DevvitBridge {
  private handlers: Map<string, MessageHandler[]> = new Map();
  private isDevvitEnvironment: boolean = false;

  constructor() {
    // Check if we're running inside Devvit webview
    this.isDevvitEnvironment = window.parent !== window;

    // Listen for messages from Devvit backend
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    // Devvit wraps messages - check both formats
    let data = event.data as DevvitMessage;
    
    // Handle Devvit's wrapped message format: { type: 'devvit-message', data: { message: {...} } }
    if (event.data?.type === 'devvit-message' && event.data?.data?.message) {
      data = event.data.data.message as DevvitMessage;
    }
    
    console.log('[DevvitBridge] Received:', data);
    
    if (data && data.type) {
      const handlers = this.handlers.get(data.type) || [];
      handlers.forEach(handler => handler(data.payload));
    }
  }

  // Register a handler for a specific message type
  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  // Remove a handler
  off(type: string, handler: MessageHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Send a message to the Devvit backend
  send(message: DevvitMessage) {
    if (this.isDevvitEnvironment) {
      window.parent.postMessage(message, '*');
    } else {
      // Development mode - simulate responses
      console.log('[DevvitBridge] Would send:', message);
      this.simulateResponse(message);
    }
  }

  // Initialize the connection and request current user data
  init() {
    this.send({ type: 'INIT' });
  }

  // Join the matchmaking queue
  findMatch() {
    this.send({ type: 'FIND_MATCH' });
  }

  // Submit token/bomb placement
  submitSetup(grid: Cell[][]) {
    this.send({ 
      type: 'SUBMIT_SETUP', 
      payload: { grid } 
    });
  }

  // Attack a cell
  attack(x: number, y: number) {
    this.send({ 
      type: 'ATTACK', 
      payload: { x, y } 
    });
  }

  // Get leaderboard data
  getLeaderboard() {
    this.send({ type: 'GET_LEADERBOARD' });
  }

  // Development mode simulation
  private simulateResponse(message: DevvitMessage) {
    setTimeout(() => {
      switch (message.type) {
        case 'INIT':
          this.simulateInit();
          break;
        case 'FIND_MATCH':
          this.simulateMatchFound();
          break;
        case 'GET_LEADERBOARD':
          this.simulateLeaderboard();
          break;
      }
    }, 500);
  }

  private simulateInit() {
    const mockState: Partial<GameState> = {
      phase: 'loading',
    };
    
    // Simulate getting user data
    const handlers = this.handlers.get('GAME_STATE_UPDATE') || [];
    handlers.forEach(handler => handler({
      currentUser: {
        id: 'dev_user_1',
        username: 'TestPlayer',
        avatarUrl: undefined,
      },
      gameState: null,
    }));
  }

  private simulateMatchFound() {
    // For development, simulate finding a match after a delay
    const handlers = this.handlers.get('MATCH_FOUND') || [];
    handlers.forEach(handler => handler({
      gameId: 'dev_game_' + Date.now(),
      opponent: {
        id: 'dev_user_2',
        username: 'Opponent_Bot',
        avatarUrl: undefined,
      },
      youArePlayer: 1,
    }));
  }

  private simulateLeaderboard() {
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, username: 'MuuzahMaster', score: 15000, wins: 42, gamesPlayed: 50 },
      { rank: 2, username: 'TokenHunter', score: 12500, wins: 35, gamesPlayed: 45 },
      { rank: 3, username: 'BombDodger', score: 10000, wins: 28, gamesPlayed: 40 },
      { rank: 4, username: 'ShapeSeer', score: 8500, wins: 22, gamesPlayed: 35 },
      { rank: 5, username: 'GridGuru', score: 7000, wins: 18, gamesPlayed: 30 },
    ];

    const handlers = this.handlers.get('LEADERBOARD_DATA') || [];
    handlers.forEach(handler => handler(mockLeaderboard));
  }
}

export const devvitBridge = new DevvitBridge();
