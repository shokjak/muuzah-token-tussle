import { LeaderboardEntry } from '@/types/game';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUsername?: string;
}

export function Leaderboard({ entries, currentUsername }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground font-mono">{rank}</span>;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No games played yet</p>
        <p className="text-sm">Be the first to set a high score!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.username}
          className={cn(
            'leaderboard-item',
            entry.username === currentUsername && 'border-primary bg-primary/5'
          )}
        >
          <div className="flex items-center gap-3">
            {getRankIcon(entry.rank)}
            <div>
              <p className={cn(
                'font-semibold',
                entry.username === currentUsername && 'text-primary'
              )}>
                {entry.username}
                {entry.username === currentUsername && (
                  <span className="ml-2 text-xs text-primary">(You)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.wins}W / {entry.gamesPlayed}G
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>
      ))}
    </div>
  );
}
