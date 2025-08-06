// src/games/Snake.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  KeyboardArrowUp
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { gameThemes } from '../theme/gameTheme';
import soundGenerator from '../utils/soundUtils';
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
    soundGenerator.blip(400, 0.1);
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
    soundGenerator.blip(600, 0.1);
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
        case 'ArrowUp': 
          e.preventDefault(); // Prevent page scroll
          if (direction !== 'DOWN' && snake.length > 1) {
            // Prevent reverse if snake has more than 1 segment
            if (direction !== 'UP') setDirection('UP');
          } else if (snake.length === 1) {
            setDirection('UP');
          }
          break;
        case 'ArrowDown': 
          e.preventDefault(); // Prevent page scroll
          if (direction !== 'UP' && snake.length > 1) {
            // Prevent reverse if snake has more than 1 segment
            if (direction !== 'DOWN') setDirection('DOWN');
          } else if (snake.length === 1) {
            setDirection('DOWN');
          }
          break;
        case 'ArrowLeft': 
          e.preventDefault(); // Prevent page scroll
          if (direction !== 'RIGHT' && snake.length > 1) {
            // Prevent reverse if snake has more than 1 segment
            if (direction !== 'LEFT') setDirection('LEFT');
          } else if (snake.length === 1) {
            setDirection('LEFT');
          }
          break;
        case 'ArrowRight': 
          e.preventDefault(); // Prevent page scroll
          if (direction !== 'LEFT' && snake.length > 1) {
            // Prevent reverse if snake has more than 1 segment
            if (direction !== 'RIGHT') setDirection('RIGHT');
          } else if (snake.length === 1) {
            setDirection('RIGHT');
          }
          break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameState, snake.length]);

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
            soundGenerator.gameOver();
            setGameState('gameOver');
            return prevSnake;
          }

          const newSnake = [head, ...prevSnake];

          if (head.x === food.x && head.y === food.y) {
            soundGenerator.coin();
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={gameThemes.snake}>
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
                background: 'linear-gradient(135deg, #4caf50, #81c784, #a5d6a7)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              🐍 Snake Game
            </Typography>
            
            <Stack 
              direction={{ xs: 'row', sm: 'row' }} 
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
            </Stack>
          </Box>

          {/* Game Area */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={8}>
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
                  width={canvasSize} 
                  height={canvasSize}
                  style={{
                    border: '2px solid #4caf50',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: isMobile ? '350px' : '400px',
                    height: 'auto',
                    boxShadow: '0 8px 32px rgba(76, 175, 80, 0.15)'
                  }}
                  onTouchStart={(e) => {
                    if (gameState !== 'playing') return;
                    e.preventDefault();
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    
                    const rect = canvas.getBoundingClientRect();
                    const touch = e.touches[0];
                    const touchX = touch.clientX - rect.left;
                    const canvasWidth = rect.width;
                    
                    // Tap on left half = turn left, right half = turn right
                    if (touchX < canvasWidth / 2) {
                      // Turn left (counterclockwise)
                      switch (direction) {
                        case 'UP': setDirection('LEFT'); break;
                        case 'DOWN': setDirection('RIGHT'); break;
                        case 'LEFT': setDirection('DOWN'); break;
                        case 'RIGHT': setDirection('UP'); break;
                        default: break;
                      }
                    } else {
                      // Turn right (clockwise)
                      switch (direction) {
                        case 'UP': setDirection('RIGHT'); break;
                        case 'DOWN': setDirection('LEFT'); break;
                        case 'LEFT': setDirection('UP'); break;
                        case 'RIGHT': setDirection('DOWN'); break;
                        default: break;
                      }
                    }
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
                        Ready to Slither?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Use arrow keys to guide the snake and collect food!
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<PlayArrow />}
                        onClick={startGame}
                        sx={{ 
                          background: 'linear-gradient(45deg, #4caf50, #81c784)',
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
          </Grid>

          {/* Controls */}
          <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                How to Play
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <KeyboardArrowUp color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={isMobile ? "Tap left/right side of screen to turn the snake" : "Use arrow keys to control the snake"} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>🍎</ListItemIcon>
                  <ListItemText primary="Eat the red apples to grow longer" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>🚫</ListItemIcon>
                  <ListItemText primary="Don't hit the walls or your own tail" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>🎯</ListItemIcon>
                  <ListItemText primary="Try to get the highest score possible!" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Snake;
