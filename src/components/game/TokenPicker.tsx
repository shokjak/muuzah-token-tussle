import { Shape, TokenColor, Token, SHAPES, COLORS } from '@/types/game';
import { TokenShape } from './TokenShape';
import { cn } from '@/lib/utils';
import { Bomb } from 'lucide-react';

interface TokenPickerProps {
  selectedToken: Token | null;
  selectedBomb: boolean;
  onSelectToken: (token: Token | null) => void;
  onSelectBomb: (selected: boolean) => void;
  tokensPlaced: number;
  bombsPlaced: number;
  tokensRequired: number;
  bombsRequired: number;
}

export function TokenPicker({
  selectedToken,
  selectedBomb,
  onSelectToken,
  onSelectBomb,
  tokensPlaced,
  bombsPlaced,
  tokensRequired,
  bombsRequired,
}: TokenPickerProps) {
  const handleTokenClick = (shape: Shape, color: TokenColor) => {
    if (selectedBomb) onSelectBomb(false);
    
    if (
      selectedToken?.shape === shape &&
      selectedToken?.color === color
    ) {
      onSelectToken(null);
    } else {
      onSelectToken({ shape, color });
    }
  };

  const handleBombClick = () => {
    if (selectedToken) onSelectToken(null);
    onSelectBomb(!selectedBomb);
  };

  const tokensComplete = tokensPlaced >= tokensRequired;
  const bombsComplete = bombsPlaced >= bombsRequired;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">
          Select Token
        </h3>
        <div className="text-sm text-muted-foreground">
          <span className={cn(tokensComplete ? 'text-green-600' : 'text-primary')}>
            {tokensPlaced}
          </span>
          /{tokensRequired} tokens
          {' · '}
          <span className={cn(bombsComplete ? 'text-green-600' : 'text-destructive')}>
            {bombsPlaced}
          </span>
          /{bombsRequired} bombs
        </div>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-4 gap-2">
        {COLORS.map((color) =>
          SHAPES.map((shape) => {
            const isSelected =
              selectedToken?.shape === shape && selectedToken?.color === color;
            return (
              <button
                key={`${shape}-${color}`}
                onClick={() => handleTokenClick(shape, color)}
                disabled={tokensComplete && !isSelected}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all flex items-center justify-center',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50',
                  tokensComplete && !isSelected && 'opacity-40 cursor-not-allowed'
                )}
              >
                <TokenShape shape={shape} color={color} size="md" />
              </button>
            );
          })
        )}
      </div>

      {/* Bomb Selector */}
      <button
        onClick={handleBombClick}
        disabled={bombsComplete && !selectedBomb}
        className={cn(
          'w-full p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2',
          selectedBomb
            ? 'border-destructive bg-destructive/10'
            : 'border-border bg-card hover:border-destructive/50',
          bombsComplete && !selectedBomb && 'opacity-40 cursor-not-allowed'
        )}
      >
        <Bomb className="w-5 h-5 text-destructive" />
        <span className="font-semibold text-destructive">Place Bomb</span>
      </button>

      <p className="text-xs text-muted-foreground text-center">
        Click a token/bomb, then click on the grid to place it. Click a placed item to remove it.
      </p>
    </div>
  );
}
