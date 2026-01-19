import { Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WaitingScreenProps {
  type: 'matchmaking' | 'opponent-setup' | 'opponent-turn';
  onCancel?: () => void;
}

export function WaitingScreen({ type, onCancel }: WaitingScreenProps) {
  const content = {
    matchmaking: {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: 'Finding Opponent',
      description: 'Searching for another player in the queue...',
      showCancel: true,
    },
    'opponent-setup': {
      icon: <Loader2 className="w-12 h-12 text-primary animate-spin" />,
      title: 'Waiting for Opponent',
      description: 'Your opponent is placing their tokens and bombs...',
      showCancel: false,
    },
    'opponent-turn': {
      icon: <Loader2 className="w-12 h-12 text-primary animate-spin" />,
      title: "Opponent's Turn",
      description: "Waiting for your opponent to make their move...",
      showCancel: false,
    },
  }[type];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="mb-6 animate-fade-in">
        {content.icon}
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {content.title}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {content.description}
      </p>
      {content.showCancel && onCancel && (
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
