// Devvit PostMessage Bridge
// Handles communication between the webview (React app) and Devvit backend

import { DevvitMessage, Cell, LeaderboardEntry } from '@/types/game';

type MessageHandler = (payload: unknown) => void;

class DevvitBridge {
  private handlers: Map<string, MessageHandler[]> = new Map();
  private isDevvitEnvironment: boolean = false;
  private initialized: boolean = false;

  constructor() {
    // Check if we're running inside Devvit webview (iframe)
    this.isDevvitEnvironment = window.parent !== window;
    console.log('[DevvitBridge] Constructor, isDevvit:', this.isDevvitEnvironment);

    // Listen for messages from Devvit backend
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    // Skip non-object messages
    if (!event.data || typeof event.data !== 'object') {
      return;
    }

    console.log('[DevvitBridge] Raw message:', JSON.stringify(event.data).substring(0, 500));
    
    let messageType: string | null = null;
    let messagePayload: unknown = null;
    
    // Format 1: Devvit wraps messages as { type: 'devvit-message', data: { message: { type, payload } } }
    if (event.data?.type === 'devvit-message' && event.data?.data?.message) {
      const inner = event.data.data.message;
      messageType = inner.type;
      messagePayload = inner.payload;
      console.log('[DevvitBridge] Format 1 (devvit-message wrap):', messageType);
    }
    // Format 2: Direct message { type, payload }
    else if (event.data?.type && typeof event.data.type === 'string' && event.data.type !== 'webpackOk') {
      messageType = event.data.type;
      messagePayload = event.data.payload;
      console.log('[DevvitBridge] Format 2 (direct):', messageType);
    }
    
    if (messageType) {
      const handlers = this.handlers.get(messageType) || [];
      console.log('[DevvitBridge] Dispatching', messageType, 'to', handlers.length, 'handlers');
      handlers.forEach(handler => {
        try {
          handler(messagePayload);
        } catch (e) {
          console.error('[DevvitBridge] Handler error:', e);
        }
      });
    }
  }

  // Register a handler for a specific message type
  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
    console.log('[DevvitBridge] Handler registered for:', type);
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
  private send(message: DevvitMessage) {
    console.log('[DevvitBridge] Sending:', JSON.stringify(message));
    
    if (this.isDevvitEnvironment) {
      // Send directly to parent - Devvit handles routing
      window.parent.postMessage(message, '*');
    } else {
      // Development mode - simulate responses
      console.log('[DevvitBridge] Dev mode - simulating');
      this.simulateResponse(message);
    }
  }

  // Initialize the connection - MUST be called after handlers are registered
  init() {
    if (this.initialized) {
      console.log('[DevvitBridge] Already initialized');
      return;
    }
    this.initialized = true;
    console.log('[DevvitBridge] Sending INIT');
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
          this.dispatchMockInit();
          break;
        case 'FIND_MATCH':
          this.dispatchMockMatch();
          break;
        case 'GET_LEADERBOARD':
          this.dispatchMockLeaderboard();
          break;
      }
    }, 300);
  }

  private dispatchMockInit() {
    const handlers = this.handlers.get('GAME_STATE_UPDATE') || [];
    handlers.forEach(handler => handler({
      currentUser: {
        id: 'dev_user_1',
        username: 'TestPlayer',
      },
      gameState: null,
    }));
  }

  private dispatchMockMatch() {
    const handlers = this.handlers.get('MATCH_FOUND') || [];
    handlers.forEach(handler => handler({
      gameId: 'dev_game_' + Date.now(),
      opponent: {
        id: 'dev_user_2',
        username: 'Opponent_Bot',
      },
      youArePlayer: 1,
    }));
  }

  private dispatchMockLeaderboard() {
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, username: 'MuuzahMaster', score: 15000, wins: 42, gamesPlayed: 50 },
      { rank: 2, username: 'TokenHunter', score: 12500, wins: 35, gamesPlayed: 45 },
      { rank: 3, username: 'BombDodger', score: 10000, wins: 28, gamesPlayed: 40 },
    ];
    const handlers = this.handlers.get('LEADERBOARD_DATA') || [];
    handlers.forEach(handler => handler(mockLeaderboard));
  }
}

// Single instance
export const devvitBridge = new DevvitBridge();
