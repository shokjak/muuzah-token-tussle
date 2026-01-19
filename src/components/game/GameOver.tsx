import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Skull, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface GameOverProps {
  gameState: GameState;
  onPlayAgain: () => void;
}

export function GameOver({ gameState, onPlayAgain }: GameOverProps) {
  const winner = gameState.winner === 1 ? gameState.player1 : gameState.player2;
  const loser = gameState.winner === 1 ? gameState.player2 : gameState.player1;
  const isSuddenDeath = loser.lives <= 0;

  useEffect(() => {
    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'],
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Trophy Animation */}
        <div className="mb-8 relative">
          <Trophy className="w-24 h-24 mx-auto text-accent animate-float" />
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
        </div>

        {/* Winner Announcement */}
        <h1 className="game-title text-4xl md:text-5xl mb-4">VICTORY!</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 font-['Orbitron']">
          {winner.name} Wins!
        </h2>

        {/* Win Condition */}
        <div
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8',
            isSuddenDeath ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
          )}
        >
          {isSuddenDeath ? (
            <>
              <Skull className="w-5 h-5" />
              <span className="font-semibold">Sudden Death Victory</span>
            </>
          ) : (
            <>
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Score Victory</span>
            </>
          )}
        </div>

        {/* Final Scores */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className={cn(
              'player-panel',
              gameState.winner === 1 && 'active-player'
            )}
          >
            <p className="text-sm text-muted-foreground mb-1">
              {gameState.player1.name}
            </p>
            <p className="text-3xl font-bold text-accent font-['Orbitron']">
              {gameState.player1.score}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < gameState.player1.lives
                        ? 'text-destructive fill-destructive'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
            </div>
          </div>
          <div
            className={cn(
              'player-panel',
              gameState.winner === 2 && 'active-player'
            )}
          >
            <p className="text-sm text-muted-foreground mb-1">
              {gameState.player2.name}
            </p>
            <p className="text-3xl font-bold text-accent font-['Orbitron']">
              {gameState.player2.score}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < gameState.player2.lives
                        ? 'text-destructive fill-destructive'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Play Again Button */}
        <Button
          onClick={onPlayAgain}
          size="lg"
          className="bg-primary hover:bg-primary/80 text-lg px-8"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  );
}
