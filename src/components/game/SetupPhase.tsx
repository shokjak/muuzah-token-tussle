import { useState } from 'react';
import { Cell, Token, ShapeValues, ColorMultipliers, RedditUser } from '@/types/game';
import { GameGrid } from './GameGrid';
import { TokenPicker } from './TokenPicker';
import { MarketPanel } from './MarketPanel';
import { SoundToggle } from './SoundToggle';
import { Button } from '@/components/ui/button';
import { countTokens, countBombs, isSetupComplete, createEmptyGrid } from '@/utils/gameLogic';
import { soundManager } from '@/utils/soundManager';
import { ArrowRight, RotateCcw, User } from 'lucide-react';

interface SetupPhaseProps {
  currentUser: RedditUser;
  grid: Cell[][];
  shapeValues: ShapeValues;
  colorMultipliers: ColorMultipliers;
  tokensRequired: number;
  bombsRequired: number;
  gridSize: number;
  onPlaceToken: (x: number, y: number, token: Token | null, isBomb: boolean) => void;
  onConfirmSetup: () => void;
  onResetGrid: () => void;
}

export function SetupPhase({
  currentUser,
  grid,
  shapeValues,
  colorMultipliers,
  tokensRequired,
  bombsRequired,
  gridSize,
  onPlaceToken,
  onConfirmSetup,
  onResetGrid,
}: SetupPhaseProps) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedBomb, setSelectedBomb] = useState(false);

  const tokensPlaced = countTokens(grid);
  const bombsPlaced = countBombs(grid);
  const setupComplete = isSetupComplete(grid, tokensRequired, bombsRequired);

  const handleCellClick = (x: number, y: number) => {
    const cell = grid[y][x];

    // If cell already has content, remove it
    if (cell.token || cell.isBomb) {
      onPlaceToken(x, y, null, false);
      soundManager.playPlace();
      return;
    }

    // Place selected token or bomb
    if (selectedToken && tokensPlaced < tokensRequired) {
      onPlaceToken(x, y, selectedToken, false);
      soundManager.playPlace();
    } else if (selectedBomb && bombsPlaced < bombsRequired) {
      onPlaceToken(x, y, null, true);
      soundManager.playPlace();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="game-title text-2xl md:text-3xl mb-1">MUUZAH</h1>
            <p className="text-muted-foreground">Place your tokens strategically</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{currentUser.username}</span>
            </div>
            <SoundToggle />
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr_280px] gap-6 items-start">
          {/* Left Panel - Token Picker */}
          <div className="space-y-4 order-2 lg:order-1">
            <TokenPicker
              selectedToken={selectedToken}
              selectedBomb={selectedBomb}
              onSelectToken={setSelectedToken}
              onSelectBomb={setSelectedBomb}
              tokensPlaced={tokensPlaced}
              bombsPlaced={bombsPlaced}
              tokensRequired={tokensRequired}
              bombsRequired={bombsRequired}
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onResetGrid}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={onConfirmSetup}
                disabled={!setupComplete}
                className="flex-1"
              >
                Confirm
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Center - Grid */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="bg-card rounded-xl p-4 border shadow-sm">
              <GameGrid
                grid={grid}
                onCellClick={handleCellClick}
                isOwn={true}
                showContent={true}
              />
            </div>
          </div>

          {/* Right Panel - Market Values */}
          <div className="order-3">
            <MarketPanel
              shapeValues={shapeValues}
              colorMultipliers={colorMultipliers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
