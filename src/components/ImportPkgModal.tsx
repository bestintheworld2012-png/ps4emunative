import React, { useState } from 'react';
import { PS4Game } from '../types';
import { X, Plus, Upload, Check } from 'lucide-react';

interface ImportPkgModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGame: (game: PS4Game) => void;
}

export const ImportPkgModal: React.FC<ImportPkgModalProps> = ({
  isOpen,
  onClose,
  onAddGame,
}) => {
  const [title, setTitle] = useState('');
  const [titleId, setTitleId] = useState('CUSA');
  const [region, setRegion] = useState<'USA' | 'EUR' | 'JPN' | 'GLOBAL'>('USA');
  const [sdkVersion, setSdkVersion] = useState('5.05');
  const [genre, setGenre] = useState('Action RPG');
  const [fpsTarget, setFpsTarget] = useState(60);
  const [fileSize, setFileSize] = useState('42.0 GB');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newGame: PS4Game = {
      id: `custom_${Date.now()}`,
      titleId: titleId.toUpperCase() || 'CUSA00001',
      title: title.trim(),
      region,
      version: '01.00',
      sdkVersion,
      fileSize,
      status: 'Playable',
      fpsTarget,
      // Default to high quality banner
      coverImage:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      developer: 'Imported Retail Disc / Digital Dump',
      genre,
      releaseYear: 2018,
      realWorldCompatibility: {
        testedOnWindows: true,
        nativeRunner: 'shadPS4',
        averageFps: '60 FPS Target',
        soundWorking: true,
        testedGpu: 'Vulkan 1.3 Compatible GPU',
        verifiedPlayable: true,
        notes: 'Custom retail/homebrew dump imported. Ready for native execution via generated Windows launcher script.',
      },
      patches: {
        fps60: true,
        resolution4k: true,
        chromaticAberrationDisabled: false,
        ultrawide: false,
      },
      gnmFeatures: ['Direct GNM Queue Dispatch', 'Vulkan 1.3 SPIR-V Shader Cache'],
    };

    onAddGame(newGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-sm font-bold text-white">Import PS4 Game / Decrypted PKG</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          <div>
            <label className="text-neutral-300 block mb-1 font-sans font-semibold">Game Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Shadow of the Colossus"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 block mb-1">Title ID (CUSA)</label>
              <input
                type="text"
                placeholder="CUSA08034"
                value={titleId}
                onChange={(e) => setTitleId(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 block mb-1">Orbis Firmware SDK</label>
              <select
                value={sdkVersion}
                onChange={(e) => setSdkVersion(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-blue-500"
              >
                <option value="4.05">4.05</option>
                <option value="4.50">4.50</option>
                <option value="5.05">5.05</option>
                <option value="6.72">6.72</option>
                <option value="9.00">9.00</option>
                <option value="11.00">11.00</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 block mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-blue-500"
              >
                <option value="USA">USA</option>
                <option value="EUR">EUR</option>
                <option value="JPN">JPN</option>
                <option value="GLOBAL">GLOBAL</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 block mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded text-[11px] text-neutral-400">
            <span className="text-blue-400 font-semibold">Native x86-64 Execution:</span> Ready to mount directly to host memory with 60 FPS patch preset applied.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-sans font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-sans font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Title</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
