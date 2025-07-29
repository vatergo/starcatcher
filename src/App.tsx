import { useGame } from "./hooks/useGame";
import GameField from "./components/GameField";
import GameControls from "./components/GameControls";

function App() {
  const { gameState, actions } = useGame();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          color: "white",
          marginBottom: "20px",
          fontSize: "36px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        ⭐ Starcatcher ⭐
      </h1>

      <GameField gameState={gameState} />

      <GameControls
        gameStarted={gameState.gameStarted}
        gameOver={gameState.gameOver}
        onStartGame={actions.startGame}
        onResetGame={actions.resetGame}
      />

      {gameState.gameStarted && !gameState.gameOver && (
        <div
          style={{
            marginTop: "20px",
            color: "white",
            textAlign: "center",
            fontSize: "14px",
            opacity: 0.7,
            maxWidth: "500px",
          }}
        >
          <p>
            Guide the cyan cube to collect stars while avoiding the red
            platforms!
          </p>
          <p>
            The cube moves between the center and the outer ring - time your
            clicks carefully!
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
