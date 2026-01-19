import { Shape, TokenColor } from '@/types/game';
import { cn } from '@/lib/utils';

interface TokenShapeProps {
  shape: Shape;
  color: TokenColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap: Record<TokenColor, string> = {
  red: 'hsl(0, 85%, 55%)',
  blue: 'hsl(210, 100%, 55%)',
  green: 'hsl(145, 80%, 45%)',
  yellow: 'hsl(45, 100%, 55%)',
};

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function TokenShape({ shape, color, size = 'md', className }: TokenShapeProps) {
  const pixelSize = sizeMap[size];
  const fillColor = colorMap[color];
  
  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <circle
            cx={pixelSize / 2}
            cy={pixelSize / 2}
            r={pixelSize / 2 - 2}
            fill={fillColor}
            className="token-shape"
          />
        );
      case 'square':
        return (
          <rect
            x={2}
            y={2}
            width={pixelSize - 4}
            height={pixelSize - 4}
            fill={fillColor}
            className="token-shape"
          />
        );
      case 'triangle':
        const points = `${pixelSize / 2},2 ${pixelSize - 2},${pixelSize - 2} 2,${pixelSize - 2}`;
        return (
          <polygon
            points={points}
            fill={fillColor}
            className="token-shape"
          />
        );
      case 'star':
        const starPoints = generateStarPoints(pixelSize / 2, pixelSize / 2, 5, pixelSize / 2 - 2, (pixelSize / 2 - 2) / 2);
        return (
          <polygon
            points={starPoints}
            fill={fillColor}
            className="token-shape"
          />
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox={`0 0 ${pixelSize} ${pixelSize}`}
      className={cn('drop-shadow-lg', className)}
      style={{ filter: `drop-shadow(0 0 6px ${fillColor})` }}
    >
      {renderShape()}
    </svg>
  );
}

function generateStarPoints(
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): string {
  const points: string[] = [];
  const step = Math.PI / spikes;

  for (let i = 0; i < 2 * spikes; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(`${x},${y}`);
  }

  return points.join(' ');
}
