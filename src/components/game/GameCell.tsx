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
        'grid-cell w-10 h-10 md:w-12 md:h-12',
        getCellClass(),
        disabled && 'cursor-not-allowed opacity-50',
        cell.isRevealed && 'cursor-default'
      )}
      aria-label={`Cell ${String.fromCharCode(65 + x)}${y + 1}`}
    >
      {shouldShowContent && cell.token && (
        <TokenShape
          shape={cell.token.shape}
          color={cell.token.color}
          size="md"
        />
      )}
      {shouldShowContent && cell.isBomb && !cell.token && (
        <Bomb className="w-6 h-6 text-destructive animate-float" />
      )}
      {cell.isRevealed && !cell.token && !cell.isBomb && (
        <X className="w-5 h-5 text-muted-foreground opacity-50" />
      )}
    </button>
  );
}
