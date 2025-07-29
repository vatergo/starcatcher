interface GameControlsProps {
  gameStarted: boolean;
  gameOver: boolean;
  onStartGame: () => void;
  onResetGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  gameOver,
  onStartGame,
  onResetGame,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      {!gameStarted && !gameOver && (
        <button
          onClick={onStartGame}
          style={{
            padding: "12px 24px",
            fontSize: "18px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#45a049";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#4CAF50";
          }}
        >
          🚀 Start Game
        </button>
      )}

      {gameOver && (
        <button
          onClick={onResetGame}
          style={{
            padding: "12px 24px",
            fontSize: "18px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#1976D2";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#2196F3";
          }}
        >
          🔄 Play Again
        </button>
      )}

      {gameStarted && !gameOver && (
        <div
          style={{
            color: "#666",
            fontSize: "14px",
            textAlign: "center",
            padding: "12px",
          }}
        >
          <div>Controls:</div>
          <div>Click anywhere or press SPACE to change direction</div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
