// src/games/Pong.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Pong.css';

const Pong = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [gameState, setGameState] = useState('start'); // 'start', 'serving', 'playing', 'paused', 'gameOver'
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  
  const canvasWidth = 600;
  const canvasHeight = 400;
  const winningScore = 5;

  const difficultySettings = {
    easy: { aiSpeed: 2, ballSpeed: 3, aiAccuracy: 0.7 },
    medium: { aiSpeed: 4, ballSpeed: 5, aiAccuracy: 0.85 },
    hard: { aiSpeed: 6, ballSpeed: 7, aiAccuracy: 0.95 },
    nuclear: { aiSpeed: 8, ballSpeed: 9, aiAccuracy: 1.0 }
  };

  const gameData = useRef({
    paddleHeight: 75,
    paddleWidth: 12,
    leftY: (canvasHeight - 75) / 2,
    rightY: (canvasHeight - 75) / 2,
    ballX: canvasWidth / 2,
    ballY: canvasHeight / 2,
    ballSpeedX: 5,
    ballSpeedY: 4,
    ballRadius: 8,
    aiSpeed: 4,
    serving: false
  });

  const resetBall = useCallback(() => {
    const data = gameData.current;
    const settings = difficultySettings[difficulty];
    data.ballX = canvasWidth / 2;
    data.ballY = canvasHeight / 2;
    data.ballSpeedX = 0;
    data.ballSpeedY = 0;
    data.serving = true;
    setGameState('serving');
  }, [difficulty]);

  const serveBall = useCallback(() => {
    const data = gameData.current;
    const settings = difficultySettings[difficulty];
    data.ballSpeedX = Math.random() > 0.5 ? settings.ballSpeed : -settings.ballSpeed;
    data.ballSpeedY = (Math.random() - 0.5) * 6;
    data.serving = false;
    setGameState('playing');
  }, [difficulty]);

  const resetGame = useCallback(() => {
    setPlayerScore(0);
    setAiScore(0);
    setGameState('start');
    const data = gameData.current;
    data.ballX = canvasWidth / 2;
    data.ballY = canvasHeight / 2;
    data.ballSpeedX = 0;
    data.ballSpeedY = 0;
    data.serving = false;
  }, []);

  const startGame = useCallback(() => {
    const data = gameData.current;
    const settings = difficultySettings[difficulty];
    data.aiSpeed = settings.aiSpeed;
    resetBall();
  }, [resetBall, difficulty]);

  const pauseGame = useCallback(() => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = gameData.current;

    const draw = () => {
      // Background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2, 0);
      ctx.lineTo(canvasWidth / 2, canvasHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball with glow effect
      const ballGradient = ctx.createRadialGradient(
        data.ballX, data.ballY, 0,
        data.ballX, data.ballY, data.ballRadius * 2
      );
      ballGradient.addColorStop(0, '#00f5ff');
      ballGradient.addColorStop(1, 'rgba(0, 245, 255, 0.2)');
      
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(data.ballX, data.ballY, data.ballRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(data.ballX, data.ballY, data.ballRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Player paddle (left) with gradient
      const playerGradient = ctx.createLinearGradient(0, data.leftY, data.paddleWidth, data.leftY + data.paddleHeight);
      playerGradient.addColorStop(0, '#00f5ff');
      playerGradient.addColorStop(1, '#4ecdc4');
      ctx.fillStyle = playerGradient;
      ctx.fillRect(0, data.leftY, data.paddleWidth, data.paddleHeight);
      
      // Paddle highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, data.leftY, 3, data.paddleHeight);

      // AI paddle (right) with gradient
      const aiGradient = ctx.createLinearGradient(canvasWidth - data.paddleWidth, data.rightY, canvasWidth, data.rightY + data.paddleHeight);
      aiGradient.addColorStop(0, '#ff6b6b');
      aiGradient.addColorStop(1, '#ffa726');
      ctx.fillStyle = aiGradient;
      ctx.fillRect(canvasWidth - data.paddleWidth, data.rightY, data.paddleWidth, data.paddleHeight);
      
      // AI paddle highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(canvasWidth - 3, data.rightY, 3, data.paddleHeight);
    };

    const update = () => {
      if (gameState !== 'playing') return;

      // Ball movement
      data.ballX += data.ballSpeedX;
      data.ballY += data.ballSpeedY;

      // Ball collision with top and bottom
      if (data.ballY - data.ballRadius < 0 || data.ballY + data.ballRadius > canvasHeight) {
        data.ballSpeedY *= -1;
      }

      // Ball collision with player paddle (left)
      if (
        data.ballX - data.ballRadius < data.paddleWidth &&
        data.ballY > data.leftY &&
        data.ballY < data.leftY + data.paddleHeight
      ) {
        data.ballSpeedX = Math.abs(data.ballSpeedX);
        // Add spin based on where ball hits paddle
        const hitPosition = (data.ballY - (data.leftY + data.paddleHeight / 2)) / (data.paddleHeight / 2);
        data.ballSpeedY = hitPosition * 6;
      }

      // Ball collision with AI paddle (right)
      if (
        data.ballX + data.ballRadius > canvasWidth - data.paddleWidth &&
        data.ballY > data.rightY &&
        data.ballY < data.rightY + data.paddleHeight
      ) {
        data.ballSpeedX = -Math.abs(data.ballSpeedX);
        const hitPosition = (data.ballY - (data.rightY + data.paddleHeight / 2)) / (data.paddleHeight / 2);
        data.ballSpeedY = hitPosition * 6;
      }

      // AI movement with difficulty-based accuracy
      const settings = difficultySettings[difficulty];
      const aiCenter = data.rightY + data.paddleHeight / 2;
      const ballDistance = data.ballY - aiCenter;
      
      // Add some randomness based on difficulty
      const accuracy = settings.aiAccuracy;
      const targetY = data.ballY + (Math.random() - 0.5) * (1 - accuracy) * 50;
      const adjustedDistance = targetY - aiCenter;
      
      if (Math.abs(adjustedDistance) > 5) {
        if (adjustedDistance > 0) {
          data.rightY += Math.min(data.aiSpeed, adjustedDistance);
        } else {
          data.rightY += Math.max(-data.aiSpeed, adjustedDistance);
        }
      }

      // Keep AI paddle in bounds
      data.rightY = Math.max(0, Math.min(canvasHeight - data.paddleHeight, data.rightY));

      // Scoring
      if (data.ballX < 0) {
        setAiScore(prev => {
          const newScore = prev + 1;
          if (newScore >= winningScore) {
            setGameState('gameOver');
            return newScore;
          }
          resetBall();
          return newScore;
        });
      } else if (data.ballX > canvasWidth) {
        setPlayerScore(prev => {
          const newScore = prev + 1;
          if (newScore >= winningScore) {
            setGameState('gameOver');
            return newScore;
          }
          resetBall();
          return newScore;
        });
      }
    };

    const gameLoop = () => {
      update();
      draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      gameLoop();
    } else {
      draw();
    }

    const handleMouseMove = (e) => {
      if (gameState !== 'playing') return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      data.leftY = mouseY - data.paddleHeight / 2;
      data.leftY = Math.max(0, Math.min(canvasHeight - data.paddleHeight, data.leftY));
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') {
          pauseGame();
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, pauseGame, resetBall, winningScore]);

  return (
    <div className="pong-container">
      <div className="pong-header">
        <h2>Pong</h2>
        <div className="score-board">
          <div className="score-item player">
            <span className="score-label">You</span>
            <span className="score-value">{playerScore}</span>
          </div>
          <div className="score-divider">-</div>
          <div className="score-item ai">
            <span className="score-label">AI</span>
            <span className="score-value">{aiScore}</span>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />

      <div className="game-controls">
        {gameState === 'start' && (
          <div className="game-message">
            <div className="difficulty-selector">
              <p>Choose Difficulty:</p>
              <div className="difficulty-buttons">
                <button 
                  onClick={() => setDifficulty('easy')} 
                  className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                >
                  Easy
                </button>
                <button 
                  onClick={() => setDifficulty('medium')} 
                  className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
                >
                  Medium
                </button>
                <button 
                  onClick={() => setDifficulty('hard')} 
                  className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
                >
                  Hard
                </button>
                <button 
                  onClick={() => setDifficulty('nuclear')} 
                  className={`difficulty-btn ${difficulty === 'nuclear' ? 'active' : ''}`}
                >
                  Nuclear
                </button>
              </div>
            </div>
            <p>Move your mouse to control the left paddle</p>
            <p>First to {winningScore} points wins!</p>
            <button onClick={startGame} className="game-btn start-btn">
              Start Game
            </button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="game-message">
            <p className="paused">Game Paused</p>
            <button onClick={pauseGame} className="game-btn resume-btn">
              Resume
            </button>
            <button onClick={resetGame} className="game-btn reset-btn">
              New Game
            </button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="game-message">
            <p className="game-over">
              {playerScore >= winningScore ? 'You Win!' : 'AI Wins!'}
            </p>
            <p>Final Score: {playerScore} - {aiScore}</p>
            <button onClick={resetGame} className="game-btn reset-btn">
              Play Again
            </button>
          </div>
        )}

        {gameState === 'serving' && (
          <div className="game-message">
            <p className="serving">Ready to Serve</p>
            <p>Difficulty: <span className="difficulty-display">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span></p>
            <button onClick={serveBall} className="game-btn serve-btn">
              Serve Ball
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="game-controls-playing">
            <button onClick={pauseGame} className="game-btn pause-btn">
              Pause
            </button>
            <span className="controls-hint">Press SPACE to pause</span>
            <span className="difficulty-display">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pong;
