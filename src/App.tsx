import React, { useState, useEffect, useRef, MouseEvent } from 'react';

const randomColor = (): string => `hsl(${Math.random() * 360}, 100%, 50%)`;

interface Target {
  x: number;
  y: number;
  dx: number;
  dy: number;
  id: number;
  color: string;
  rotation: number;
}

type PowerUpType = 'extra-life' | 'time-freeze';

interface PowerUp {
  x: number;
  y: number;
  id: number;
  type: PowerUpType;
}

const Game: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [combo, setCombo] = useState<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetSize: number = 30;
  const gameWidth: number = 600;
  const gameHeight: number = 400;
  const targetSpeed: number = 2;
  const targetSpawnInterval: number = 1500;
  const powerUpSpawnInterval: number = 5000;
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const targetRotationSpeed: number = 2; // rotation speed for targets

  const handleTargetClick = (id: number) => {
    if (gameOver) return;
    setTargets((prevTargets) => prevTargets.filter((target) => target.id !== id));
    setScore((prevScore) => prevScore + (combo > 5 ? 2 : 1)); // Combo multiplier
    setCombo((prevCombo) => prevCombo + 1); // Increase combo count
  };

  const handlePowerUpClick = (id: number) => {
    if (gameOver) return;
    const clickedPowerUp = powerUps.find((pu) => pu.id === id);
    if (!clickedPowerUp) return;
    setPowerUps((prevPowerUps) => prevPowerUps.filter((powerUp) => powerUp.id !== id));
    if (clickedPowerUp.type === 'extra-life') {
      setLives((prevLives) => prevLives + 1);
    }
    if (clickedPowerUp.type === 'time-freeze') {
      setCombo(0); // Reset combo
      setTargets((prevTargets) =>
        prevTargets.map((target) => ({
          ...target,
          dx: 0,
          dy: 0,
        })); // Freeze targets for a short period
      );
      setTimeout(() => {
        setTargets((prevTargets) =>
          prevTargets.map((target) => ({
            ...target,
            dx: (Math.random() - 0.5) * targetSpeed,
            dy: (Math.random() - 0.5) * targetSpeed,
          })); // Resume movement
      }, 3000); // Freeze for 3 seconds
    }
  };

  const spawnTarget = () => {
    const x = Math.random() * (gameWidth - targetSize);
    const y = Math.random() * (gameHeight - targetSize);
    const dx = (Math.random() - 0.5) * targetSpeed;
    const dy = (Math.random() - 0.5) * targetSpeed;
    const color = randomColor();
    const newTarget: Target = {
      x,
      y,
      dx,
      dy,
      id: Date.now() + Math.random(),
      color,
      rotation: 0,
    };
    setTargets((prevTargets) => [...prevTargets, newTarget]);
  };

  const spawnPowerUp = () => {
    const x = Math.random() * (gameWidth - targetSize);
    const y = Math.random() * (gameHeight - targetSize);
    const type: PowerUpType = Math.random() < 0.5 ? 'extra-life' : 'time-freeze';
    const newPowerUp: PowerUp = {
      x,
      y,
      id: Date.now() + Math.random(),
      type,
    };
    setPowerUps((prevPowerUps) => [...prevPowerUps, newPowerUp]);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleGameAreaClick = () => {
    if (gameOver) return;
    setLives((prevLives) => {
      const newLives = prevLives - 1;
      if (newLives <= 0) {
        setGameOver(true);
        setGameStarted(false);
      }
      return newLives;
    });
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setTargets([]);
    setPowerUps([]);
    setCombo(0);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setTargets([]);
    setPowerUps([]);
    setCombo(0);
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const movementInterval = setInterval(() => {
        setTargets((prevTargets) => {
          const updatedTargets = prevTargets.map((target) => ({
            ...target,
            x: target.x + target.dx,
            y: target.y + target.dy,
            rotation: (target.rotation + targetRotationSpeed) % 360, // rotate target
          }));

          // Remove targets that are out of bounds
          const filteredTargets = updatedTargets.filter(
            (target) =>
              target.x > -targetSize &&
              target.x < gameWidth &&
              target.y > -targetSize &&
              target.y < gameHeight
          );

          return filteredTargets;
        });
      }, 20);

      const spawnIntervalId = setInterval(() => {
        if (!gameOver) spawnTarget();
      }, targetSpawnInterval);

      const powerUpIntervalId = setInterval(() => {
        if (!gameOver) spawnPowerUp();
      }, powerUpSpawnInterval);

      return () => {
        clearInterval(movementInterval);
        clearInterval(spawnIntervalId);
        clearInterval(powerUpIntervalId);
      };
    }
  }, [gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-5xl font-extrabold mb-8 text-white">Target Practice</h1>

      {/* Background Music */}
      <audio autoPlay loop>
        <source src="https://cdn.pixabay.com/download/audio/2023/03/22/audio_3b7f3e14d8.mp3?filename=retro-game-loop-114854.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      <div
        ref={gameAreaRef}
        className="relative bg-gray-800 border-4 border-yellow-500 rounded-lg overflow-hidden cursor-crosshair shadow-lg"
        style={{ width: gameWidth, height: gameHeight }}
        onMouseMove={handleMouseMove}
        onClick={handleGameAreaClick}
      >
        {targets.map((target) => (
          <div
            key={target.id}
            className="absolute rounded-full cursor-pointer transition-transform duration-100 animate-pulse"
            style={{
              width: targetSize,
              height: targetSize,
              left: target.x,
              top: target.y,
              backgroundColor: target.color,
              transform: `rotate(${target.rotation}deg)`,
              boxShadow: `0 0 10px ${target.color}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleTargetClick(target.id);
            }}
          />
        ))}

        {/* Power-ups */}
        {powerUps.map((powerUp) => (
          <div
            key={powerUp.id}
            className={`absolute rounded-full cursor-pointer flex items-center justify-center text-white font-bold transition-transform duration-100 animate-bounce ${
              powerUp.type === 'extra-life' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{
              width: targetSize,
              height: targetSize,
              left: powerUp.x,
              top: powerUp.y,
              boxShadow: `0 0 10px ${powerUp.type === 'extra-life' ? 'yellow' : 'blue'}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePowerUpClick(powerUp.id);
            }}
          >
            {powerUp.type === 'extra-life' ? '+' : '❄️'}
          </div>
        ))}

        {/* Mouse Cursor */}
        <div
          className="absolute bg-green-500 rounded-full animate-ping"
          style={{
            width: 12,
            height: 12,
            left: mousePosition.x - 6,
            top: mousePosition.y - 6,
            pointerEvents: 'none',
          }}
        />
      </div>

      <div className="mt-4 flex space-x-8">
        <div className="text-xl text-white">Score: {score}</div>
        <div className="text-xl text-white">Lives: {lives}</div>
        <div className="text-xl text-white">Combo: {combo}</div>
      </div>

      {/* Start / Reset Button */}
      {!gameStarted && !gameOver && (
        <button
          onClick={startGame}
          className="mt-8 px-6 py-2 bg-blue-500 text-white text-xl font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Start Game
        </button>
      )}

      {gameOver && (
        <div className="mt-8 text-3xl font-bold text-white">
          Game Over
          <br />
          <button
            onClick={resetGame}
            className="mt-4 px-6 py-2 bg-red-500 text-white text-xl font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
