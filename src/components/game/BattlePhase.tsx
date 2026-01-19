import { useState } from 'react';
import { GameState, Token } from '@/types/game';
import { GameGrid } from './GameGrid';
import { MarketPanel } from './MarketPanel';
import { PlayerStatus } from './PlayerStatus';
import { TokenShape } from './TokenShape';
import { calculateTokenScore } from '@/utils/gameLogic';
import { cn } from '@/lib/utils';
import { Bomb, Target, Crosshair } from 'lucide-react';

interface BattlePhaseProps {
  gameState: GameState;
  onAttack: (x: number, y: number) => { hit: boolean; token?: Token; bomb?: boolean; points?: number };
  lastHit: { x: number; y: number; result: 'hit' | 'miss' | 'bomb'; token?: Token; points?: number } | null;
}

export function BattlePhase({ gameState, onAttack, lastHit }: BattlePhaseProps) {
  const [activeView, setActiveView] = useState<'attack' | 'defense'>('attack');
  
  const isPlayer1Turn = gameState.currentPlayer === 1;
  const currentPlayer = isPlayer1Turn ? gameState.player1 : gameState.player2;
  const opponent = isPlayer1Turn ? gameState.player2 : gameState.player1;

  const handleAttack = (x: number, y: number) => {
    if (activeView !== 'attack') return;
    onAttack(x, y);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="game-title text-3xl md:text-4xl mb-2">MUUZAH</h1>
          <p className="text-lg text-primary font-semibold">
            <Crosshair className="inline w-5 h-5 mr-2" />
            {currentPlayer.name}'s Turn - Select Target
          </p>
        </div>

        {/* Last Hit Feedback */}
        {lastHit && (
          <div
            className={cn(
              'text-center mb-4 p-3 rounded-lg animate-fade-in',
              lastHit.result === 'hit' && 'bg-green-500/20 border border-green-500/50',
              lastHit.result === 'miss' && 'bg-muted/50 border border-muted',
              lastHit.result === 'bomb' && 'bg-destructive/20 border border-destructive/50'
            )}
          >
            {lastHit.result === 'hit' && lastHit.token && (
              <div className="flex items-center justify-center gap-3">
                <span className="text-green-400 font-bold">HIT!</span>
                <TokenShape shape={lastHit.token.shape} color={lastHit.token.color} size="sm" />
                <span className="text-accent font-bold">+{lastHit.points} pts</span>
              </div>
            )}
            {lastHit.result === 'miss' && (
              <span className="text-muted-foreground">Miss - Empty cell</span>
            )}
            {lastHit.result === 'bomb' && (
              <div className="flex items-center justify-center gap-2">
                <Bomb className="w-5 h-5 text-destructive" />
                <span className="text-destructive font-bold">BOOM! You lost a life!</span>
              </div>
            )}
          </div>
        )}

        {/* Player Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <PlayerStatus
            player={gameState.player1}
            isActive={isPlayer1Turn}
            playerNumber={1}
          />
          <PlayerStatus
            player={gameState.player2}
            isActive={!isPlayer1Turn}
            playerNumber={2}
          />
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setActiveView('attack')}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all',
              activeView === 'attack'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <Target className="w-4 h-4" />
            Enemy Grid
          </button>
          <button
            onClick={() => setActiveView('defense')}
            className={cn(
              'px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all',
              activeView === 'defense'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            Your Grid
          </button>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Left - Market Panel */}
          <div className="hidden md:block">
            <MarketPanel
              shapeValues={gameState.shapeValues}
              colorMultipliers={gameState.colorMultipliers}
            />
          </div>

          {/* Center - Grid */}
          <div className="flex justify-center">
            <div
              className={cn(
                'rounded-xl p-4 bg-card/50 transition-all',
                activeView === 'attack' ? 'neon-border' : 'border-2 border-secondary'
              )}
            >
              {activeView === 'attack' ? (
                <>
                  <p className="text-center text-sm text-muted-foreground mb-2">
                    Opponent's Grid (Click to Attack)
                  </p>
                  <GameGrid
                    grid={opponent.grid}
                    onCellClick={handleAttack}
                    isOwn={false}
                  />
                </>
              ) : (
                <>
                  <p className="text-center text-sm text-muted-foreground mb-2">
                    Your Grid (View Only)
                  </p>
                  <GameGrid
                    grid={currentPlayer.grid}
                    onCellClick={() => {}}
                    isOwn={true}
                    disabled
                    showContent
                  />
                </>
              )}
            </div>
          </div>

          {/* Right - Mobile Market Panel */}
          <div className="md:hidden">
            <MarketPanel
              shapeValues={gameState.shapeValues}
              colorMultipliers={gameState.colorMultipliers}
            />
          </div>

          {/* Right - Score Breakdown (Desktop) */}
          <div className="hidden md:block">
            <div className="player-panel">
              <h3 className="text-lg font-bold text-primary font-['Orbitron'] mb-4">
                Battle Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Leader</p>
                  <p className="text-xl font-bold">
                    {gameState.player1.score > gameState.player2.score
                      ? gameState.player1.name
                      : gameState.player2.score > gameState.player1.score
                      ? gameState.player2.name
                      : 'Tied'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score Difference</p>
                  <p className="text-xl font-bold text-accent">
                    {Math.abs(gameState.player1.score - gameState.player2.score)} pts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
