import { Player } from '@/types/game';
import { Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerStatusProps {
  player: Player;
  isActive: boolean;
  isYou?: boolean;
}

export function PlayerStatus({ player, isActive, isYou = false }: PlayerStatusProps) {
  const hearts = Array(3).fill(0).map((_, i) => i < player.lives);

  return (
    <div
      className={cn(
        'player-panel',
        isActive && 'active-player'
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {player.user.avatarUrl ? (
            <img 
              src={player.user.avatarUrl} 
              alt={player.user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {player.user.username}
            </h3>
            {isYou && (
              <span className="reddit-badge text-xs">You</span>
            )}
          </div>
          {isActive && (
            <span className="text-xs text-primary font-medium animate-pulse-soft">
              Current Turn
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Lives */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Lives:</span>
          {hearts.map((alive, i) => (
            <Heart
              key={i}
              className={cn(
                'w-5 h-5 transition-all',
                alive
                  ? 'text-destructive fill-destructive'
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>

        {/* Score */}
        <div className="text-right">
          <span className="text-xs text-muted-foreground">Score: </span>
          <span className="text-xl font-bold text-primary">
            {player.score}
          </span>
        </div>
      </div>
    </div>
  );
}
