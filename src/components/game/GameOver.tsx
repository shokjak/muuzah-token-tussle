import { Player, RedditUser } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Skull, RotateCcw, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { soundManager } from '@/utils/soundManager';
import confetti from 'canvas-confetti';

interface GameOverProps {
  currentUser: RedditUser;
  player1: Player;
  player2: Player;
  winnerId: string;
  winReason: 'sudden-death' | 'score';
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
}

export function GameOver({
  currentUser,
  player1,
  player2,
  winnerId,
  winReason,
  onPlayAgain,
  onViewLeaderboard,
}: GameOverProps) {
  const winner = winnerId === player1.user.id ? player1 : player2;
  const loser = winnerId === player1.user.id ? player2 : player1;
  const youWon = currentUser.id === winnerId;

  useEffect(() => {
    if (youWon) {
      soundManager.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b35', '#3b82f6', '#22c55e', '#eab308'],
      });
    } else {
      soundManager.playDefeat();
    }
  }, [youWon]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full animate-fade-in">
        {/* Result Icon */}
        <div className="mb-6">
          {youWon ? (
            <Trophy className="w-20 h-20 mx-auto text-yellow-500" />
          ) : (
            <Medal className="w-20 h-20 mx-auto text-muted-foreground" />
          )}
        </div>

        {/* Result Text */}
        <h1 className={cn(
          'game-title text-3xl md:text-4xl mb-2',
          youWon ? 'text-primary' : 'text-muted-foreground'
        )}>
          {youWon ? 'VICTORY!' : 'DEFEAT'}
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {winner.user.username} Wins!
        </h2>

        {/* Win Condition */}
        <div
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6',
            winReason === 'sudden-death' 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-primary/10 text-primary'
          )}
        >
          {winReason === 'sudden-death' ? (
            <>
              <Skull className="w-4 h-4" />
              <span className="font-medium text-sm">Sudden Death</span>
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4" />
              <span className="font-medium text-sm">Score Victory</span>
            </>
          )}
        </div>

        {/* Final Scores */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className={cn(
              'player-panel',
              winnerId === player1.user.id && 'active-player'
            )}
          >
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {player1.user.username}
              {player1.user.id === currentUser.id && ' (You)'}
            </p>
            <p className="text-2xl font-bold text-primary">
              {player1.score}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < player1.lives
                        ? 'text-destructive fill-destructive'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
            </div>
          </div>
          <div
            className={cn(
              'player-panel',
              winnerId === player2.user.id && 'active-player'
            )}
          >
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {player2.user.username}
              {player2.user.id === currentUser.id && ' (You)'}
            </p>
            <p className="text-2xl font-bold text-primary">
              {player2.score}
            </p>
            <div className="flex justify-center gap-1 mt-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Heart
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < player2.lives
                        ? 'text-destructive fill-destructive'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Find New Match
          </Button>
          <Button
            onClick={onViewLeaderboard}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
}
