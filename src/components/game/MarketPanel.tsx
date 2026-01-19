import { ShapeValues, ColorMultipliers, SHAPES, COLORS } from '@/types/game';
import { TokenShape } from './TokenShape';

interface MarketPanelProps {
  shapeValues: ShapeValues;
  colorMultipliers: ColorMultipliers;
}

export function MarketPanel({ shapeValues, colorMultipliers }: MarketPanelProps) {
  // Sort shapes by value (highest first)
  const sortedShapes = [...SHAPES].sort(
    (a, b) => shapeValues[b] - shapeValues[a]
  );

  // Sort colors by multiplier (highest first)
  const sortedColors = [...COLORS].sort(
    (a, b) => colorMultipliers[b] - colorMultipliers[a]
  );

  return (
    <div className="market-panel space-y-4">
      <h3 className="text-base font-bold text-foreground">
        📊 Market Values
      </h3>

      {/* Shape Values */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Base Points
        </p>
        <div className="grid grid-cols-2 gap-2">
          {sortedShapes.map((shape) => (
            <div
              key={shape}
              className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
            >
              <TokenShape shape={shape} color="blue" size="sm" />
              <span className="text-sm capitalize text-foreground">{shape}</span>
              <span className="ml-auto font-bold text-primary">
                {shapeValues[shape]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Color Multipliers */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          Color Multipliers
        </p>
        <div className="grid grid-cols-2 gap-2">
          {sortedColors.map((color) => (
            <div
              key={color}
              className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/10"
                style={{
                  backgroundColor: `hsl(var(--token-${color}))`,
                }}
              />
              <span className="text-sm capitalize text-foreground">{color}</span>
              <span className="ml-auto font-bold text-accent">
                ×{colorMultipliers[color]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Formula explanation */}
      <div className="text-xs text-muted-foreground border-t border-border pt-3">
        <p className="font-semibold text-foreground mb-1">Score Formula:</p>
        <p className="font-mono bg-muted/50 px-2 py-1 rounded">Base × Multiplier</p>
      </div>
    </div>
  );
}
