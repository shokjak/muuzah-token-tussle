import { Shape, TokenColor } from '@/types/game';
import { cn } from '@/lib/utils';

interface TokenShapeProps {
  shape: Shape;
  color: TokenColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Clean, solid colors for better visibility
const colorMap: Record<TokenColor, string> = {
  red: 'hsl(0, 84%, 60%)',
  blue: 'hsl(217, 91%, 60%)',
  green: 'hsl(142, 71%, 45%)',
  yellow: 'hsl(45, 93%, 47%)',
};

const sizeMap = {
  sm: 18,
  md: 26,
  lg: 34,
};

export function TokenShape({ shape, color, size = 'md', className }: TokenShapeProps) {
  const pixelSize = sizeMap[size];
  const fillColor = colorMap[color];
  const strokeColor = 'rgba(0,0,0,0.15)';
  
  const renderShape = () => {
    const center = pixelSize / 2;
    const padding = 3;
    
    switch (shape) {
      case 'circle':
        return (
          <circle
            cx={center}
            cy={center}
            r={center - padding}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1"
          />
        );
      case 'square':
        return (
          <rect
            x={padding}
            y={padding}
            width={pixelSize - padding * 2}
            height={pixelSize - padding * 2}
            rx="2"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1"
          />
        );
      case 'triangle':
        const triPoints = `${center},${padding} ${pixelSize - padding},${pixelSize - padding} ${padding},${pixelSize - padding}`;
        return (
          <polygon
            points={triPoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1"
          />
        );
      case 'star':
        const starPoints = generateStarPoints(center, center, 5, center - padding, (center - padding) / 2.2);
        return (
          <polygon
            points={starPoints}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1"
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
      className={cn('flex-shrink-0', className)}
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
