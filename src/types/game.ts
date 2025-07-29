export interface Position {
  x: number;
  y: number;
}

export interface Cube {
  position: Position;
  radius: number;
  angle: number;
  rotation: number;
  isMovingOut: boolean;
  speed: number;
}

export interface Platform {
  angle: number;
  speed: number;
  length: number; // длина дуги в радианах
  direction: number; // 1 или -1
  width: number; // толщина платформы
}

export interface Star {
  position: Position;
  radius: number;
  angle: number;
}

export interface GameState {
  cube: Cube;
  platforms: Platform[];
  star: Star | null;
  score: number;
  gameStarted: boolean;
  gameOver: boolean;
  gameConfig: GameConfig;
}

export interface GameConfig {
  centerX: number;
  centerY: number;
  orbitRadius: number;
  starOrbitRadius: number;
  cubeSize: number;
  platformWidth: number;
  platformLength: number; // в радианах
  cubeSpeed: number;
  platformSpeed: number;
}

export type GameAction =
  | { type: "START_GAME" }
  | { type: "TOGGLE_CUBE_DIRECTION" }
  | { type: "UPDATE_POSITIONS"; payload: { deltaTime: number } }
  | { type: "COLLECT_STAR" }
  | { type: "GAME_OVER" }
  | { type: "RESET_GAME" };
