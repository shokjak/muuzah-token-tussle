// Game Types for Muuzah - Reddit Devvit Edition

export type Shape = 'circle' | 'square' | 'triangle' | 'star';
export type TokenColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Token {
  shape: Shape;
  color: TokenColor;
}

export interface Cell {
  token: Token | null;
  isBomb: boolean;
  isRevealed: boolean;
}

export interface RedditUser {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface Player {
  user: RedditUser;
  grid: Cell[][];
  lives: number;
  score: number;
  setupComplete: boolean;
}

export interface ShapeValues {
  circle: number;
  square: number;
  triangle: number;
  star: number;
}

export interface ColorMultipliers {
  red: number;
  blue: number;
  green: number;
  yellow: number;
}

export type GamePhase = 
  | 'loading'
  | 'waiting-for-opponent'  // In matchmaking queue
  | 'setup-p1'              // Player 1 placing tokens
  | 'setup-p2'              // Player 2 placing tokens
  | 'waiting-for-setup'     // Waiting for opponent to finish setup
  | 'your-turn'             // It's your turn to attack
  | 'opponent-turn'         // Waiting for opponent's move
  | 'gameover';

export interface GameState {
  gameId: string;
  phase: GamePhase;
  player1: Player | null;
  player2: Player | null;
  currentTurnUserId: string | null;
  shapeValues: ShapeValues;
  colorMultipliers: ColorMultipliers;
  winnerId: string | null;
  winReason: 'sudden-death' | 'score' | null;
  gridSize: number;
  tokensPerPlayer: number;
  bombsPerPlayer: number;
  createdAt: number;
  lastMoveAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  wins: number;
  gamesPlayed: number;
}

// Devvit message types
export type DevvitMessageType = 
  | 'INIT'
  | 'FIND_MATCH'
  | 'SUBMIT_SETUP'
  | 'ATTACK'
  | 'GET_LEADERBOARD'
  | 'GAME_STATE_UPDATE'
  | 'MATCH_FOUND'
  | 'ATTACK_RESULT'
  | 'LEADERBOARD_DATA'
  | 'ERROR';

export interface DevvitMessage {
  type: DevvitMessageType;
  payload?: unknown;
}

export const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'star'];
export const COLORS: TokenColor[] = ['red', 'blue', 'green', 'yellow'];

export const GRID_SIZE = 8;
export const TOKENS_PER_PLAYER = 8;
export const BOMBS_PER_PLAYER = 3;
export const INITIAL_LIVES = 3;
