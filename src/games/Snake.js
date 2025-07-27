// src/games/Snake.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Snake.css';

const Snake = () => {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver'
  const [direction, setDirection] = useState('RIGHT');
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  
  const boxSize = 20;
  const canvasSize = 400;
  const gridSize = canvasSize / boxSize;

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  }, [gridSize]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setFood(generateFood());
    setScore(0);
    setGameState('start');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [generateFood]);

  const startGame = useCallback(() => {
    setGameState('playing');
  }, []);

  const checkCollision = useCallback((head, snakeBody) => {
    // Check wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      return true;
    }
    
    // Check self collision
    for (let segment of snakeBody) {
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }
    
    return false;
  }, [gridSize]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      intervalRef.current = setInterval(() => {
        setSnake(prevSnake => {
          const head = { ...prevSnake[0] };
          
          switch (direction) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
            default: break;
          }

          if (checkCollision(head, prevSnake)) {
            setGameState('gameOver');
            return prevSnake;
          }

          const newSnake = [head, ...prevSnake];

          if (head.x === food.x && head.y === food.y) {
            setScore(prev => prev + 10);
            setFood(generateFood());
          } else {
            newSnake.pop();
          }

          return newSnake;
        });
      }, 150);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [direction, food, gameState, checkCollision, generateFood]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw food as a shiny apple
    const foodX = food.x * boxSize + boxSize / 2;
    const foodY = food.y * boxSize + boxSize / 2;
    const foodRadius = boxSize * 0.4;
    
    // Apple body
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, 2 * Math.PI);
    const foodGradient = ctx.createRadialGradient(foodX - 3, foodY - 3, 0, foodX, foodY, foodRadius);
    foodGradient.addColorStop(0, '#ff8a8a');
    foodGradient.addColorStop(1, '#ff4757');
    ctx.fillStyle = foodGradient;
    ctx.fill();
    
    // Apple highlight
    ctx.beginPath();
    ctx.ellipse(foodX - 4, foodY - 4, 4, 6, -0.3, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    // Draw snake segments
    snake.forEach((segment, index) => {
      const x = segment.x * boxSize + boxSize / 2;
      const y = segment.y * boxSize + boxSize / 2;
      const radius = boxSize * 0.45;
      
      if (index === 0) {
        // Snake head
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        
        // Head gradient
        const headGradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, radius);
        headGradient.addColorStop(0, '#40e0d0');
        headGradient.addColorStop(1, '#00bcd4');
        ctx.fillStyle = headGradient;
        ctx.fill();
        
        // Head outline
        ctx.strokeStyle = '#006064';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Eyes
        const eyeSize = 3;
        const eyeOffset = 6;
        
        // Determine eye position based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2;
        switch (direction) {
          case 'UP':
            eyeX1 = x - eyeOffset; eyeY1 = y - 4;
            eyeX2 = x + eyeOffset; eyeY2 = y - 4;
            break;
          case 'DOWN':
            eyeX1 = x - eyeOffset; eyeY1 = y + 4;
            eyeX2 = x + eyeOffset; eyeY2 = y + 4;
            break;
          case 'LEFT':
            eyeX1 = x - 4; eyeY1 = y - eyeOffset;
            eyeX2 = x - 4; eyeY2 = y + eyeOffset;
            break;
          case 'RIGHT':
          default:
            eyeX1 = x + 4; eyeY1 = y - eyeOffset;
            eyeX2 = x + 4; eyeY2 = y + eyeOffset;
            break;
        }
        
        // Draw eyes
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, eyeSize, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, eyeSize, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();
        
        // Eye pupils
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#000000';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(eyeX2, eyeY2, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        
      } else {
        // Snake body segments
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        
        // Body gradient
        const bodyGradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, radius);
        bodyGradient.addColorStop(0, '#4dd0e1');
        bodyGradient.addColorStop(1, '#26a69a');
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        
        // Body outline
        ctx.strokeStyle = '#004d40';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Scale pattern
        if (index % 2 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.6, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();
        }
      }
    });
  }, [snake, food, direction]);

  return (
    <div className="snake-container">
      <div className="snake-header">
        <h2>Snake Game</h2>
        <div className="score">Score: {score}</div>
      </div>
      
      <canvas ref={canvasRef} width={canvasSize} height={canvasSize} />
      
      <div className="game-controls">
        {gameState === 'start' && (
          <div className="game-message">
            <p>Use arrow keys to control the snake</p>
            <button onClick={startGame} className="game-btn start-btn">
              Start Game
            </button>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="game-message">
            <p className="game-over">Game Over!</p>
            <p>Final Score: {score}</p>
            <button onClick={resetGame} className="game-btn reset-btn">
              Play Again
            </button>
          </div>
        )}
        
        {gameState === 'playing' && (
          <button onClick={resetGame} className="game-btn reset-btn">
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
};

export default Snake;
