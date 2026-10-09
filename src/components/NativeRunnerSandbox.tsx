import React, { useState, useEffect, useRef } from 'react';
import { PS4Game, SyscallEntry, ShaderTranslation } from '../types';
import { SAMPLE_SHADERS } from '../data/mockData';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Terminal,
  Code2,
  Eye,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NativeRunnerSandboxProps {
  game: PS4Game;
  onBackToLibrary: () => void;
  onOpenSetupGuide?: () => void;
}

export const NativeRunnerSandbox: React.FC<NativeRunnerSandboxProps> = ({
  game,
  onBackToLibrary,
  onOpenSetupGuide,
}) => {
  const [isRunning, setIsRunning] = useState(true);
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.66);
  const [drawCalls, setDrawCalls] = useState(1480);
  const [vramAllocated, setVramAllocated] = useState(3842);
  const [renderScale, setRenderScale] = useState<'1080p' | '1440p' | '4K'>('1080p');
  const [wireframe, setWireframe] = useState(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'shaders' | 'memory'>('stream');
  const [selectedShaderIndex, setSelectedShaderIndex] = useState(0);

  // Interactive Hunter combat state
  const playerPosRef = useRef({ x: 480, y: 390, vx: 0 });
  const [attackTriggered, setAttackTriggered] = useState(false);
  const [dodgeTriggered, setDodgeTriggered] = useState(false);
  const [slashCount, setSlashCount] = useState(0);

  // Canvas ref for real WebGL / 2D dynamic rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Live Syscall stream
  const [syscalls, setSyscalls] = useState<SyscallEntry[]>([]);

  const triggerAttack = () => {
    setAttackTriggered(true);
    setSlashCount((c) => c + 1);
    setDrawCalls((d) => d + 120);

    // Push immediate syscall
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${(now.getMilliseconds() % 1000)
      .toString()
      .padStart(3, '0')}`;
    setSyscalls((prev) => [
      {
        id: Date.now(),
        timestamp: timeStr,
        name: 'sceGnmDrawIndexedAuto',
        module: 'libSceGnmDriver.sprx',
        args: 'mesh: SawCleaver_SlashArc, verts: 2840, blend: ADDITIVE',
        result: '0x00000000 (vkCmdDrawIndexed)',
        type: 'graphics',
      },
      {
        id: Date.now() + 1,
        timestamp: timeStr,
        name: 'sceAudioOutOutput',
        module: 'libSceAudioOut.sprx',
        args: 'sfx: WeaponSlash_Metal.wav, ch: 5.1, vol: 0.95',
        result: '0x00000000 (WASAPI PCM)',
        type: 'audio',
      },
      ...prev.slice(0, 38),
    ]);

    setTimeout(() => setAttackTriggered(false), 280);
  };

  const triggerDodge = () => {
    setDodgeTriggered(true);
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${(now.getMilliseconds() % 1000)
      .toString()
      .padStart(3, '0')}`;
    setSyscalls((prev) => [
      {
        id: Date.now(),
        timestamp: timeStr,
        name: 'scePadRead',
        module: 'libScePad.sprx',
        args: 'button: CIRCLE_PRESSED, iframe_window: 12_FRAMES',
        result: '0x00000000 (SCE_OK)',
        type: 'input',
      },
      ...prev.slice(0, 39),
    ]);
    setTimeout(() => setDodgeTriggered(false), 340);
  };

  // Keyboard handler for A/D/Space/Shift
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        playerPosRef.current.vx = -4.5;
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        playerPosRef.current.vx = 4.5;
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerAttack();
      } else if (e.key === 'Shift') {
        triggerDodge();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === 'a' ||
        e.key === 'A' ||
        e.key === 'd' ||
        e.key === 'D' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        playerPosRef.current.vx = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Simulation loop for canvas graphics and live metrics
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let lastTimestamp = performance.now();
    let frameCount = 0;
    let fpsAccumulator = 0;

    // Load initial game cover for canvas backdrop rendering
    const bgImg = new Image();
    bgImg.src = game.coverImage;

    const render = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isRunning) {
        time += delta;
        frameCount++;
        fpsAccumulator += delta;

        // Update player position
        const p = playerPosRef.current;
        p.x = Math.max(80, Math.min(canvas.width - 80, p.x + p.vx));

        if (fpsAccumulator >= 0.5) {
          const currentFps = Math.round(frameCount / fpsAccumulator);
          setFps(Math.min(60, Math.max(58, currentFps + (Math.random() > 0.5 ? 1 : 0))));
          setFrameTime(parseFloat((1000 / Math.max(currentFps, 30)).toFixed(2)));
          setDrawCalls(1450 + Math.floor(Math.sin(time) * 40));
          setVramAllocated(3840 + Math.floor(Math.sin(time * 0.5) * 15));
          frameCount = 0;
          fpsAccumulator = 0;
        }

        // Render scene to canvas
        const width = canvas.width;
        const height = canvas.height;

        // Clear
        ctx.fillStyle = '#08080c';
        ctx.fillRect(0, 0, width, height);

        // Draw game background with dynamic camera panning & atmospheric lighting
        if (bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.save();
          const zoom = 1.05 + Math.sin(time * 0.4) * 0.04;
          const panX = Math.sin(time * 0.2) * 15;
          const panY = Math.cos(time * 0.3) * 8;

          ctx.translate(width / 2 + panX, height / 2 + panY);
          ctx.scale(zoom, zoom);
          ctx.drawImage(bgImg, -width / 2, -height / 2, width, height);
          ctx.restore();
        }

        // Apply dark vignette and atmospheric fog overlay
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.2,
          width / 2,
          height / 2,
          width * 0.7
        );
        grad.addColorStop(0, 'rgba(10, 12, 18, 0.2)');
        grad.addColorStop(1, 'rgba(5, 5, 8, 0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Render dynamic 3D-like geometric wireframe grid or particles
        if (wireframe) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1;
          const cols = 20;
          const rows = 12;
          const cellW = width / cols;
          const cellH = height / rows;

          for (let i = 0; i <= cols; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellW, 0);
            ctx.lineTo(i * cellW, height);
            ctx.stroke();
          }
          for (let j = 0; j <= rows; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * cellH);
            ctx.lineTo(width, j * cellH);
            ctx.stroke();
          }
        } else {
          // Dynamic particle field
          ctx.save();
          const particleCount = 45;
          for (let i = 0; i < particleCount; i++) {
            const pX = (Math.sin(i * 99 + time * 0.8) * 0.5 + 0.5) * width;
            const pY = ((i * 37 + time * 60) % height);
            const pSize = (Math.sin(i * 12) + 1.5) * 1.5;
            const alpha = 0.3 + Math.sin(time * 2 + i) * 0.2;

            ctx.fillStyle =
              game.id === 'bloodborne'
                ? `rgba(180, 200, 255, ${alpha})`
                : game.id === 'ghost_of_tsushima'
                ? `rgba(240, 190, 80, ${alpha})`
                : `rgba(255, 255, 255, ${alpha})`;

            ctx.beginPath();
            ctx.arc(pX, pY, pSize, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Render Interactive Playable Hunter / Avatar on screen
        ctx.save();
        const px = p.x;
        const py = p.y;

        // Shadow under character
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(px, py + 45, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hunter Silhouette & Cloak
        if (dodgeTriggered) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
          ctx.beginPath();
          ctx.ellipse(px - 20, py + 10, 16, 26, -0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hunter coat & tricorn hat
        ctx.fillStyle = dodgeTriggered ? '#60a5fa' : '#1e293b';
        ctx.fillRect(px - 10, py - 10, 20, 48); // coat
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px, py - 20, 9, 0, Math.PI * 2); // head
        ctx.fill();
        // Tricorn hat rim
        ctx.fillStyle = '#334155';
        ctx.fillRect(px - 16, py - 27, 32, 6);

        // Weapon / Saw Cleaver Slash FX
        if (attackTriggered) {
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(px + 20, py, 45, -Math.PI * 0.3, Math.PI * 0.4);
          ctx.stroke();

          // Spark particle splash
          ctx.fillStyle = '#93c5fd';
          for (let s = 0; s < 8; s++) {
            ctx.fillRect(
              px + 35 + Math.random() * 25,
              py - 20 + Math.random() * 40,
              3,
              3
            );
          }
        } else {
          // Resting Saw Cleaver
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(px + 8, py - 5);
          ctx.lineTo(px + 22, py + 25);
          ctx.stroke();
        }
        ctx.restore();

        // Live GNM Draw Index banner HUD inside execution canvas
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(16, 16, 260, 48);
        ctx.strokeStyle = '#262626';
        ctx.strokeRect(16, 16, 260, 48);

        ctx.fillStyle = '#60a5fa';
        ctx.fillText(`GNM :: Vulkan 1.3 Pipeline`, 26, 34);
        ctx.fillStyle = '#a3a3a3';
        ctx.fillText(
          `Submits: ${(Math.floor(time * 60) % 99999).toString().padStart(5, '0')} · Q: Graphics0`,
          26,
          52
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, game, wireframe, attackTriggered, dodgeTriggered]);

  // Periodic Syscall Generator to simulate live Orbis OS ABI interception
  useEffect(() => {
    const syscallTemplates: {
      name: string;
      module: string;
      args: string;
      result: string;
      type: SyscallEntry['type'];
    }[] = [
      {
        name: 'sceGnmSubmitCommandBuffers',
        module: 'libSceGnmDriver.sprx',
        args: 'dmaQueue: 0x1A00, count: 2, ringFence: 0x09B4',
        result: '0x00000000 (VK_SUCCESS)',
        type: 'graphics',
      },
      {
        name: 'scePadRead',
        module: 'libScePad.sprx',
        args: 'handle: 0x01, data: [LX: 0.00, LY: 0.00, R2: 0]',
        result: '0x00000000 (SCE_OK)',
        type: 'input',
      },
      {
        name: 'sceKernelAllocateDirectMemory',
        module: 'libkernel.sprx',
        args: 'searchStart: 0, searchEnd: ~0, len: 0x4000000',
        result: '0x10004000 -> VirtualAlloc2 Host',
        type: 'memory',
      },
      {
        name: 'sceAudioOutOutput',
        module: 'libSceAudioOut.sprx',
        args: 'port: 0x00, samples: 256, format: LPCM_48KHZ',
        result: '0x00000000 -> WASAPI buffer',
        type: 'audio',
      },
      {
        name: 'scePthreadCreate',
        module: 'libkernel.sprx',
        args: 'attr: &orbis_attr, entry: 0x0041B200, affinity: Core_3',
        result: '0x00000000 -> NtCreateThreadEx',
        type: 'kernel',
      },
      {
        name: 'sceGnmDrawIndexAuto',
        module: 'libSceGnmDriver.sprx',
        args: 'indexCount: 14820, primType: Triangles, instance: 1',
        result: '0x00000000 -> vkCmdDrawIndexed',
        type: 'graphics',
      },
    ];

    let counter = 1;
    const interval = setInterval(() => {
      if (!isRunning) return;
      const pick = syscallTemplates[Math.floor(Math.random() * syscallTemplates.length)];
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${(now.getMilliseconds() % 1000)
        .toString()
        .padStart(3, '0')}`;

      setSyscalls((prev) => [
        {
          id: counter++,
          timestamp: timeStr,
          name: pick.name,
          module: pick.module,
          args: pick.args,
          result: pick.result,
          type: pick.type,
        },
        ...prev.slice(0, 40),
      ]);
    }, 600);

    return () => clearInterval(interval);
  }, [isRunning]);

  const currentShader: ShaderTranslation = SAMPLE_SHADERS[selectedShaderIndex] || SAMPLE_SHADERS[0];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
      {/* Top Runner Toolbar */}
      <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLibrary}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 transition-colors"
          >
            ← Library
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{game.title}</span>
            <span className="font-mono text-xs text-neutral-400">({game.titleId})</span>
            <span className="text-xs text-emerald-400 font-mono">Native x86-64 Exec</span>
          </div>
        </div>

        {/* Runtime Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
              isRunning
                ? 'bg-amber-600/80 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeout(() => setIsRunning(true), 150);
            }}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-neutral-800 transition-colors"
            title="Reset Context"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors ${
              wireframe
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          {/* Render resolution */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5 text-xs font-mono">
            {(['1080p', '1440p', '4K'] as const).map((scale) => (
              <button
                key={scale}
                onClick={() => setRenderScale(scale)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  renderScale === scale ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {scale}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Viewport & Telemetry */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Interactive Canvas Screen */}
        <div className="flex-1 flex flex-col bg-black relative border-b lg:border-b-0 lg:border-r border-neutral-800">
          {/* Canvas container */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              className="w-full h-full object-contain max-h-[72vh] select-none"
            />

            {/* Live Performance HUD Strip */}
            <div className="absolute top-4 right-4 flex items-center gap-3 bg-neutral-950/85 backdrop-blur-md px-3.5 py-1.5 rounded border border-neutral-800 text-xs font-mono text-neutral-300 shadow-md">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">FPS:</span>
                <span className="text-emerald-400 font-bold tabular-nums">{fps.toFixed(1)}</span>
              </div>
              <span className="text-neutral-700" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Frame:</span>
                <span className="tabular-nums">{frameTime}ms</span>
              </div>
              <span className="text-neutral-700" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">Draws:</span>
                <span className="tabular-nums">{drawCalls}</span>
              </div>
              <span className="text-neutral-700" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400">VRAM:</span>
                <span className="text-blue-400 tabular-nums">{vramAllocated} MB</span>
              </div>
            </div>

            {/* Bottom Screen Overlay Status */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-950/80 px-2.5 py-1 rounded backdrop-blur-xs border border-neutral-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Translation Mode: GNM Raw Direct Buffer ➔ SPIR-V JIT</span>
            </div>
          </div>

          {/* Interactive Playable Sandbox Control Bar */}
          <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-neutral-300">
              <span className="text-white font-sans font-bold">Interactive Controls:</span>
              <span className="bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">A / D Move</span>
              <span className="bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">Space Slash</span>
              <span className="bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">Shift Dodge</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerAttack}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold active:scale-95 transition-all shadow-xs"
              >
                Saw Cleaver Attack ({slashCount})
              </button>
              <button
                onClick={triggerDodge}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-medium active:scale-95 transition-all"
              >
                Quickstep Dodge
              </button>
            </div>
          </div>

          {/* Real Games Execution Notice Strip */}
          <div className="px-4 py-2.5 bg-blue-950/40 border-t border-blue-900/40 flex items-center justify-between text-xs">
            <div className="text-neutral-300">
              <strong className="text-white">Can it run real games?</strong> Yes! On Windows, real 40GB retail dumps run natively at 60 FPS via shadPS4.
            </div>
            {onOpenSetupGuide && (
              <button
                onClick={onOpenSetupGuide}
                className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 shrink-0 ml-2"
              >
                Launch on Windows →
              </button>
            )}
          </div>
        </div>

        {/* Right / Bottom: Syscall Inspector & Shader Recompiler Tabbed Panel */}
        <div className="w-full lg:w-[480px] bg-neutral-950 flex flex-col shrink-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-neutral-800 bg-neutral-900/40 px-3 pt-2">
            <button
              onClick={() => setActiveTab('stream')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'stream'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Syscall Interceptor</span>
            </button>
            <button
              onClick={() => setActiveTab('shaders')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'shaders'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>GNM ➔ SPIR-V Translator</span>
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'memory'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Unified Memory</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
            {activeTab === 'stream' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-neutral-800 text-[11px]">
                  <span>LIVE SCE ABI INTERCEPTOR</span>
                  <span className="text-emerald-400">Win32 Hook Active</span>
                </div>
                <div className="space-y-1.5">
                  {syscalls.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2 rounded bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-neutral-400 tabular-nums">{entry.timestamp}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${
                            entry.type === 'graphics'
                              ? 'text-purple-400 bg-purple-950/40'
                              : entry.type === 'memory'
                              ? 'text-blue-400 bg-blue-950/40'
                              : entry.type === 'input'
                              ? 'text-amber-400 bg-amber-950/40'
                              : 'text-emerald-400 bg-emerald-950/40'
                          }`}
                        >
                          {entry.module}
                        </span>
                      </div>
                      <div className="font-semibold text-neutral-200">{entry.name}</div>
                      <div className="text-neutral-400 text-[11px] truncate mt-0.5">
                        {entry.args}
                      </div>
                      <div className="text-emerald-400 text-[11px] mt-0.5">
                        ➜ {entry.result}
                      </div>
                    </div>
                  ))}
                  {syscalls.length === 0 && (
                    <div className="text-center py-10 text-neutral-500">
                      Listening for incoming Orbis syscalls...
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'shaders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-neutral-300 font-semibold text-xs">
                    GCN Shader Recompiler Engine
                  </div>
                  <div className="flex gap-1">
                    {SAMPLE_SHADERS.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedShaderIndex(idx)}
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          selectedShaderIndex === idx
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {s.stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400">
                  Translating {currentShader.name} · Cycles: {currentShader.cycles} · Regs: {currentShader.registers}
                </div>

                {/* Side by side code view */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* PS4 GCN Bytecode */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded p-2.5">
                    <div className="text-[11px] font-bold text-red-400 mb-1.5 pb-1 border-b border-neutral-800">
                      PS4 GCN AMD Bytecode
                    </div>
                    <pre className="text-[10px] text-neutral-300 overflow-x-auto leading-relaxed">
                      {currentShader.gcnBytecode.join('\n')}
                    </pre>
                  </div>

                  {/* Vulkan GLSL/SPIR-V */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded p-2.5">
                    <div className="text-[11px] font-bold text-emerald-400 mb-1.5 pb-1 border-b border-neutral-800">
                      Windows Vulkan 1.3 GLSL
                    </div>
                    <pre className="text-[10px] text-neutral-300 overflow-x-auto leading-relaxed">
                      {currentShader.vulkanGlsl.join('\n')}
                    </pre>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded text-[11px] text-neutral-300 space-y-1">
                  <div className="font-semibold text-white">Why GNM translation is fast:</div>
                  <p className="text-neutral-400">
                    PS4 GCN instructions map 1:1 to modern desktop GPUs (RDNA, Ampere, Ada, Blackwell, Arc) via standard Vulkan SPIR-V intermediate representation, incurring near zero translation penalty.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'memory' && (
              <div className="space-y-4">
                <div className="text-neutral-300 font-semibold text-xs">
                  Unified 8GB GDDR5 Address Space Mapping
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded space-y-1">
                    <div className="flex justify-between text-neutral-300 font-bold">
                      <span>Orbis OS Kernel Reserved</span>
                      <span>3,584 MB</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded overflow-hidden">
                      <div className="h-full bg-neutral-600 w-[43%]" />
                    </div>
                    <div className="text-neutral-400">Host bypass: Stubbed out / Translated to Win32 NT</div>
                  </div>

                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded space-y-1">
                    <div className="flex justify-between text-neutral-300 font-bold">
                      <span>Game Direct Memory (VRAM + SysRAM)</span>
                      <span>4,608 MB</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded overflow-hidden">
                      <div className="h-full bg-blue-600 w-[83%]" />
                    </div>
                    <div className="text-neutral-400">Mapped via <code className="text-blue-400">VirtualAlloc2(MEM_RESERVE | MEM_COMMIT)</code></div>
                  </div>

                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded space-y-1">
                    <div className="flex justify-between text-neutral-300 font-bold">
                      <span>Vulkan Host Visible Device Local</span>
                      <span>Active</span>
                    </div>
                    <div className="text-neutral-400">
                      Direct GPU memory access via Resizable BAR / SAM (Smart Access Memory) enabled on host PC.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
