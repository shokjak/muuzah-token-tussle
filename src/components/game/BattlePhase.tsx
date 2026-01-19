import { useState } from 'react';
import { Player, ShapeValues, ColorMultipliers, Token, RedditUser } from '@/types/game';
import { GameGrid } from './GameGrid';
import { MarketPanel } from './MarketPanel';
import { PlayerStatus } from './PlayerStatus';
import { SoundToggle } from './SoundToggle';
import { TokenShape } from './TokenShape';
import { calculateTokenScore } from '@/utils/gameLogic';
import { soundManager } from '@/utils/soundManager';
import { cn } from '@/lib/utils';
import { Bomb, Target, Shield } from 'lucide-react';

interface BattlePhaseProps {
  currentUser: RedditUser;
  player1: Player;
  player2: Player;
  isYourTurn: boolean;
  shapeValues: ShapeValues;
  colorMultipliers: ColorMultipliers;
  onAttack: (x: number, y: number) => void;
  lastHit: { x: number; y: number; result: 'hit' | 'miss' | 'bomb'; token?: Token; points?: number } | null;
}

export function BattlePhase({
  currentUser,
  player1,
  player2,
  isYourTurn,
  shapeValues,
  colorMultipliers,
  onAttack,
  lastHit,
}: BattlePhaseProps) {
  const [activeView, setActiveView] = useState<'attack' | 'defense'>('attack');
  
  const isPlayer1 = currentUser.id === player1.user.id;
  const yourPlayer = isPlayer1 ? player1 : player2;
  const opponent = isPlayer1 ? player2 : player1;

  const handleAttack = (x: number, y: number) => {
    if (activeView !== 'attack' || !isYourTurn) return;
    onAttack(x, y);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="game-title text-2xl md:text-3xl">MUUZAH</h1>
          <SoundToggle />
        </div>

        {/* Last Hit Feedback */}
        {lastHit && (
          <div
            className={cn(
              'text-center mb-4 p-3 rounded-lg animate-fade-in',
              lastHit.result === 'hit' && 'bg-green-500/10 border border-green-500/30',
              lastHit.result === 'miss' && 'bg-muted border border-border',
              lastHit.result === 'bomb' && 'bg-destructive/10 border border-destructive/30'
            )}
          >
            {lastHit.result === 'hit' && lastHit.token && (
              <div className="flex items-center justify-center gap-3">
                <span className="text-green-600 font-bold">HIT!</span>
                <TokenShape shape={lastHit.token.shape} color={lastHit.token.color} size="sm" />
                <span className="text-primary font-bold">+{lastHit.points} pts</span>
              </div>
            )}
            {lastHit.result === 'miss' && (
              <span className="text-muted-foreground">Miss - Empty cell</span>
            )}
            {lastHit.result === 'bomb' && (
              <div className="flex items-center justify-center gap-2">
                <Bomb className="w-5 h-5 text-destructive" />
                <span className="text-destructive font-bold">BOOM! Lost a life!</span>
              </div>
            )}
          </div>
        )}

        {/* Player Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <PlayerStatus
            player={player1}
            isActive={player1.user.id === (isYourTurn ? currentUser.id : opponent.user.id)}
            isYou={isPlayer1}
          />
          <PlayerStatus
            player={player2}
            isActive={player2.user.id === (isYourTurn ? currentUser.id : opponent.user.id)}
            isYou={!isPlayer1}
          />
        </div>

        {/* Turn Indicator */}
        <div className={cn(
          'text-center mb-4 py-2 rounded-lg font-semibold',
          isYourTurn ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {isYourTurn ? "🎯 Your Turn - Select a target!" : "⏳ Waiting for opponent's move..."}
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setActiveView('attack')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all',
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
              'px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all',
              activeView === 'defense'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <Shield className="w-4 h-4" />
            Your Grid
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Left - Market Panel (Desktop) */}
          <div className="hidden lg:block">
            <MarketPanel
              shapeValues={shapeValues}
              colorMultipliers={colorMultipliers}
            />
          </div>

          {/* Center - Grid */}
          <div className="flex justify-center">
            <div className={cn(
              'bg-card rounded-xl p-4 border shadow-sm',
              activeView === 'attack' && isYourTurn && 'border-primary'
            )}>
              <p className="text-center text-sm text-muted-foreground mb-3">
                {activeView === 'attack' 
                  ? `${opponent.user.username}'s Grid` 
                  : 'Your Grid'}
              </p>
              {activeView === 'attack' ? (
                <GameGrid
                  grid={opponent.grid}
                  onCellClick={handleAttack}
                  isOwn={false}
                  disabled={!isYourTurn}
                />
              ) : (
                <GameGrid
                  grid={yourPlayer.grid}
                  onCellClick={() => {}}
                  isOwn={true}
                  disabled
                  showContent
                />
              )}
            </div>
          </div>

          {/* Right - Mobile Market Panel or Stats */}
          <div className="lg:hidden">
            <MarketPanel
              shapeValues={shapeValues}
              colorMultipliers={colorMultipliers}
            />
          </div>

          {/* Right - Battle Stats (Desktop) */}
          <div className="hidden lg:block">
            <div className="market-panel">
              <h3 className="text-base font-bold text-foreground mb-4">
                📈 Battle Stats
              </h3>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Current Leader</p>
                  <p className="text-lg font-bold">
                    {player1.score > player2.score
                      ? player1.user.username
                      : player2.score > player1.score
                      ? player2.user.username
                      : 'Tied'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Score Gap</p>
                  <p className="text-lg font-bold text-primary">
                    {Math.abs(player1.score - player2.score)} pts
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
