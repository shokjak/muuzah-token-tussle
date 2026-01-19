import {
  Cell,
  Player,
  ShapeValues,
  ColorMultipliers,
  GameState,
  Token,
  RedditUser,
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
export function createEmptyGrid(size: number = GRID_SIZE): Cell[][] {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({
          token: null,
          isBomb: false,
          isRevealed: false,
        }))
    );
}

/**
 * Randomizes point values for shapes at the start of each game
 * Values: 10, 25, 50, 100 - shuffled randomly
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
 * Generates color multipliers (1x, 1.5x, 2x, 2.5x) - shuffled randomly
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
 * Creates a new player
 */
export function createPlayer(user: RedditUser, gridSize: number = GRID_SIZE): Player {
  return {
    user,
    grid: createEmptyGrid(gridSize),
    lives: INITIAL_LIVES,
    score: 0,
    setupComplete: false,
  };
}

/**
 * Initializes a new game state for a match between two players
 */
export function initializeGame(
  gameId: string,
  player1User: RedditUser,
  player2User: RedditUser
): GameState {
  return {
    gameId,
    phase: 'setup-p1',
    player1: createPlayer(player1User),
    player2: createPlayer(player2User),
    currentTurnUserId: player1User.id,
    shapeValues: generateRandomShapeValues(),
    colorMultipliers: generateColorMultipliers(),
    winnerId: null,
    winReason: null,
    gridSize: GRID_SIZE,
    tokensPerPlayer: TOKENS_PER_PLAYER,
    bombsPerPlayer: BOMBS_PER_PLAYER,
    createdAt: Date.now(),
    lastMoveAt: Date.now(),
  };
}

/**
 * Calculates the score for hitting a token
 * Formula: Base Points × Color Multiplier
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
 * Validates if setup is complete for a player
 */
export function isSetupComplete(
  grid: Cell[][],
  requiredTokens: number = TOKENS_PER_PLAYER,
  requiredBombs: number = BOMBS_PER_PLAYER
): boolean {
  return (
    countTokens(grid) === requiredTokens && countBombs(grid) === requiredBombs
  );
}

/**
 * Serializes game state for storage/transmission
 */
export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

/**
 * Deserializes game state from storage/transmission
 */
export function deserializeGameState(json: string): GameState {
  return JSON.parse(json) as GameState;
}
