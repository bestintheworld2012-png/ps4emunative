import React, { useState } from 'react';
import {
  Download,
  Terminal,
  Cpu,
  FileCode,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Copy,
  Layers,
} from 'lucide-react';

export const WindowsSetupGuide: React.FC = () => {
  const [selectedBackend, setSelectedBackend] = useState<'Vulkan' | 'DX12'>('Vulkan');
  const [resolutionScale, setResolutionScale] = useState<'1.0' | '1.33' | '2.0'>('1.0');
  const [unlockedFps, setUnlockedFps] = useState(true);
  const [copiedScript, setCopiedScript] = useState(false);

  const generatedTomlConfig = `# OrbisX / shadPS4 Windows Native Configuration
# Auto-generated for Windows 10/11 x86-64

[General]
log_level = "Info"
language = "en-US"
enable_discord_rpc = true

[Graphics]
backend = "${selectedBackend}"
resolution_scale = ${resolutionScale}
vsync = ${unlockedFps ? 'false' : 'true'}
framerate_cap = ${unlockedFps ? '0' : '60'}
async_compute = true
anisotropic_filtering = 16
enable_hdr = false
dump_shaders = false

[CPU]
host_affinity = "Auto"
avx2_optimization = true
fma3_instructions = true
thread_count = 8

[Memory]
virtual_alloc_strategy = "DirectHostCommit"
unified_gddr5_emulation = "SharedVirtualMemory"
enable_resizable_bar = true

[Input]
controller_api = "XInput_DirectInput"
touchpad_emulation = true
gyro_motion = true
rumble_intensity = 1.0

[Audio]
backend = "WASAPI"
buffer_latency_ms = 15
`;

  const generatedBatchScript = `@echo off
title OrbisX Native PS4 Game Runner for Windows
echo ========================================================
echo  OrbisX: Executing PS4 Game Natively on Windows x86-64
echo ========================================================
echo Target Binary: eboot.bin
echo Graphics Driver: ${selectedBackend} 1.3
echo Framerate Unlock: ${unlockedFps ? '60+ FPS Active' : 'Locked 30/60 FPS'}
echo.

:: Ensure Vulkan runtime and High Performance GPU
set SHADPS4_ENABLE_VULKAN_VALIDATION=0
set VK_ICD_FILENAMES=
set AMD_VULKAN_ICD=
set __NV_PRIME_RENDER_OFFLOAD=1
set __GLX_VENDOR_LIBRARY_NAME=nvidia

:: Run native x86-64 translation executable
if exist "shadPS4.exe" (
    echo Starting native execution via shadPS4...
    start "" "shadPS4.exe" --game "%%~dp0eboot.bin" --config "config.toml"
) else if exist "fpPS4.exe" (
    echo Starting native execution via fpPS4...
    start "" "fpPS4.exe" -e "%%~dp0eboot.bin"
) else (
    echo [ERROR] Native runner binary (shadPS4.exe or fpPS4.exe) not found in directory!
    echo Please download the release binary from the links below and place it here.
    pause
)
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedBatchScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleDownloadToml = () => {
    const blob = new Blob([generatedTomlConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.toml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBatch = () => {
    const blob = new Blob([generatedBatchScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'run_ps4_game.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-neutral-950 p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Windows Native Execution Setup Guide
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Everything needed to run PlayStation 4 retail discs and homebrew natively on Windows 10 / 11 with 60 FPS
        </p>
      </div>

      {/* Explanation: Why PS4 runs natively on PC */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>The Technology: Why PS4 Runs Natively on Windows</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Unlike earlier consoles (such as PS3 with its complex Cell Broadband Engine CPU), the PlayStation 4 uses a standard <strong className="text-white">x86-64 AMD Jaguar</strong> CPU architecture. Because modern AMD Ryzen and Intel Core Windows processors use the exact same x86-64 instruction set, <span className="text-blue-400">no CPU emulation or slow dynamic recompilation is needed</span>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <div className="font-semibold text-white mb-1">1. Direct CPU Execution</div>
            <div className="text-neutral-400 text-[11px]">
              Host CPU runs game machine code directly with 0% CPU translation overhead.
            </div>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <div className="font-semibold text-white mb-1">2. Syscall Translation</div>
            <div className="text-neutral-400 text-[11px]">
              Orbis OS (FreeBSD) syscalls are hooked and mapped to Windows NT APIs in microseconds.
            </div>
          </div>
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
            <div className="font-semibold text-white mb-1">3. GNM ➔ Vulkan 1.3</div>
            <div className="text-neutral-400 text-[11px]">
              Sony GNM command buffers and GCN shaders translate into standard Vulkan SPIR-V pipelines.
            </div>
          </div>
        </div>
      </div>

      {/* Active Windows Native Open-Source Projects */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Leading Open-Source Windows Compatibility Layers</h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">Community Production Engines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">shadPS4</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                Playable 60FPS
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              The breakthrough modern C++ translation layer. Runs Bloodborne, Gravity Rush, Persona 5 Royal, Red Dead Redemption natively on Windows with Vulkan.
            </p>
            <div className="text-[11px] font-mono text-neutral-400 pt-1">
              Supports: Windows 10/11, AVX2, Vulkan 1.3
            </div>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">fpPS4</span>
              <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                150+ Games
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Written in Free Pascal. Lightweight native compatibility layer with an extensive compatibility list for commercial 2D and 3D titles.
            </p>
            <div className="text-[11px] font-mono text-neutral-400 pt-1">
              Supports: Pure Win32, Vulkan / Direct3D
            </div>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Spine & Kyty</span>
              <span className="text-xs font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                In Development
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Pioneering low-level translation layers focusing on libkernel ABI accuracy and SCE module reimplementation.
            </p>
            <div className="text-[11px] font-mono text-neutral-400 pt-1">
              Supports: Windows / Linux Wine compatibility
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Config & Batch Launcher Generator */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">One-Click Windows Launcher & Config Generator</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadToml}
              className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download config.toml</span>
            </button>
            <button
              onClick={handleDownloadBatch}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download run_game.bat</span>
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-neutral-400 block mb-1.5">Graphics Backend:</label>
            <div className="flex bg-neutral-900 border border-neutral-800 rounded p-0.5">
              {(['Vulkan', 'DX12'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBackend(b)}
                  className={`flex-1 py-1 rounded font-medium transition-colors ${
                    selectedBackend === b ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1.5">Internal Resolution Scale:</label>
            <div className="flex bg-neutral-900 border border-neutral-800 rounded p-0.5 font-mono">
              {[
                { label: '1080p (1.0x)', val: '1.0' },
                { label: '1440p (1.33x)', val: '1.33' },
                { label: '4K (2.0x)', val: '2.0' },
              ].map((r) => (
                <button
                  key={r.val}
                  onClick={() => setResolutionScale(r.val as any)}
                  className={`flex-1 py-1 rounded font-medium transition-colors text-[11px] ${
                    resolutionScale === r.val ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1.5">Framerate Mode:</label>
            <button
              onClick={() => setUnlockedFps(!unlockedFps)}
              className={`w-full py-1.5 px-3 rounded border font-medium transition-colors flex items-center justify-between ${
                unlockedFps
                  ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400'
              }`}
            >
              <span>{unlockedFps ? 'Unlocked 60+ FPS' : 'Locked 30/60 FPS'}</span>
              <CheckCircle className={`w-3.5 h-3.5 ${unlockedFps ? 'text-blue-400' : 'text-neutral-600'}`} />
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded p-3 font-mono text-[11px]">
            <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-1.5 mb-2">
              <span>config.toml (Settings)</span>
              <span className="text-blue-400">Ready</span>
            </div>
            <pre className="text-neutral-300 max-h-56 overflow-y-auto leading-relaxed">
              {generatedTomlConfig}
            </pre>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded p-3 font-mono text-[11px]">
            <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-1.5 mb-2">
              <span>run_game.bat (Windows Launcher)</span>
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 text-neutral-300 hover:text-white"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedScript ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-neutral-300 max-h-56 overflow-y-auto leading-relaxed">
              {generatedBatchScript}
            </pre>
          </div>
        </div>
      </div>

      {/* Step-by-Step Dumping Instructions */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>How to Dump Your PS4 Discs to Windows</span>
        </div>
        <div className="space-y-2 text-neutral-300 leading-relaxed">
          <p>
            1. Insert your original retail game disc into your PlayStation 4 console (Firmware 5.05, 9.00, or 11.00 with standard homebrew FTP enabled).
          </p>
          <p>
            2. Use <strong className="text-white">Itemzflow Game Dumper</strong> or the built-in payload dumper to export the game to an external USB 3.0 drive formatted as exFAT.
          </p>
          <p>
            3. Plug the drive into your Windows PC. You will have an extracted directory containing <code className="text-blue-400">eboot.bin</code>, <code className="text-blue-400">param.sfo</code>, and <code className="text-blue-400">sce_module/</code>.
          </p>
          <p>
            4. Place the generated <code className="text-blue-400">config.toml</code> and <code className="text-blue-400">run_game.bat</code> directly into the game folder, launch the runner, and play at 60 FPS!
          </p>
        </div>
      </div>
    </div>
  );
};
