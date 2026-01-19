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
        <div className="w-5 h-5" /> {/* Corner spacer */}
        <div className="flex gap-1">
          {letters.map((letter) => (
            <div
              key={letter}
              className="w-10 h-5 md:w-11 flex items-center justify-center text-xs font-semibold text-muted-foreground"
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* Grid rows */}
      <div className="flex flex-col gap-1">
        {grid.map((row, y) => (
          <div key={y} className="flex gap-1">
            {/* Row number */}
            <div className="w-5 h-10 md:h-11 flex items-center justify-center text-xs font-semibold text-muted-foreground">
              {y + 1}
            </div>
            
            {/* Cells */}
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
        ))}
      </div>
    </div>
  );
}
