export interface PS4Game {
  id: string;
  titleId: string; // e.g. CUSA03173
  title: string;
  region: 'USA' | 'EUR' | 'JPN' | 'GLOBAL';
  version: string;
  sdkVersion: string; // e.g. 5.05, 9.00
  fileSize: string;
  status: 'Playable' | 'In-Game' | 'Menu Only' | 'Loads';
  fpsTarget: number;
  coverImage: string;
  developer: string;
  genre: string;
  releaseYear: number;
  realWorldCompatibility: {
    testedOnWindows: boolean;
    nativeRunner: 'shadPS4' | 'fpPS4';
    averageFps: string;
    soundWorking: boolean;
    testedGpu: string;
    verifiedPlayable: boolean;
    notes: string;
  };
  patches: {
    fps60: boolean;
    resolution4k: boolean;
    chromaticAberrationDisabled: boolean;
    ultrawide: boolean;
  };
  gnmFeatures: string[];
}

export interface SyscallEntry {
  id: number;
  timestamp: string;
  name: string;
  module: string;
  args: string;
  result: string;
  type: 'kernel' | 'graphics' | 'input' | 'audio' | 'memory';
}

export interface ShaderTranslation {
  id: string;
  name: string;
  stage: 'Vertex' | 'Pixel' | 'Compute';
  gcnBytecode: string[];
  vulkanGlsl: string[];
  cycles: number;
  registers: number;
}

export interface PkgFileMetadata {
  fileName: string;
  fileSize: number;
  magic: string;
  pkgType: string;
  contentId: string;
  titleId: string;
  titleName: string;
  appVersion: string;
  requiredFirmware: string;
  pfsBlocks: number;
  entryCount: number;
  isDecrypted: boolean;
  entries: {
    name: string;
    offset: string;
    size: string;
    type: string;
  }[];
}

export interface HardwareInspection {
  cpuCores: number;
  memoryEstimateGb: number;
  gpuRenderer: string;
  gpuVendor: string;
  webglVersion: string;
  webgpuSupported: boolean;
  screenRefreshRate: number;
  avx2EmulationRating: 'Excellent' | 'Good' | 'Fair' | 'Underpowered';
  vramEstimate: string;
  overallReadiness: number; // 0-100
}

export interface GamepadButtonState {
  pressed: boolean;
  value: number;
}

export interface DualShockInput {
  connected: boolean;
  id: string;
  cross: boolean;
  circle: boolean;
  square: boolean;
  triangle: boolean;
  l1: boolean;
  r1: boolean;
  l2: number;
  r2: number;
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;
  leftStickX: number;
  leftStickY: number;
  rightStickX: number;
  rightStickY: number;
  options: boolean;
  share: boolean;
  touchpadClick: boolean;
  psButton: boolean;
  lightbarColor: string;
}
