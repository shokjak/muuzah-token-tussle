import { Cell } from '@/types/game';
import { TokenShape } from './TokenShape';
import { cn } from '@/lib/utils';
import { Bomb, X } from 'lucide-react';

interface GameCellProps {
  cell: Cell;
  x: number;
  y: number;
  onClick: (x: number, y: number) => void;
  isOwn: boolean;
  disabled?: boolean;
  showContent?: boolean;
}

export function GameCell({
  cell,
  x,
  y,
  onClick,
  isOwn,
  disabled,
  showContent = false,
}: GameCellProps) {
  const shouldShowContent = isOwn || cell.isRevealed || showContent;
  
  const getCellClass = () => {
    if (cell.isRevealed && cell.isBomb) return 'bomb';
    if (cell.isRevealed && cell.token) return 'hit';
    if (cell.isRevealed) return 'miss';
    return '';
  };

  return (
    <button
      onClick={() => onClick(x, y)}
      disabled={disabled || cell.isRevealed}
      className={cn(
        'grid-cell w-10 h-10 md:w-11 md:h-11',
        getCellClass(),
        disabled && !cell.isRevealed && 'opacity-60',
        cell.isRevealed && 'cursor-default'
      )}
      aria-label={`Cell ${String.fromCharCode(65 + x)}${y + 1}`}
    >
      {/* Show token if it's own grid OR if revealed (hit) */}
      {(isOwn || showContent || (cell.isRevealed && cell.token)) && cell.token && (
        <TokenShape
          shape={cell.token.shape}
          color={cell.token.color}
          size="md"
        />
      )}
      {/* Show bomb if it's own grid OR if revealed */}
      {(isOwn || showContent || cell.isRevealed) && cell.isBomb && !cell.token && (
        <Bomb className="w-5 h-5 text-destructive" />
      )}
      {/* Show X only for misses (revealed but no token and no bomb) */}
      {cell.isRevealed && !cell.token && !cell.isBomb && (
        <X className="w-4 h-4 text-muted-foreground opacity-40" />
      )}
    </button>
  );
}
