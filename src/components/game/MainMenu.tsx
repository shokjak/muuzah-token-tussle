import { useState, useEffect } from 'react';
import { RedditUser, LeaderboardEntry } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Leaderboard } from './Leaderboard';
import { SoundToggle } from './SoundToggle';
import { devvitBridge } from '@/utils/devvitBridge';
import { Play, Trophy, User, Info } from 'lucide-react';

interface MainMenuProps {
  currentUser: RedditUser;
  onFindMatch: () => void;
}

export function MainMenu({ currentUser, onFindMatch }: MainMenuProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const handleLeaderboard = (data: unknown) => {
      setLeaderboard(data as LeaderboardEntry[]);
    };

    devvitBridge.on('LEADERBOARD_DATA', handleLeaderboard);
    devvitBridge.getLeaderboard();

    return () => {
      devvitBridge.off('LEADERBOARD_DATA', handleLeaderboard);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{currentUser.username}</span>
        </div>
        <SoundToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {!showLeaderboard ? (
          <div className="text-center max-w-md w-full animate-fade-in">
            {/* Logo / Title */}
            <h1 className="game-title text-5xl md:text-6xl mb-3">MUUZAH</h1>
            <p className="text-muted-foreground mb-8">
              Battleship meets Mastermind
            </p>

            {/* Game Description */}
            <div className="bg-card border rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong className="text-foreground">Goal:</strong> Uncover opponent's tokens to score points while avoiding bombs.</p>
                  <p><strong className="text-foreground">Twist:</strong> Token values are randomized each game!</p>
                  <p><strong className="text-foreground">Win:</strong> Highest score when all tokens found, or opponent loses all 3 lives.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={onFindMatch}
                size="lg"
                className="w-full text-lg h-14"
              >
                <Play className="w-5 h-5 mr-2" />
                Find Match
              </Button>
              <Button
                onClick={() => setShowLeaderboard(true)}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Leaderboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">🏆 Leaderboard</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowLeaderboard(false)}
              >
                Back
              </Button>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <Leaderboard 
                entries={leaderboard} 
                currentUsername={currentUser.username} 
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t">
        A Reddit Devvit Game
      </footer>
    </div>
  );
}
