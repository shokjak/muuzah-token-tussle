import {
  Cell,
  Player,
  ShapeValues,
  ColorMultipliers,
  GameState,
  Token,
  SHAPES,
  COLORS,
  GRID_SIZE,
  TOKENS_PER_PLAYER,
  BOMBS_PER_PLAYER,
  INITIAL_LIVES,
} from '@/types/game';

/**
 * Creates an empty grid of cells
 */
export function createEmptyGrid(size: number): Cell[][] {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({
          token: null,
          isBomb: false,
          isRevealed: false,
          isHit: false,
        }))
    );
}

/**
 * Randomizes point values for shapes at the start of each game
 * Values range from 10 to 100 in increments of 10
 */
export function generateRandomShapeValues(): ShapeValues {
  const values = [10, 25, 50, 100];
  const shuffled = [...values].sort(() => Math.random() - 0.5);
  
  return {
    circle: shuffled[0],
    square: shuffled[1],
    triangle: shuffled[2],
    star: shuffled[3],
  };
}

/**
 * Generates color multipliers (1x, 1.5x, 2x, 2.5x)
 */
export function generateColorMultipliers(): ColorMultipliers {
  const multipliers = [1, 1.5, 2, 2.5];
  const shuffled = [...multipliers].sort(() => Math.random() - 0.5);
  
  return {
    red: shuffled[0],
    blue: shuffled[1],
    green: shuffled[2],
    yellow: shuffled[3],
  };
}

/**
 * Creates a new player with an empty grid
 */
export function createPlayer(name: string, gridSize: number): Player {
  return {
    name,
    grid: createEmptyGrid(gridSize),
    lives: INITIAL_LIVES,
    score: 0,
  };
}

/**
 * Initializes a new game state
 */
export function initializeGame(): GameState {
  return {
    phase: 'setup-p1',
    currentPlayer: 1,
    player1: createPlayer('Player 1', GRID_SIZE),
    player2: createPlayer('Player 2', GRID_SIZE),
    shapeValues: generateRandomShapeValues(),
    colorMultipliers: generateColorMultipliers(),
    winner: null,
    gridSize: GRID_SIZE,
    tokensPerPlayer: TOKENS_PER_PLAYER,
    bombsPerPlayer: BOMBS_PER_PLAYER,
  };
}

/**
 * Calculates the score for hitting a token
 */
export function calculateTokenScore(
  token: Token,
  shapeValues: ShapeValues,
  colorMultipliers: ColorMultipliers
): number {
  const baseValue = shapeValues[token.shape];
  const multiplier = colorMultipliers[token.color];
  return Math.round(baseValue * multiplier);
}

/**
 * Counts placed tokens on a grid
 */
export function countTokens(grid: Cell[][]): number {
  return grid.flat().filter((cell) => cell.token !== null).length;
}

/**
 * Counts placed bombs on a grid
 */
export function countBombs(grid: Cell[][]): number {
  return grid.flat().filter((cell) => cell.isBomb).length;
}

/**
 * Checks if all tokens on a grid have been revealed
 */
export function allTokensRevealed(grid: Cell[][]): boolean {
  return grid.flat().every((cell) => !cell.token || cell.isRevealed);
}

/**
 * Gets the opponent player number
 */
export function getOpponent(current: 1 | 2): 1 | 2 {
  return current === 1 ? 2 : 1;
}

/**
 * Validates if setup is complete for a player
 */
export function isSetupComplete(
  grid: Cell[][],
  requiredTokens: number,
  requiredBombs: number
): boolean {
  return (
    countTokens(grid) === requiredTokens && countBombs(grid) === requiredBombs
  );
}
