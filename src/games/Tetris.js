import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  PlayArrow, 
  RestartAlt,
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { gameThemes } from '../theme/gameTheme';
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={gameThemes.tetris}>
      <Box 
        sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          py: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth={isMobile ? "sm" : "lg"}>
          {/* Header */}
          <Box textAlign="center" mb={{ xs: 2, md: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ff5722, #ff8a65, #ffab91)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              🧩 Tetris
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1, sm: 2 }} 
              justifyContent="center"
              flexWrap="wrap"
              gap={1}
            >
              <Chip 
                label={`Score: ${score}`} 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                size={isMobile ? "small" : "medium"}
              />
              <Chip 
                label={`Level: ${level}`} 
                color="secondary" 
                variant="outlined"
                sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                size={isMobile ? "small" : "medium"}
              />
              <Chip 
                label={`Lines: ${linesCleared}`} 
                variant="outlined"
                sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                size={isMobile ? "small" : "medium"}
              />
            </Stack>
          </Box>

          {/* Game Area */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3}
                sx={{ 
                  position: 'relative',
                  p: { xs: 1, md: 2 },
                  borderRadius: 3,
                  background: 'rgba(0, 0, 0, 0.8)',
                }}
              >
                <canvas 
                  ref={canvasRef} 
                  width={BOARD_WIDTH * CELL_SIZE} 
                  height={BOARD_HEIGHT * CELL_SIZE}
                  style={{
                    border: '2px solid #ff5722',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: isMobile ? '300px' : `${BOARD_WIDTH * CELL_SIZE}px`,
                    height: 'auto',
                    boxShadow: '0 8px 32px rgba(255, 87, 34, 0.15)'
                  }}
                />
              
              {gameState === 'start' && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgcolor="rgba(0, 0, 0, 0.8)"
                  borderRadius={3}
                >
                  <Card sx={{ maxWidth: 300, textAlign: 'center' }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom color="primary">
                        Ready to Stack?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Stack the falling pieces to clear lines!
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<PlayArrow />}
                        onClick={startGame}
                        sx={{ 
                          background: 'linear-gradient(45deg, #ff5722, #ff8a65)',
                          mt: 2
                        }}
                      >
                        Start Game
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {gameState === 'gameOver' && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgcolor="rgba(0, 0, 0, 0.8)"
                  borderRadius={3}
                >
                  <Card sx={{ maxWidth: 300, textAlign: 'center' }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom color="error">
                        Game Over!
                      </Typography>
                      <Typography variant="body1" color="primary" gutterBottom>
                        Final Score: {score}
                      </Typography>
                      <Typography variant="body2" color="secondary" sx={{ mb: 2 }}>
                        Lines Cleared: {linesCleared}
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<RestartAlt />}
                        onClick={resetGame}
                        sx={{ 
                          background: 'linear-gradient(45deg, #f44336, #e57373)',
                          mt: 2
                        }}
                      >
                        Play Again
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              )}
              </Paper>
            </Grid>
            
            {/* Side Panel */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                {/* Next Piece */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                      Next Piece
                    </Typography>
                    <Box 
                      display="flex" 
                      justifyContent="center" 
                      alignItems="center" 
                      minHeight={80}
                      sx={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 87, 34, 0.3)'
                      }}
                    >
                      {nextPiece && (
                        <Box>
                          {nextPiece.shape.map((row, y) => (
                            <Box key={y} display="flex">
                              {row.map((cell, x) => (
                                <Box 
                                  key={x}
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    backgroundColor: cell ? nextPiece.color : 'transparent',
                                    border: cell ? '1px solid rgba(0, 0, 0, 0.3)' : 'none',
                                    borderRadius: 0.5
                                  }}
                                />
                              ))}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Controls */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                      Controls
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <KeyboardArrowLeft color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="← → Move piece" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <KeyboardArrowDown color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="↓ Soft drop" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <KeyboardArrowUp color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="↑ or Space to rotate" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                {/* Reset Button for Playing State */}
                {gameState === 'playing' && (
                  <Button 
                    variant="outlined"
                    startIcon={<RestartAlt />}
                    onClick={resetGame}
                    fullWidth
                  >
                    Reset Game
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Tetris;