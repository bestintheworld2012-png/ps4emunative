import React, { useState, useEffect } from 'react';
import { DualShockInput } from '../types';
import {
  Gamepad2,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Palette,
  Volume2,
  Keyboard,
} from 'lucide-react';

export const ControllerStudio: React.FC = () => {
  const [gamepadState, setGamepadState] = useState<DualShockInput>({
    connected: false,
    id: 'Virtual DualShock 4 Controller',
    cross: false,
    circle: false,
    square: false,
    triangle: false,
    l1: false,
    r1: false,
    l2: 0,
    r2: 0,
    dpadUp: false,
    dpadDown: false,
    dpadLeft: false,
    dpadRight: false,
    leftStickX: 0,
    leftStickY: 0,
    rightStickX: 0,
    rightStickY: 0,
    options: false,
    share: false,
    touchpadClick: false,
    psButton: false,
    lightbarColor: '#0066FF',
  });

  const [rumbleActive, setRumbleActive] = useState(false);
  const [selectedMappingProfile, setSelectedMappingProfile] = useState<'Default DS4' | 'DualSense' | 'Xbox Controller' | 'Keyboard / Mouse'>('Default DS4');

  // Listen to physical gamepads via standard HTML5 Gamepad API
  useEffect(() => {
    let animId: number;

    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0];

      if (gp) {
        setGamepadState((prev) => ({
          ...prev,
          connected: true,
          id: gp.id,
          cross: gp.buttons[0]?.pressed || false,
          circle: gp.buttons[1]?.pressed || false,
          square: gp.buttons[2]?.pressed || false,
          triangle: gp.buttons[3]?.pressed || false,
          l1: gp.buttons[4]?.pressed || false,
          r1: gp.buttons[5]?.pressed || false,
          l2: gp.buttons[6]?.value || 0,
          r2: gp.buttons[7]?.value || 0,
          share: gp.buttons[8]?.pressed || false,
          options: gp.buttons[9]?.pressed || false,
          touchpadClick: gp.buttons[17]?.pressed || false,
          psButton: gp.buttons[16]?.pressed || false,
          dpadUp: gp.buttons[12]?.pressed || false,
          dpadDown: gp.buttons[13]?.pressed || false,
          dpadLeft: gp.buttons[14]?.pressed || false,
          dpadRight: gp.buttons[15]?.pressed || false,
          leftStickX: parseFloat(gp.axes[0]?.toFixed(2) || '0'),
          leftStickY: parseFloat(gp.axes[1]?.toFixed(2) || '0'),
          rightStickX: parseFloat(gp.axes[2]?.toFixed(2) || '0'),
          rightStickY: parseFloat(gp.axes[3]?.toFixed(2) || '0'),
        }));
      }

      animId = requestAnimationFrame(pollGamepads);
    };

    animId = requestAnimationFrame(pollGamepads);

    const onConnect = (e: GamepadEvent) => {
      console.log('Gamepad connected:', e.gamepad.id);
    };
    const onDisconnect = () => {
      setGamepadState((prev) => ({ ...prev, connected: false, id: 'Virtual DualShock 4' }));
    };

    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  // Test DualShock 4 / DualSense vibration motors
  const testRumble = () => {
    setRumbleActive(true);
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (gp && (gp as any).vibrationActuator) {
      try {
        (gp as any).vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: 600,
          weakMagnitude: 0.8,
          strongMagnitude: 1.0,
        });
      } catch (e) {
        // Fallback
      }
    }

    setTimeout(() => setRumbleActive(false), 600);
  };

  const handleLightbarPreset = (color: string) => {
    setGamepadState((prev) => ({ ...prev, lightbarColor: color }));
  };

  // Virtual button simulation for clicks
  const triggerVirtualButton = (key: keyof DualShockInput, val: boolean | number) => {
    setGamepadState((prev) => ({ ...prev, [key]: val }));
    setTimeout(() => {
      setGamepadState((prev) => ({ ...prev, [key]: typeof val === 'number' ? 0 : false }));
    }, 200);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-neutral-950 p-6 space-y-6">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            DualShock 4 & DualSense Windows Studio
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time DirectInput / XInput polling, touchpad gestures, six-axis gyro mapping, and RGB lightbar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                gamepadState.connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-neutral-300">
              {gamepadState.connected ? 'Physical Controller Active' : 'Virtual Controller Mode'}
            </span>
          </div>

          <button
            onClick={testRumble}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              rumbleActive
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Haptic Rumble</span>
          </button>
        </div>
      </div>

      {/* Main Gamepad Visualizer Card */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* DualShock 4 Controller Model Schematic */}
        <div className="relative w-full max-w-xl h-80 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
          {/* Top Bar: Lightbar & Shoulders */}
          <div className="flex justify-between items-center w-full">
            {/* L1 / L2 */}
            <div className="flex flex-col gap-1 items-start">
              <button
                onClick={() => triggerVirtualButton('l2', 1)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  gamepadState.l2 > 0.1 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                L2: {gamepadState.l2.toFixed(2)}
              </button>
              <button
                onClick={() => triggerVirtualButton('l1', true)}
                className={`px-4 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  gamepadState.l1 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                L1
              </button>
            </div>

            {/* RGB Lightbar Indicator */}
            <div className="flex flex-col items-center">
              <div
                className="w-32 h-3 rounded-full shadow-lg transition-colors duration-300"
                style={{
                  backgroundColor: gamepadState.lightbarColor,
                  boxShadow: `0 0 16px ${gamepadState.lightbarColor}`,
                }}
              />
              <span className="text-[10px] font-mono text-neutral-400 mt-1">SCE Lightbar</span>
            </div>

            {/* R1 / R2 */}
            <div className="flex flex-col gap-1 items-end">
              <button
                onClick={() => triggerVirtualButton('r2', 1)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  gamepadState.r2 > 0.1 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                R2: {gamepadState.r2.toFixed(2)}
              </button>
              <button
                onClick={() => triggerVirtualButton('r1', true)}
                className={`px-4 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  gamepadState.r1 ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                R1
              </button>
            </div>
          </div>

          {/* Center Area: Touchpad, Share, Options */}
          <div className="flex justify-between items-center w-full px-6 my-2">
            {/* Share */}
            <button
              onClick={() => triggerVirtualButton('share', true)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                gamepadState.share ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              SHARE
            </button>

            {/* Touchpad */}
            <button
              onClick={() => triggerVirtualButton('touchpadClick', true)}
              className={`w-44 h-16 rounded-lg border flex flex-col items-center justify-center transition-colors ${
                gamepadState.touchpadClick
                  ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                  : 'border-neutral-700 bg-neutral-950/60 text-neutral-400'
              }`}
            >
              <span className="text-xs font-bold font-mono">TOUCHPAD</span>
              <span className="text-[10px] text-neutral-400">Multi-Touch & Click</span>
            </button>

            {/* Options */}
            <button
              onClick={() => triggerVirtualButton('options', true)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                gamepadState.options ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              OPTIONS
            </button>
          </div>

          {/* Lower Area: D-Pad, Thumbsticks, Face Buttons */}
          <div className="flex justify-between items-center w-full px-4">
            {/* D-Pad */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <button
                onClick={() => triggerVirtualButton('dpadUp', true)}
                className={`absolute top-0 w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                  gamepadState.dpadUp ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                ▲
              </button>
              <button
                onClick={() => triggerVirtualButton('dpadLeft', true)}
                className={`absolute left-0 w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                  gamepadState.dpadLeft ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                ◀
              </button>
              <button
                onClick={() => triggerVirtualButton('dpadRight', true)}
                className={`absolute right-0 w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                  gamepadState.dpadRight ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                ▶
              </button>
              <button
                onClick={() => triggerVirtualButton('dpadDown', true)}
                className={`absolute bottom-0 w-6 h-6 rounded flex items-center justify-center text-xs font-mono ${
                  gamepadState.dpadDown ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                ▼
              </button>
            </div>

            {/* Left Analog Stick */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border border-neutral-700 relative flex items-center justify-center">
                <div
                  className="w-8 h-8 rounded-full bg-neutral-700 border border-neutral-600 transition-transform"
                  style={{
                    transform: `translate(${gamepadState.leftStickX * 16}px, ${
                      gamepadState.leftStickY * 16
                    }px)`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-400 mt-1">L-Stick (LX/LY)</span>
            </div>

            {/* PS Button */}
            <button
              onClick={() => triggerVirtualButton('psButton', true)}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                gamepadState.psButton ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              PS
            </button>

            {/* Right Analog Stick */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border border-neutral-700 relative flex items-center justify-center">
                <div
                  className="w-8 h-8 rounded-full bg-neutral-700 border border-neutral-600 transition-transform"
                  style={{
                    transform: `translate(${gamepadState.rightStickX * 16}px, ${
                      gamepadState.rightStickY * 16
                    }px)`,
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-400 mt-1">R-Stick (RX/RY)</span>
            </div>

            {/* Face Buttons (Square, Triangle, Cross, Circle) */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Triangle */}
              <button
                onClick={() => triggerVirtualButton('triangle', true)}
                className={`absolute top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  gamepadState.triangle ? 'bg-emerald-500 text-white' : 'bg-neutral-800 text-emerald-400'
                }`}
              >
                ▲
              </button>
              {/* Square */}
              <button
                onClick={() => triggerVirtualButton('square', true)}
                className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  gamepadState.square ? 'bg-pink-500 text-white' : 'bg-neutral-800 text-pink-400'
                }`}
              >
                ■
              </button>
              {/* Circle */}
              <button
                onClick={() => triggerVirtualButton('circle', true)}
                className={`absolute right-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  gamepadState.circle ? 'bg-red-500 text-white' : 'bg-neutral-800 text-red-400'
                }`}
              >
                ●
              </button>
              {/* Cross */}
              <button
                onClick={() => triggerVirtualButton('cross', true)}
                className={`absolute bottom-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  gamepadState.cross ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-blue-400'
                }`}
              >
                ✖
              </button>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-400 font-mono mt-3">
          Controller ID: <span className="text-neutral-300">{gamepadState.id}</span>
        </div>
      </div>

      {/* Configuration & Customization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RGB Lightbar Selector */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Palette className="w-4 h-4 text-blue-400" />
            <span>Lightbar RGB Customization</span>
          </div>
          <p className="text-xs text-neutral-400">
            Set custom LED color mapped to libScePad lightbar API.
          </p>
          <div className="flex gap-2 pt-1">
            {[
              { name: 'Sony Blue', hex: '#0066FF' },
              { name: 'Blood Crimson', hex: '#DC2626' },
              { name: 'Tsushima Gold', hex: '#EAB308' },
              { name: 'Stealth White', hex: '#FFFFFF' },
              { name: 'Gravity Indigo', hex: '#8B5CF6' },
            ].map((col) => (
              <button
                key={col.hex}
                onClick={() => handleLightbarPreset(col.hex)}
                className="w-7 h-7 rounded-full border border-neutral-700 hover:scale-110 transition-transform"
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
          </div>
        </div>

        {/* Controller Mapping Profile */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Input Translation Profile</span>
          </div>
          <div className="space-y-1.5">
            {(['Default DS4', 'DualSense', 'Xbox Controller', 'Keyboard / Mouse'] as const).map(
              (profile) => (
                <button
                  key={profile}
                  onClick={() => setSelectedMappingProfile(profile)}
                  className={`w-full p-2 rounded text-xs font-medium text-left flex items-center justify-between transition-colors ${
                    selectedMappingProfile === profile
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:bg-neutral-900'
                  }`}
                >
                  <span>{profile}</span>
                  {selectedMappingProfile === profile && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* Keyboard & Mouse Fallback Layout */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-5 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 font-sans text-sm font-bold text-white">
            <Keyboard className="w-4 h-4 text-purple-400" />
            <span>Keyboard & Mouse Binds</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-neutral-300">
            <div className="flex justify-between border-b border-neutral-800 pb-1">
              <span className="text-neutral-400">Move (L-Stick)</span>
              <span>W, A, S, D</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-1">
              <span className="text-neutral-400">Aim Camera (R-Stick)</span>
              <span>Mouse Delta X/Y</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-1">
              <span className="text-neutral-400">Attack / Interact (R1/R2)</span>
              <span>Left / Right Click</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-1">
              <span className="text-neutral-400">Dodge / Roll (Circle)</span>
              <span>Spacebar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
