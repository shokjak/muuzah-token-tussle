import { useState } from 'react';
import { GameState, Token, Cell } from '@/types/game';
import { GameGrid } from './GameGrid';
import { TokenPicker } from './TokenPicker';
import { MarketPanel } from './MarketPanel';
import { Button } from '@/components/ui/button';
import { countTokens, countBombs, isSetupComplete } from '@/utils/gameLogic';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface SetupPhaseProps {
  gameState: GameState;
  onPlaceToken: (x: number, y: number, token: Token | null, isBomb: boolean) => void;
  onConfirmSetup: () => void;
  onResetGrid: () => void;
}

export function SetupPhase({
  gameState,
  onPlaceToken,
  onConfirmSetup,
  onResetGrid,
}: SetupPhaseProps) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedBomb, setSelectedBomb] = useState(false);

  const isPlayer1 = gameState.phase === 'setup-p1';
  const currentPlayer = isPlayer1 ? gameState.player1 : gameState.player2;
  const grid = currentPlayer.grid;

  const tokensPlaced = countTokens(grid);
  const bombsPlaced = countBombs(grid);
  const setupComplete = isSetupComplete(
    grid,
    gameState.tokensPerPlayer,
    gameState.bombsPerPlayer
  );

  const handleCellClick = (x: number, y: number) => {
    const cell = grid[y][x];

    // If cell already has content, remove it
    if (cell.token || cell.isBomb) {
      onPlaceToken(x, y, null, false);
      return;
    }

    // Place selected token or bomb
    if (selectedToken && tokensPlaced < gameState.tokensPerPlayer) {
      onPlaceToken(x, y, selectedToken, false);
    } else if (selectedBomb && bombsPlaced < gameState.bombsPerPlayer) {
      onPlaceToken(x, y, null, true);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="game-title mb-2">MUUZAH</h1>
          <p className="text-xl text-muted-foreground">
            {isPlayer1 ? 'Player 1' : 'Player 2'} - Place Your Tokens
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ⚠️ {isPlayer1 ? 'Player 2' : 'Player 1'}, look away!
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Left Panel - Token Picker */}
          <div className="space-y-4">
            <TokenPicker
              selectedToken={selectedToken}
              selectedBomb={selectedBomb}
              onSelectToken={setSelectedToken}
              onSelectBomb={setSelectedBomb}
              tokensPlaced={tokensPlaced}
              bombsPlaced={bombsPlaced}
              tokensRequired={gameState.tokensPerPlayer}
              bombsRequired={gameState.bombsPerPlayer}
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
                className="flex-1 bg-primary hover:bg-primary/80"
              >
                Confirm
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Center - Grid */}
          <div className="flex justify-center">
            <div className="neon-border rounded-xl p-4 bg-card/50">
              <GameGrid
                grid={grid}
                onCellClick={handleCellClick}
                isOwn={true}
                showContent={true}
              />
            </div>
          </div>

          {/* Right Panel - Market Values */}
          <MarketPanel
            shapeValues={gameState.shapeValues}
            colorMultipliers={gameState.colorMultipliers}
          />
        </div>
      </div>
    </div>
  );
}
