import { useEffect, useRef, useState, useCallback } from 'react';
import './Tetris.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

const TETRIS_PIECES = [
  {
    shape: [
      [1, 1, 1, 1]
    ],
    color: '#00f5ff'
  },
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffeb3b'
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#9c27b0'
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#4caf50'
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#f44336'
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#ff9800'
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#2196f3'
  }
];

const Tetris = () => {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [gameState, setGameState] = useState('start');
  const [board, setBoard] = useState(() => 
    Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [nextPiece, setNextPiece] = useState(null);

  const getRandomPiece = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * TETRIS_PIECES.length);
    return TETRIS_PIECES[randomIndex];
  }, []);

  const rotatePiece = useCallback((piece) => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  const isValidPosition = useCallback((piece, pos, boardState) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && boardState[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((piece, pos, boardState) => {
    const newBoard = boardState.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = pos.y + y;
          const boardX = pos.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    return newBoard;
  }, []);

  const clearLines = useCallback((boardState) => {
    const newBoard = [];
    let clearedCount = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (boardState[y].every(cell => cell !== 0)) {
        clearedCount++;
      } else {
        newBoard.unshift(boardState[y]);
      }
    }
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { board: newBoard, linesCleared: clearedCount };
  }, []);

  const spawnNewPiece = useCallback(() => {
    const piece = nextPiece || getRandomPiece();
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    
    setCurrentPiece(piece);
    setCurrentPosition(startPos);
    setNextPiece(getRandomPiece());
    
    return { piece, startPos };
  }, [nextPiece, getRandomPiece]);

  const resetGame = useCallback(() => {
    setBoard(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0)));
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setCurrentPiece(null);
    setNextPiece(null);
    setGameState('start');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    const newPiece = getRandomPiece();
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    setCurrentPiece(newPiece);
    setCurrentPosition(startPos);
    setNextPiece(getRandomPiece());
  }, [getRandomPiece]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || !currentPiece) return;
      
      e.preventDefault();
      
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentPosition(pos => {
            const newPos = { ...pos, x: pos.x - 1 };
            return isValidPosition(currentPiece, newPos, board) ? newPos : pos;
          });
          break;
        case 'ArrowRight':
          setCurrentPosition(pos => {
            const newPos = { ...pos, x: pos.x + 1 };
            return isValidPosition(currentPiece, newPos, board) ? newPos : pos;
          });
          break;
        case 'ArrowDown':
          setCurrentPosition(pos => {
            const newPos = { ...pos, y: pos.y + 1 };
            return isValidPosition(currentPiece, newPos, board) ? newPos : pos;
          });
          break;
        case 'ArrowUp':
        case ' ':
          setCurrentPiece(piece => {
            const rotated = rotatePiece(piece);
            return isValidPosition(rotated, currentPosition, board) ? rotated : piece;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentPiece, currentPosition, board, isValidPosition, rotatePiece]);

  useEffect(() => {
    if (gameState === 'playing' && currentPiece) {
      const fallSpeed = Math.max(100, 1000 - (level - 1) * 100);
      
      intervalRef.current = setInterval(() => {
        setCurrentPosition(pos => {
          const newPos = { ...pos, y: pos.y + 1 };
          
          if (isValidPosition(currentPiece, newPos, board)) {
            return newPos;
          } else {
            const newBoard = placePiece(currentPiece, pos, board);
            const { board: clearedBoard, linesCleared: cleared } = clearLines(newBoard);
            
            setBoard(clearedBoard);
            setLinesCleared(prev => prev + cleared);
            setScore(prev => prev + cleared * 100 * level);
            setLevel(Math.floor(linesCleared / 10) + 1);
            
            const { piece: newPiece, startPos } = spawnNewPiece();
            
            if (!isValidPosition(newPiece, startPos, clearedBoard)) {
              setGameState('gameOver');
              return pos;
            }
            
            return startPos;
          }
        });
      }, fallSpeed);
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
  }, [gameState, currentPiece, board, level, linesCleared, isValidPosition, placePiece, clearLines, spawnNewPiece]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          ctx.fillStyle = board[y][x];
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
    
    if (currentPiece && gameState === 'playing') {
      ctx.fillStyle = currentPiece.color;
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const drawX = (currentPosition.x + x) * CELL_SIZE;
            const drawY = (currentPosition.y + y) * CELL_SIZE;
            ctx.fillRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
  }, [board, currentPiece, currentPosition, gameState]);

  return (
    <div className="tetris-container">
      <div className="tetris-header">
        <h2>Tetris</h2>
        <div className="game-stats">
          <div className="stat">Score: {score}</div>
          <div className="stat">Level: {level}</div>
          <div className="stat">Lines: {linesCleared}</div>
        </div>
      </div>
      
      <div className="tetris-game">
        <canvas 
          ref={canvasRef} 
          width={BOARD_WIDTH * CELL_SIZE} 
          height={BOARD_HEIGHT * CELL_SIZE}
          className="tetris-board"
        />
        
        <div className="tetris-side">
          <div className="next-piece">
            <h3>Next</h3>
            <div className="next-piece-display">
              {nextPiece && (
                <div className="piece-preview">
                  {nextPiece.shape.map((row, y) => (
                    <div key={y} className="piece-row">
                      {row.map((cell, x) => (
                        <div 
                          key={x} 
                          className="piece-cell"
                          style={{
                            backgroundColor: cell ? nextPiece.color : 'transparent',
                            border: cell ? '1px solid #000' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="controls-info">
            <h3>Controls</h3>
            <div className="control-item">← → Move</div>
            <div className="control-item">↓ Soft Drop</div>
            <div className="control-item">↑ or Space Rotate</div>
          </div>
        </div>
      </div>
      
      <div className="game-controls">
        {gameState === 'start' && (
          <div className="game-message">
            <p>Stack the falling pieces to clear lines!</p>
            <button onClick={startGame} className="game-btn start-btn">
              Start Game
            </button>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="game-message">
            <p className="game-over">Game Over!</p>
            <p>Final Score: {score}</p>
            <p>Lines Cleared: {linesCleared}</p>
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

export default Tetris;