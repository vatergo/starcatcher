import { useReducer, useEffect, useCallback } from "react";
import type {
  GameState,
  GameAction,
  GameConfig,
  Platform,
  Star,
  Cube,
} from "../types/game";

const GAME_CONFIG: GameConfig = {
  centerX: 400,
  centerY: 300,
  orbitRadius: 150,
  starOrbitRadius: 250,
  cubeSize: 20,
  platformWidth: 8,
  platformLength: Math.PI / 3, // 60 градусов
  cubeSpeed: 0.12,
  platformSpeed: 0.002,
};

function createRandomPlatform(angle: number, direction: number): Platform {
  return {
    angle,
    speed: 0.0005 + Math.random() * 0.003, // скорость от 0.0005 до 0.0035 (уменьшенный разброс)
    length: Math.PI / 6 + (Math.random() * Math.PI) / 3, // длина от 30° до 90°
    direction,
    width: 8, // одинаковая толщина для всех платформ
  };
}

function createTwoPlatformsWithGoodSpacing(): Platform[] {
  const firstAngle = Math.random() * Math.PI * 2;
  const firstPlatform = createRandomPlatform(firstAngle, 1);

  // Вторая платформа должна быть на противоположной стороне с минимальным зазором
  const minGap = Math.PI / 3; // минимальный зазор в 60 градусов
  const maxGap = Math.PI; // максимальный зазор в 180 градусов
  const gap = minGap + Math.random() * (maxGap - minGap);

  let secondAngle = firstAngle + gap;
  if (secondAngle >= Math.PI * 2) {
    secondAngle -= Math.PI * 2;
  }

  const secondPlatform = createRandomPlatform(secondAngle, -1);

  return [firstPlatform, secondPlatform];
}

function createRandomStar(): Star {
  const angle = Math.random() * Math.PI * 2;
  return {
    position: {
      x: GAME_CONFIG.centerX + Math.cos(angle) * GAME_CONFIG.starOrbitRadius,
      y: GAME_CONFIG.centerY + Math.sin(angle) * GAME_CONFIG.starOrbitRadius,
    },
    radius: GAME_CONFIG.starOrbitRadius,
    angle,
  };
}

const initialState: GameState = {
  cube: {
    position: { x: GAME_CONFIG.centerX, y: GAME_CONFIG.centerY },
    radius: 0,
    angle: 0,
    rotation: 0,
    isMovingOut: false,
    speed: GAME_CONFIG.cubeSpeed,
  },
  platforms: createTwoPlatformsWithGoodSpacing(),
  star: null,
  score: 0,
  gameStarted: false,
  gameOver: false,
  gameConfig: GAME_CONFIG,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...initialState,
        gameStarted: true,
        star: createRandomStar(),
        platforms: createTwoPlatformsWithGoodSpacing(),
      };

    case "TOGGLE_CUBE_DIRECTION":
      if (!state.gameStarted || state.gameOver) return state;

      return {
        ...state,
        cube: {
          ...state.cube,
          isMovingOut: !state.cube.isMovingOut,
        },
      };

    case "UPDATE_POSITIONS":
      if (!state.gameStarted || state.gameOver) return state;

      const { deltaTime } = action.payload;

      // Обновляем позицию кубика
      let newCube = { ...state.cube };

      if (state.star) {
        // Вычисляем угол к звезде
        const starAngle = Math.atan2(
          state.star.position.y - state.gameConfig.centerY,
          state.star.position.x - state.gameConfig.centerX,
        );

        // Обновляем угол кубика, чтобы он летел к звезде
        newCube.angle = starAngle;
      }

      if (newCube.isMovingOut) {
        newCube.radius = Math.min(
          newCube.radius + newCube.speed * deltaTime,
          state.gameConfig.starOrbitRadius,
        );
        // Если почти достигли звезды, автоматически меняем направление
        if (newCube.radius >= state.gameConfig.starOrbitRadius - 20) {
          newCube.isMovingOut = false;
        }
      } else {
        newCube.radius = Math.max(
          newCube.radius - newCube.speed * deltaTime,
          0,
        );
        // Если почти достигли центра, автоматически меняем направление
        if (newCube.radius <= 5) {
          newCube.isMovingOut = true;
        }
      }

      // Обновляем вращение кубика (вращается быстрее при движении)
      const rotationSpeed = newCube.radius > 0 ? 0.01 : 0.005; // Быстрее при движении к/от звезды
      newCube.rotation += rotationSpeed * deltaTime;

      newCube.position.x =
        state.gameConfig.centerX + Math.cos(newCube.angle) * newCube.radius;
      newCube.position.y =
        state.gameConfig.centerY + Math.sin(newCube.angle) * newCube.radius;

      // Обновляем платформы с их индивидуальными скоростями
      const newPlatforms = state.platforms.map((platform) => {
        let newAngle =
          platform.angle + platform.direction * platform.speed * deltaTime;
        let newDirection = platform.direction;

        // Нормализуем угол
        while (newAngle < 0) newAngle += Math.PI * 2;
        while (newAngle >= Math.PI * 2) newAngle -= Math.PI * 2;

        return {
          ...platform,
          angle: newAngle,
          direction: newDirection,
          // Сохраняем индивидуальные характеристики платформы
          speed: platform.speed,
          length: platform.length,
          width: platform.width,
        };
      });

      // Проверяем столкновения платформ друг с другом (для двух платформ)
      if (newPlatforms.length === 2) {
        const [platform1, platform2] = newPlatforms;
        const angleDiff = Math.abs(platform1.angle - platform2.angle);
        const minAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

        // Проверяем пересечение с учетом длины обеих платформ
        const overlapThreshold = (platform1.length + platform2.length) / 2;

        if (minAngleDiff < overlapThreshold) {
          // Меняем направления
          newPlatforms[0].direction *= -1;
          newPlatforms[1].direction *= -1;

          // Если платформы слишком близко, "отталкиваем" их друг от друга
          if (minAngleDiff < overlapThreshold * 0.5) {
            const separationForce = 0.02;
            newPlatforms[0].angle -= separationForce;
            newPlatforms[1].angle += separationForce;

            // Нормализуем углы
            while (newPlatforms[0].angle < 0)
              newPlatforms[0].angle += Math.PI * 2;
            while (newPlatforms[0].angle >= Math.PI * 2)
              newPlatforms[0].angle -= Math.PI * 2;
            while (newPlatforms[1].angle < 0)
              newPlatforms[1].angle += Math.PI * 2;
            while (newPlatforms[1].angle >= Math.PI * 2)
              newPlatforms[1].angle -= Math.PI * 2;
          }
        }
      }

      // Если кубик достиг центра и нет звезды, создаем новую
      let newStar = state.star;
      if (newCube.radius <= 5 && !state.star) {
        newStar = createRandomStar();
      }

      return {
        ...state,
        cube: newCube,
        platforms: newPlatforms,
        star: newStar,
      };

    case "COLLECT_STAR":
      return {
        ...state,
        score: state.score + 1,
        star: null, // Убираем звезду, новая появится когда кубик вернется в центр
        cube: {
          ...state.cube,
          isMovingOut: false, // После сбора звезды летим обратно к центру
        },
      };

    case "GAME_OVER":
      return {
        ...state,
        gameOver: true,
        gameStarted: false,
      };

    case "RESET_GAME":
      return initialState;

    default:
      return state;
  }
}

function checkCubePlatformCollision(
  cube: Cube,
  platforms: Platform[],
  config: GameConfig,
): boolean {
  if (Math.abs(cube.radius - config.orbitRadius) > config.cubeSize) {
    return false;
  }

  return platforms.some((platform) => {
    const cubeAngle = cube.angle;
    const platformStart = platform.angle - platform.length / 2;
    const platformEnd = platform.angle + platform.length / 2;

    // Нормализуем углы
    let normalizedCubeAngle = cubeAngle;
    while (normalizedCubeAngle < 0) normalizedCubeAngle += Math.PI * 2;
    while (normalizedCubeAngle >= Math.PI * 2)
      normalizedCubeAngle -= Math.PI * 2;

    let normalizedStart = platformStart;
    while (normalizedStart < 0) normalizedStart += Math.PI * 2;
    while (normalizedStart >= Math.PI * 2) normalizedStart -= Math.PI * 2;

    let normalizedEnd = platformEnd;
    while (normalizedEnd < 0) normalizedEnd += Math.PI * 2;
    while (normalizedEnd >= Math.PI * 2) normalizedEnd -= Math.PI * 2;

    if (normalizedStart <= normalizedEnd) {
      return (
        normalizedCubeAngle >= normalizedStart &&
        normalizedCubeAngle <= normalizedEnd
      );
    } else {
      return (
        normalizedCubeAngle >= normalizedStart ||
        normalizedCubeAngle <= normalizedEnd
      );
    }
  });
}

function checkCubeStarCollision(
  cube: Cube,
  star: Star | null,
  config: GameConfig,
): boolean {
  if (!star) return false;

  const distance = Math.sqrt(
    Math.pow(cube.position.x - star.position.x, 2) +
      Math.pow(cube.position.y - star.position.y, 2),
  );

  return distance < config.cubeSize * 2;
}

export function useGame() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME" });
  }, []);

  const toggleCubeDirection = useCallback(() => {
    dispatch({ type: "TOGGLE_CUBE_DIRECTION" });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    let lastTime = Date.now();
    const gameLoop = setInterval(() => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      dispatch({ type: "UPDATE_POSITIONS", payload: { deltaTime } });
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [gameState.gameStarted, gameState.gameOver]);

  // Collision detection
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    // Проверяем столкновение с платформами
    if (
      checkCubePlatformCollision(
        gameState.cube,
        gameState.platforms,
        gameState.gameConfig,
      )
    ) {
      dispatch({ type: "GAME_OVER" });
      return;
    }

    // Проверяем столкновение со звездой (только когда летим наружу)
    if (
      gameState.cube.isMovingOut &&
      checkCubeStarCollision(
        gameState.cube,
        gameState.star,
        gameState.gameConfig,
      )
    ) {
      dispatch({ type: "COLLECT_STAR" });
    }
  }, [
    gameState.cube,
    gameState.platforms,
    gameState.star,
    gameState.gameStarted,
    gameState.gameOver,
    gameState.gameConfig,
  ]);

  // Mouse/Touch controls
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    const handleClick = () => {
      toggleCubeDirection();
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        toggleCubeDirection();
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState.gameStarted, gameState.gameOver, toggleCubeDirection]);

  return {
    gameState,
    actions: {
      startGame,
      resetGame,
      toggleCubeDirection,
    },
  };
}
