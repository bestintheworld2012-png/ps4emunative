import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GameLibrary } from './components/GameLibrary';
import { NativeRunnerSandbox } from './components/NativeRunnerSandbox';
import { PkgInspector } from './components/PkgInspector';
import { WindowsSetupGuide } from './components/WindowsSetupGuide';
import { HardwareBenchmark } from './components/HardwareBenchmark';
import { ControllerStudio } from './components/ControllerStudio';
import { ImportPkgModal } from './components/ImportPkgModal';
import { INITIAL_GAMES } from './data/mockData';
import { PS4Game } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('library');
  const [games, setGames] = useState<PS4Game[]>(INITIAL_GAMES);
  const [runningGame, setRunningGame] = useState<PS4Game>(INITIAL_GAMES[0]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Toggle patch flags for a specific title
  const handleTogglePatch = (gameId: string, patchKey: keyof PS4Game['patches']) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === gameId) {
          return {
            ...g,
            patches: {
              ...g.patches,
              [patchKey]: !g.patches[patchKey],
            },
          };
        }
        return g;
      })
    );
  };

  // Launch game in sandbox
  const handleLaunchGame = (game: PS4Game) => {
    setRunningGame(game);
    setActiveTab('sandbox');
  };

  // Quick run from header (Bloodborne by default)
  const handleQuickRun = () => {
    const bloodborne = games.find((g) => g.id === 'bloodborne') || games[0];
    setRunningGame(bloodborne);
    setActiveTab('sandbox');
  };

  // Inspect PKG
  const handleInspectPkg = (game: PS4Game) => {
    setActiveTab('pkg');
  };

  // Add imported title
  const handleAddGame = (newGame: PS4Game) => {
    setGames((prev) => [newGame, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Strict 3-zone Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickRun={handleQuickRun}
      />

      {/* Main Workspace: Sidebar + Dynamic Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          gameCount={games.length}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
          {activeTab === 'library' && (
            <GameLibrary
              games={games}
              onLaunchGame={handleLaunchGame}
              onInspectPkg={handleInspectPkg}
              onTogglePatch={handleTogglePatch}
              onAddCustomGame={() => setIsImportModalOpen(true)}
            />
          )}

          {activeTab === 'sandbox' && (
            <NativeRunnerSandbox
              game={runningGame}
              onBackToLibrary={() => setActiveTab('library')}
              onOpenSetupGuide={() => setActiveTab('setup')}
            />
          )}

          {activeTab === 'pkg' && <PkgInspector />}

          {activeTab === 'setup' && <WindowsSetupGuide />}

          {activeTab === 'hardware' && <HardwareBenchmark />}

          {activeTab === 'controller' && <ControllerStudio />}
        </main>
      </div>

      {/* Import Custom Title Modal */}
      <ImportPkgModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onAddGame={handleAddGame}
      />
    </div>
  );
}
