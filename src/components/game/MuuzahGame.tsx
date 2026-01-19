import { useState, useEffect, useCallback } from 'react';
import { 
  GameState, 
  Token, 
  RedditUser, 
  Cell, 
  GamePhase,
  GRID_SIZE,
  TOKENS_PER_PLAYER,
  BOMBS_PER_PLAYER,
} from '@/types/game';
import {
  createEmptyGrid,
  generateRandomShapeValues,
  generateColorMultipliers,
  calculateTokenScore,
  allTokensRevealed,
  countTokens,
  countBombs,
  isSetupComplete,
} from '@/utils/gameLogic';
import { devvitBridge } from '@/utils/devvitBridge';
import { soundManager } from '@/utils/soundManager';
import { MainMenu } from './MainMenu';
import { SetupPhase } from './SetupPhase';
import { BattlePhase } from './BattlePhase';
import { GameOver } from './GameOver';
import { WaitingScreen } from './WaitingScreen';
import { Loader2 } from 'lucide-react';

// Development mode mock user
const DEV_USER: RedditUser = {
  id: 'dev_user_1',
  username: 'TestPlayer',
};

export function MuuzahGame() {
  const [currentUser, setCurrentUser] = useState<RedditUser | null>(null);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [localGrid, setLocalGrid] = useState<Cell[][]>(createEmptyGrid(GRID_SIZE));
  const [lastHit, setLastHit] = useState<{
    x: number;
    y: number;
    result: 'hit' | 'miss' | 'bomb';
    token?: Token;
    points?: number;
  } | null>(null);

  // Initialize connection to Devvit
  useEffect(() => {
    const handleGameStateUpdate = (payload: unknown) => {
      const data = payload as { currentUser: RedditUser; gameState: GameState | null };
      setCurrentUser(data.currentUser);
      if (data.gameState) {
        setGameState(data.gameState);
      }
      setPhase('loading'); // Will be set properly after
    };

    const handleMatchFound = (payload: unknown) => {
      const data = payload as { 
        gameId: string; 
        opponent: RedditUser; 
        youArePlayer: 1 | 2;
        shapeValues?: GameState['shapeValues'];
        colorMultipliers?: GameState['colorMultipliers'];
      };
      
      // Initialize game state for setup
      const newShapeValues = data.shapeValues || generateRandomShapeValues();
      const newColorMultipliers = data.colorMultipliers || generateColorMultipliers();
      
      setGameState({
        gameId: data.gameId,
        phase: data.youArePlayer === 1 ? 'setup-p1' : 'setup-p2',
        player1: data.youArePlayer === 1 ? {
          user: currentUser!,
          grid: createEmptyGrid(GRID_SIZE),
          lives: 3,
          score: 0,
          setupComplete: false,
        } : {
          user: data.opponent,
          grid: createEmptyGrid(GRID_SIZE),
          lives: 3,
          score: 0,
          setupComplete: false,
        },
        player2: data.youArePlayer === 2 ? {
          user: currentUser!,
          grid: createEmptyGrid(GRID_SIZE),
          lives: 3,
          score: 0,
          setupComplete: false,
        } : {
          user: data.opponent,
          grid: createEmptyGrid(GRID_SIZE),
          lives: 3,
          score: 0,
          setupComplete: false,
        },
        currentTurnUserId: null,
        shapeValues: newShapeValues,
        colorMultipliers: newColorMultipliers,
        winnerId: null,
        winReason: null,
        gridSize: GRID_SIZE,
        tokensPerPlayer: TOKENS_PER_PLAYER,
        bombsPerPlayer: BOMBS_PER_PLAYER,
        createdAt: Date.now(),
        lastMoveAt: Date.now(),
      });
      
      setLocalGrid(createEmptyGrid(GRID_SIZE));
      setPhase(data.youArePlayer === 1 ? 'setup-p1' : 'setup-p2');
      soundManager.playNotification();
    };

    const handleAttackResult = (payload: unknown) => {
      const data = payload as {
        x: number;
        y: number;
        result: 'hit' | 'miss' | 'bomb';
        token?: Token;
        points?: number;
        gameState: GameState;
      };
      
      setGameState(data.gameState);
      setLastHit({
        x: data.x,
        y: data.y,
        result: data.result,
        token: data.token,
        points: data.points,
      });

      // Play appropriate sound
      if (data.result === 'hit') {
        soundManager.playHit();
      } else if (data.result === 'miss') {
        soundManager.playMiss();
      } else if (data.result === 'bomb') {
        soundManager.playExplosion();
      }

      // Update phase based on game state
      if (data.gameState.winnerId) {
        setPhase('gameover');
      } else if (data.gameState.currentTurnUserId === currentUser?.id) {
        setPhase('your-turn');
      } else {
        setPhase('opponent-turn');
      }
    };

    devvitBridge.on('GAME_STATE_UPDATE', handleGameStateUpdate);
    devvitBridge.on('MATCH_FOUND', handleMatchFound);
    devvitBridge.on('ATTACK_RESULT', handleAttackResult);

    // Initialize
    devvitBridge.init();

    // For development, set mock user after a delay
    setTimeout(() => {
      if (!currentUser) {
        setCurrentUser(DEV_USER);
        setPhase('loading');
      }
    }, 600);

    return () => {
      devvitBridge.off('GAME_STATE_UPDATE', handleGameStateUpdate);
      devvitBridge.off('MATCH_FOUND', handleMatchFound);
      devvitBridge.off('ATTACK_RESULT', handleAttackResult);
    };
  }, [currentUser]);

  // Handle finding a match
  const handleFindMatch = useCallback(() => {
    setPhase('waiting-for-opponent');
    devvitBridge.findMatch();
  }, []);

  // Handle token placement during setup
  const handlePlaceToken = useCallback((x: number, y: number, token: Token | null, isBomb: boolean) => {
    setLocalGrid(prev => {
      const newGrid = prev.map((row, rowY) =>
        row.map((cell, cellX) => {
          if (cellX === x && rowY === y) {
            return {
              ...cell,
              token: token,
              isBomb: isBomb && !token,
            };
          }
          return cell;
        })
      );
      return newGrid;
    });
  }, []);

  // Handle setup confirmation
  const handleConfirmSetup = useCallback(() => {
    if (!isSetupComplete(localGrid, TOKENS_PER_PLAYER, BOMBS_PER_PLAYER)) return;
    
    devvitBridge.submitSetup(localGrid);
    setPhase('waiting-for-setup');
    
    // For development, simulate opponent setup completion
    setTimeout(() => {
      if (gameState) {
        const isPlayer1 = currentUser?.id === gameState.player1?.user.id;
        setGameState(prev => {
          if (!prev) return prev;
          
          const playerKey = isPlayer1 ? 'player1' : 'player2';
          return {
            ...prev,
            [playerKey]: {
              ...prev[playerKey]!,
              grid: localGrid,
              setupComplete: true,
            },
            phase: 'your-turn',
            currentTurnUserId: prev.player1?.user.id,
          };
        });
        setPhase('your-turn');
        soundManager.playNotification();
      }
    }, 1500);
  }, [localGrid, gameState, currentUser]);

  // Handle grid reset
  const handleResetGrid = useCallback(() => {
    setLocalGrid(createEmptyGrid(GRID_SIZE));
  }, []);

  // Handle attack
  const handleAttack = useCallback((x: number, y: number) => {
    if (!gameState || !currentUser) return;
    
    const isPlayer1 = currentUser.id === gameState.player1?.user.id;
    const opponent = isPlayer1 ? gameState.player2 : gameState.player1;
    
    if (!opponent) return;
    
    const cell = opponent.grid[y][x];
    if (cell.isRevealed) return;

    // For development, simulate locally
    let result: 'hit' | 'miss' | 'bomb' = 'miss';
    let points = 0;
    
    // Simulate some hits for testing
    const hitChance = Math.random();
    if (hitChance < 0.3) {
      result = 'hit';
      points = Math.floor(Math.random() * 200) + 10;
    } else if (hitChance < 0.4) {
      result = 'bomb';
    }

    const newOpponentGrid = opponent.grid.map((row, rowY) =>
      row.map((c, cellX) => {
        if (cellX === x && rowY === y) {
          return { ...c, isRevealed: true };
        }
        return c;
      })
    );

    const attackerKey = isPlayer1 ? 'player1' : 'player2';
    const opponentKey = isPlayer1 ? 'player2' : 'player1';

    setGameState(prev => {
      if (!prev) return prev;
      
      const attacker = prev[attackerKey]!;
      const newLives = result === 'bomb' ? attacker.lives - 1 : attacker.lives;
      const newScore = result === 'hit' ? attacker.score + points : attacker.score;
      
      let winnerId = null;
      let winReason: 'sudden-death' | 'score' | null = null;
      
      if (newLives <= 0) {
        winnerId = opponent.user.id;
        winReason = 'sudden-death';
      }
      
      return {
        ...prev,
        [opponentKey]: {
          ...prev[opponentKey]!,
          grid: newOpponentGrid,
        },
        [attackerKey]: {
          ...attacker,
          lives: newLives,
          score: newScore,
        },
        winnerId,
        winReason,
        currentTurnUserId: winnerId ? null : opponent.user.id,
        lastMoveAt: Date.now(),
      };
    });

    setLastHit({
      x,
      y,
      result,
      token: result === 'hit' ? { shape: 'star', color: 'blue' } : undefined,
      points: result === 'hit' ? points : undefined,
    });

    // Play sound
    if (result === 'hit') {
      soundManager.playHit();
    } else if (result === 'miss') {
      soundManager.playMiss();
    } else {
      soundManager.playExplosion();
    }

    // Check win condition or switch turns
    setTimeout(() => {
      setGameState(prev => {
        if (!prev) return prev;
        if (prev.winnerId) {
          setPhase('gameover');
          return prev;
        }
        setPhase('opponent-turn');
        
        // Simulate opponent's turn
        setTimeout(() => {
          setPhase('your-turn');
          soundManager.playNotification();
        }, 2000);
        
        return prev;
      });
    }, 500);
  }, [gameState, currentUser]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    setGameState(null);
    setLocalGrid(createEmptyGrid(GRID_SIZE));
    setLastHit(null);
    setPhase('loading');
    handleFindMatch();
  }, [handleFindMatch]);

  // Render loading state
  if (phase === 'loading' && !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Main Menu (no active game)
  if ((phase === 'loading' && currentUser && !gameState) || (!gameState && currentUser)) {
    return <MainMenu currentUser={currentUser!} onFindMatch={handleFindMatch} />;
  }

  // Waiting for opponent
  if (phase === 'waiting-for-opponent') {
    return <WaitingScreen type="matchmaking" onCancel={() => setPhase('loading')} />;
  }

  // Setup Phase
  if ((phase === 'setup-p1' || phase === 'setup-p2') && gameState && currentUser) {
    return (
      <SetupPhase
        currentUser={currentUser}
        grid={localGrid}
        shapeValues={gameState.shapeValues}
        colorMultipliers={gameState.colorMultipliers}
        tokensRequired={gameState.tokensPerPlayer}
        bombsRequired={gameState.bombsPerPlayer}
        gridSize={gameState.gridSize}
        onPlaceToken={handlePlaceToken}
        onConfirmSetup={handleConfirmSetup}
        onResetGrid={handleResetGrid}
      />
    );
  }

  // Waiting for opponent setup
  if (phase === 'waiting-for-setup') {
    return <WaitingScreen type="opponent-setup" />;
  }

  // Battle Phase
  if ((phase === 'your-turn' || phase === 'opponent-turn') && gameState && currentUser) {
    return (
      <BattlePhase
        currentUser={currentUser}
        player1={gameState.player1!}
        player2={gameState.player2!}
        isYourTurn={phase === 'your-turn'}
        shapeValues={gameState.shapeValues}
        colorMultipliers={gameState.colorMultipliers}
        onAttack={handleAttack}
        lastHit={lastHit}
      />
    );
  }

  // Game Over
  if (phase === 'gameover' && gameState && currentUser && gameState.winnerId) {
    return (
      <GameOver
        currentUser={currentUser}
        player1={gameState.player1!}
        player2={gameState.player2!}
        winnerId={gameState.winnerId}
        winReason={gameState.winReason || 'score'}
        onPlayAgain={handlePlayAgain}
        onViewLeaderboard={() => {
          setGameState(null);
          setPhase('loading');
        }}
      />
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Something went wrong...</p>
    </div>
  );
}
