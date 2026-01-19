import { Player } from '@/types/game';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerStatusProps {
  player: Player;
  isActive: boolean;
  playerNumber: 1 | 2;
}

export function PlayerStatus({ player, isActive, playerNumber }: PlayerStatusProps) {
  const hearts = Array(3).fill(0).map((_, i) => i < player.lives);

  return (
    <div
      className={cn(
        'player-panel transition-all duration-300',
        isActive && 'active-player'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className={cn(
            "text-lg font-bold font-['Orbitron']",
            playerNumber === 1 ? 'text-primary' : 'text-secondary'
          )}
        >
          {player.name}
        </h3>
        {isActive && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full animate-glow-pulse">
            YOUR TURN
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {/* Lives */}
        <div className="flex items-center gap-1">
          {hearts.map((alive, i) => (
            <Heart
              key={i}
              className={cn(
                'w-6 h-6 transition-all',
                alive
                  ? 'text-destructive fill-destructive life-heart'
                  : 'text-muted-foreground'
              )}
            />
          ))}
        </div>

        {/* Score */}
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase">Score</p>
          <p className="text-2xl font-bold text-accent font-['Orbitron']">
            {player.score}
          </p>
        </div>
      </div>
    </div>
  );
}
