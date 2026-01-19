import { useState, useCallback } from 'react';
import { GameState, Token } from '@/types/game';
import {
  initializeGame,
  createEmptyGrid,
  calculateTokenScore,
  allTokensRevealed,
  getOpponent,
} from '@/utils/gameLogic';
import { SetupPhase } from './SetupPhase';
import { BattlePhase } from './BattlePhase';
import { GameOver } from './GameOver';

export function MuuzahGame() {
  const [gameState, setGameState] = useState<GameState>(initializeGame);
  const [lastHit, setLastHit] = useState<{
    x: number;
    y: number;
    result: 'hit' | 'miss' | 'bomb';
    token?: Token;
    points?: number;
  } | null>(null);

  // Place token or bomb during setup
  const handlePlaceToken = useCallback(
    (x: number, y: number, token: Token | null, isBomb: boolean) => {
      setGameState((prev) => {
        const isPlayer1 = prev.phase === 'setup-p1';
        const playerKey = isPlayer1 ? 'player1' : 'player2';
        const player = prev[playerKey];

        const newGrid = player.grid.map((row, rowY) =>
          row.map((cell, cellX) => {
            if (cellX === x && rowY === y) {
              return {
                ...cell,
                token: token,
                isBomb: isBomb,
              };
            }
            return cell;
          })
        );

        return {
          ...prev,
          [playerKey]: {
            ...player,
            grid: newGrid,
          },
        };
      });
    },
    []
  );

  // Confirm setup and move to next phase
  const handleConfirmSetup = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase === 'setup-p1') {
        return { ...prev, phase: 'setup-p2' };
      } else if (prev.phase === 'setup-p2') {
        return { ...prev, phase: 'battle', currentPlayer: 1 };
      }
      return prev;
    });
  }, []);

  // Reset current player's grid
  const handleResetGrid = useCallback(() => {
    setGameState((prev) => {
      const isPlayer1 = prev.phase === 'setup-p1';
      const playerKey = isPlayer1 ? 'player1' : 'player2';

      return {
        ...prev,
        [playerKey]: {
          ...prev[playerKey],
          grid: createEmptyGrid(prev.gridSize),
        },
      };
    });
  }, []);

  // Handle attack during battle phase
  const handleAttack = useCallback(
    (x: number, y: number) => {
      let result: { hit: boolean; token?: Token; bomb?: boolean; points?: number } = {
        hit: false,
      };

      setGameState((prev) => {
        const opponentKey = prev.currentPlayer === 1 ? 'player2' : 'player1';
        const attackerKey = prev.currentPlayer === 1 ? 'player1' : 'player2';
        const opponent = prev[opponentKey];
        const attacker = prev[attackerKey];
        const cell = opponent.grid[y][x];

        // Already revealed, do nothing
        if (cell.isRevealed) {
          return prev;
        }

        // Update the opponent's grid to reveal the cell
        const newOpponentGrid = opponent.grid.map((row, rowY) =>
          row.map((c, cellX) => {
            if (cellX === x && rowY === y) {
              return { ...c, isRevealed: true };
            }
            return c;
          })
        );

        let newAttackerLives = attacker.lives;
        let newAttackerScore = attacker.score;
        let hitResult: 'hit' | 'miss' | 'bomb' = 'miss';
        let points = 0;

        if (cell.isBomb) {
          // Hit a bomb - lose a life
          newAttackerLives -= 1;
          hitResult = 'bomb';
          result = { hit: false, bomb: true };
        } else if (cell.token) {
          // Hit a token - gain points
          points = calculateTokenScore(cell.token, prev.shapeValues, prev.colorMultipliers);
          newAttackerScore += points;
          hitResult = 'hit';
          result = { hit: true, token: cell.token, points };
        } else {
          // Miss
          result = { hit: false };
        }

        // Check win conditions
        let winner: 1 | 2 | null = null;
        let phase = prev.phase;

        // Sudden death check
        if (newAttackerLives <= 0) {
          winner = getOpponent(prev.currentPlayer);
          phase = 'gameover';
        }
        // All tokens revealed check
        else if (allTokensRevealed(newOpponentGrid)) {
          // Compare scores
          const p1Score = attackerKey === 'player1' ? newAttackerScore : prev.player1.score;
          const p2Score = attackerKey === 'player2' ? newAttackerScore : prev.player2.score;
          winner = p1Score >= p2Score ? 1 : 2;
          phase = 'gameover';
        }

        // Update last hit for feedback
        setLastHit({
          x,
          y,
          result: hitResult,
          token: cell.token || undefined,
          points: points || undefined,
        });

        return {
          ...prev,
          phase,
          winner,
          currentPlayer: phase === 'gameover' ? prev.currentPlayer : getOpponent(prev.currentPlayer),
          [opponentKey]: {
            ...opponent,
            grid: newOpponentGrid,
          },
          [attackerKey]: {
            ...attacker,
            lives: newAttackerLives,
            score: newAttackerScore,
          },
        };
      });

      return result;
    },
    []
  );

  // Play again - reset the game
  const handlePlayAgain = useCallback(() => {
    setGameState(initializeGame());
    setLastHit(null);
  }, []);

  // Render the appropriate phase
  if (gameState.phase === 'setup-p1' || gameState.phase === 'setup-p2') {
    return (
      <SetupPhase
        gameState={gameState}
        onPlaceToken={handlePlaceToken}
        onConfirmSetup={handleConfirmSetup}
        onResetGrid={handleResetGrid}
      />
    );
  }

  if (gameState.phase === 'battle') {
    return (
      <BattlePhase
        gameState={gameState}
        onAttack={handleAttack}
        lastHit={lastHit}
      />
    );
  }

  if (gameState.phase === 'gameover') {
    return <GameOver gameState={gameState} onPlayAgain={handlePlayAgain} />;
  }

  return null;
}
