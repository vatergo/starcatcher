import type { GameState } from "../types/game";

interface GameFieldProps {
  gameState: GameState;
}

const GameField: React.FC<GameFieldProps> = ({ gameState }) => {
  const { cube, platforms, star, score, gameStarted, gameOver, gameConfig } =
    gameState;
  const { centerX, centerY, orbitRadius, starOrbitRadius, cubeSize } =
    gameConfig;

  const gameWidth = 800;
  const gameHeight = 600;

  return (
    <div
      style={{
        position: "relative",
        width: `${gameWidth}px`,
        height: `${gameHeight}px`,
        border: "2px solid #333",
        backgroundColor: "#0a0a0a",
        margin: "0 auto",
        overflow: "hidden",
        cursor: gameStarted && !gameOver ? "pointer" : "default",
      }}
    >
      {/* Score Display */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          fontSize: "24px",
          fontFamily: "monospace",
          zIndex: 10,
        }}
      >
        Score: {score}
      </div>

      {/* Center point (визуальная помощь) */}
      <div
        style={{
          position: "absolute",
          left: `${centerX - 2}px`,
          top: `${centerY - 2}px`,
          width: "4px",
          height: "4px",
          backgroundColor: "#333",
          borderRadius: "50%",
        }}
      />

      {/* Orbit circle (визуальная помощь) */}
      <div
        style={{
          position: "absolute",
          left: `${centerX - orbitRadius}px`,
          top: `${centerY - orbitRadius}px`,
          width: `${orbitRadius * 2}px`,
          height: `${orbitRadius * 2}px`,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Star orbit circle (визуальная помощь) */}
      <div
        style={{
          position: "absolute",
          left: `${centerX - starOrbitRadius}px`,
          top: `${centerY - starOrbitRadius}px`,
          width: `${starOrbitRadius * 2}px`,
          height: `${starOrbitRadius * 2}px`,
          border: "1px solid rgba(255, 255, 0, 0.1)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Platforms */}
      {gameStarted &&
        platforms.map((platform, index) => {
          const startAngle = platform.angle - platform.length / 2;
          const endAngle = platform.angle + platform.length / 2;

          // SVG path for arc
          const x1 = centerX + Math.cos(startAngle) * orbitRadius;
          const y1 = centerY + Math.sin(startAngle) * orbitRadius;
          const x2 = centerX + Math.cos(endAngle) * orbitRadius;
          const y2 = centerY + Math.sin(endAngle) * orbitRadius;

          const largeArcFlag = platform.length > Math.PI ? 1 : 0;

          return (
            <svg
              key={index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <path
                d={`M ${x1} ${y1} A ${orbitRadius} ${orbitRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                stroke={`hsl(${platform.speed * 60000}, 80%, ${50 + platform.speed * 5000}%)`}
                strokeWidth={platform.width}
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          );
        })}

      {/* Cube */}
      {gameStarted && (
        <div
          style={{
            position: "absolute",
            left: `${cube.position.x - cubeSize / 2}px`,
            top: `${cube.position.y - cubeSize / 2}px`,
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            backgroundColor: "#00ffff",
            border: "2px solid #0099cc",
            transform: `rotate(${45 + (cube.rotation * 180) / Math.PI}deg)`,
            transition: "background-color 0.1s",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Star */}
      {star && (
        <div
          style={{
            position: "absolute",
            left: `${star.position.x - 15}px`,
            top: `${star.position.y - 15}px`,
            fontSize: "30px",
            pointerEvents: "none",
          }}
        >
          ⭐
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#ff4444", marginBottom: "20px" }}>Game Over!</h2>
          <p style={{ marginBottom: "10px" }}>Final Score: {score}</p>
          <p style={{ fontSize: "16px", opacity: 0.7 }}>
            Click Play Again to restart
          </p>
        </div>
      )}

      {/* Start Screen */}
      {!gameStarted && !gameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginBottom: "30px" }}>⭐ Starcatcher ⭐</h1>
          <div
            style={{ fontSize: "18px", lineHeight: "1.5", maxWidth: "400px" }}
          >
            <p>Navigate the cube to collect stars!</p>
            <p style={{ marginTop: "20px" }}>
              • Click or press SPACE to change direction
            </p>
            <p>• Avoid the red platforms</p>
            <p>• Collect stars to increase your score</p>
          </div>
          <div style={{ marginTop: "30px", fontSize: "16px", opacity: 0.7 }}>
            Press Start Game to begin
          </div>
        </div>
      )}

      {/* Instructions during game */}
      {gameStarted && !gameOver && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            fontFamily: "monospace",
          }}
        >
          Click or press SPACE to change direction
        </div>
      )}

      {/* Debug info for platform speeds (uncomment for testing) */}
      {/* {gameStarted && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "20px",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {platforms.map((platform, index) => (
            <div key={index}>
              Platform {index + 1}: Speed {platform.speed.toFixed(4)},
              Length {(platform.length * 180 / Math.PI).toFixed(0)}°,
              Width {platform.width.toFixed(1)}
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default GameField;
