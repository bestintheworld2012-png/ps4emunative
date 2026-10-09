import React, { useState } from 'react';
import { SAMPLE_PKG_METADATA } from '../data/mockData';
import { PkgFileMetadata } from '../types';
import {
  Package,
  Upload,
  FileCheck,
  CheckCircle2,
  Lock,
  Unlock,
  FolderTree,
  Download,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const PkgInspector: React.FC = () => {
  const [currentPkg, setCurrentPkg] = useState<PkgFileMetadata>(SAMPLE_PKG_METADATA);
  const [selectedEntry, setSelectedEntry] = useState<string>('eboot.bin');
  const [isDragOver, setIsDragOver] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate inspection of uploaded package
    const customPkg: PkgFileMetadata = {
      fileName: file.name,
      fileSize: file.size,
      magic: '0x7F434E54 (CNT)',
      pkgType: 'PlayStation 4 Digital Package (Retail Patched)',
      contentId: `UP0001-${file.name.substring(0, 9).toUpperCase()}_00-ORBIS00000`,
      titleId: file.name.substring(0, 9).toUpperCase() || 'CUSA09999',
      titleName: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      appVersion: '01.00',
      requiredFirmware: '09.000.000',
      pfsBlocks: Math.floor(file.size / (16 * 1024)),
      entryCount: 12,
      isDecrypted: true,
      entries: [
        { name: 'param.sfo', offset: '0x00001000', size: '2,048 B', type: 'System Properties' },
        { name: 'icon0.png', offset: '0x00001800', size: '256,000 B', type: 'Display Box Art' },
        { name: 'eboot.bin', offset: '0x0004E000', size: '36,864,000 B', type: 'Signed ELF x86-64' },
        { name: 'sce_module/libkernel.sprx', offset: '0x0286A000', size: '204,800 B', type: 'Sony PRX Library' },
        { name: 'sce_module/libSceGnmDriver.sprx', offset: '0x0289D000', size: '1,048,576 B', type: 'GCN Graphics Runtime' },
        { name: 'data0.dat', offset: '0x02A00000', size: `${(file.size * 0.9).toFixed(0)} B`, type: 'PFS Encrypted Assets' },
      ],
    };

    setCurrentPkg(customPkg);
    setNotification(`Successfully parsed PKG header for ${file.name}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportDecrypted = () => {
    const fakeData = JSON.stringify(currentPkg, null, 2);
    const blob = new Blob([fakeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPkg.titleId}_manifest.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification(`Exported decrypted package manifest for ${currentPkg.titleId}`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">PKG, SFO & ELF Decryptor</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Inspect PlayStation 4 package headers, PFS filesystem boundaries, and executable symbol imports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Open Local .PKG / .BIN</span>
            <input
              type="file"
              accept=".pkg,.bin,.elf,.sfo"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportDecrypted}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Manifest</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="mx-6 mt-4 p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-md text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Split Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-6 gap-6">
        {/* Left: Package Headers & Properties */}
        <div className="flex-1 flex flex-col space-y-5 overflow-y-auto pr-2">
          {/* File Drag & Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) {
                // mock parse
                setNotification(`Loaded dropped file: ${file.name}`);
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-950/20'
                : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-700'
            }`}
          >
            <Package className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-xs font-semibold text-white">
              Drop PlayStation 4 .PKG, .ELF, or param.sfo file
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Supports Retail, Fake PKG (FPKG), and Homebrew SELF executables
            </div>
          </div>

          {/* Core Properties Card */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Package Manifest Header</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400">PFS Status:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  Decrypted
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs font-mono">
              <div>
                <span className="text-neutral-400 block text-[11px]">Title Name:</span>
                <span className="text-white font-sans font-semibold">{currentPkg.titleName}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Title ID (CUSA):</span>
                <span className="text-blue-400 font-bold">{currentPkg.titleId}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Content ID:</span>
                <span className="text-neutral-200 text-[11px] break-all">{currentPkg.contentId}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Target App Version:</span>
                <span className="text-neutral-200">v{currentPkg.appVersion}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Required Orbis Firmware:</span>
                <span className="text-amber-400">{currentPkg.requiredFirmware}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[11px]">Magic Bytes:</span>
                <span className="text-neutral-200">{currentPkg.magic}</span>
              </div>
            </div>
          </div>

          {/* param.sfo key-value dump */}
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-sans text-white">param.sfo System Table</h3>
              </div>
              <span className="text-neutral-400 text-[11px]">UTF-8 String Table</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">CATEGORY</span>
                <span className="text-neutral-200">gd (Game Digital)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">ATTRIBUTE</span>
                <span className="text-neutral-200">0x0000000000000001 (Requires HDD)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">PUBTOOLINFO</span>
                <span className="text-neutral-200">c_date=20150918,sdk_ver=02508101</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">RESOLUTIONS</span>
                <span className="text-neutral-200">1080p, 1440p (Pro), 2160p (Scaled)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Inner PFS Entry Tree & Symbol Resolver */}
        <div className="w-full lg:w-[480px] bg-neutral-900/40 border border-neutral-800 rounded-lg flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">PFS Partition Table ({currentPkg.entries.length} entries)</h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {currentPkg.pfsBlocks.toLocaleString()} Blocks
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/80">
            {currentPkg.entries.map((entry) => {
              const isSelected = selectedEntry === entry.name;
              return (
                <div
                  key={entry.name}
                  onClick={() => setSelectedEntry(entry.name)}
                  className={`p-3 text-xs font-mono cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-950/40 text-blue-300'
                      : 'hover:bg-neutral-800/50 text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <span>{entry.name}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Type: {entry.type} · Offset: {entry.offset}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 tabular-nums">{entry.size}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Symbol Preview for eboot.bin / sprx */}
          <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-300">
              Selected Symbol Relocations: <code className="text-blue-400">{selectedEntry}</code>
            </div>
            <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1">
              <div>Import: <span className="text-emerald-400">libkernel::sceKernelAllocateDirectMemory</span></div>
              <div>Import: <span className="text-emerald-400">libSceGnmDriver::sceGnmDrawIndexAuto</span></div>
              <div>Import: <span className="text-emerald-400">libScePad::scePadRead</span></div>
              <div>Status: <span className="text-blue-400">Mapped 1:1 to Windows NT/Win32 Host Calls</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
