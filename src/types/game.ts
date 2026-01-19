// Game Types for Muuzah

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
  isHit: boolean;
}

export interface Player {
  name: string;
  grid: Cell[][];
  lives: number;
  score: number;
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

export interface GameState {
  phase: 'setup-p1' | 'setup-p2' | 'battle' | 'gameover';
  currentPlayer: 1 | 2;
  player1: Player;
  player2: Player;
  shapeValues: ShapeValues;
  colorMultipliers: ColorMultipliers;
  winner: 1 | 2 | null;
  gridSize: number;
  tokensPerPlayer: number;
  bombsPerPlayer: number;
}

export const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'star'];
export const COLORS: TokenColor[] = ['red', 'blue', 'green', 'yellow'];

export const GRID_SIZE = 8;
export const TOKENS_PER_PLAYER = 8;
export const BOMBS_PER_PLAYER = 3;
export const INITIAL_LIVES = 3;
