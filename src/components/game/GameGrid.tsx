import { Cell } from '@/types/game';
import { GameCell } from './GameCell';

interface GameGridProps {
  grid: Cell[][];
  onCellClick: (x: number, y: number) => void;
  isOwn: boolean;
  disabled?: boolean;
  showContent?: boolean;
}

export function GameGrid({
  grid,
  onCellClick,
  isOwn,
  disabled,
  showContent,
}: GameGridProps) {
  const size = grid.length;
  const letters = Array.from({ length: size }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  return (
    <div className="inline-block">
      {/* Column headers */}
      <div className="flex mb-1">
        <div className="w-6 h-6" /> {/* Corner spacer */}
        {letters.map((letter) => (
          <div
            key={letter}
            className="w-10 h-6 md:w-12 flex items-center justify-center text-sm font-bold text-muted-foreground"
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {grid.map((row, y) => (
        <div key={y} className="flex">
          {/* Row number */}
          <div className="w-6 h-10 md:h-12 flex items-center justify-center text-sm font-bold text-muted-foreground">
            {y + 1}
          </div>
          
          {/* Cells */}
          <div className="flex gap-0.5">
            {row.map((cell, x) => (
              <GameCell
                key={`${x}-${y}`}
                cell={cell}
                x={x}
                y={y}
                onClick={onCellClick}
                isOwn={isOwn}
                disabled={disabled}
                showContent={showContent}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
