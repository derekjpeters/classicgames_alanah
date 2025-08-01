// src/games/Frogger.js
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
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  PlayArrow, 
  RestartAlt, 
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './Frogger.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10b981', // Emerald for Frogger theme
      light: '#34d399',
      dark: '#059669',
    },
    secondary: {
      main: '#f59e0b', // Warm amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#0f172a', // Dark slate
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f8fafc', // Nearly white
      secondary: '#cbd5e1', // Slate 300
    },
    error: {
      main: '#ef4444', // Red
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(16, 185, 129, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const Frogger = () => {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver', 'won'
  const [frog, setFrog] = useState({ x: 200, y: 480 });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  const canvasWidth = 400;
  const canvasHeight = 500;
  const frogSize = 20;
  const laneHeight = 40;

  // Game objects
  const [cars, setCars] = useState([]);
  const [logs, setLogs] = useState([]);
  const [turtles, setTurtles] = useState([]);

  // Initialize obstacles
  const initializeObstacles = useCallback(() => {
    const newCars = [];
    const newLogs = [];
    const newTurtles = [];

    // Road lanes (cars) - positioned in road zone (200-400)
    for (let lane = 0; lane < 5; lane++) {
      const y = 220 + (lane * laneHeight);
      const speed = (lane % 2 === 0 ? 1.5 : -1.5) * (1 + level * 0.2);
      
      for (let i = 0; i < 3; i++) {
        newCars.push({
          x: i * 150 + (lane % 2 === 0 ? 0 : 200),
          y: y,
          width: 40,
          height: 20,
          speed: speed,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
      }
    }

    // Water lanes (logs and turtles) - positioned in water zone (40-160)
    for (let lane = 0; lane < 3; lane++) {
      const y = 60 + (lane * laneHeight);
      const speed = (lane % 2 === 0 ? 1 : -1) * (1 + level * 0.1);
      
      if (lane % 2 === 0) {
        // Logs
        for (let i = 0; i < 2; i++) {
          newLogs.push({
            x: i * 200 + 50,
            y: y,
            width: 80,
            height: 20,
            speed: speed
          });
        }
      } else {
        // Turtles
        for (let i = 0; i < 3; i++) {
          newTurtles.push({
            x: i * 120 + 30,
            y: y,
            width: 60,
            height: 20,
            speed: speed,
            submerged: false,
            timer: Math.random() * 200
          });
        }
      }
    }

    setCars(newCars);
    setLogs(newLogs);
    setTurtles(newTurtles);
  }, [level]);

  const resetGame = useCallback(() => {
    setFrog({ x: 200, y: 480 });
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('start');
    initializeObstacles();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initializeObstacles]);

  const startGame = useCallback(() => {
    setGameState('playing');
    initializeObstacles();
  }, [initializeObstacles]);

  const moveFrog = useCallback((direction) => {
    if (gameState !== 'playing') return;

    setFrog(prevFrog => {
      let newX = prevFrog.x;
      let newY = prevFrog.y;

      switch (direction) {
        case 'UP':
          newY = Math.max(0, prevFrog.y - laneHeight);
          break;
        case 'DOWN':
          newY = Math.min(480, prevFrog.y + laneHeight);
          break;
        case 'LEFT':
          newX = Math.max(0, prevFrog.x - 20);
          break;
        case 'RIGHT':
          newX = Math.min(380, prevFrog.x + 20);
          break;
        default:
          break;
      }

      // Check if reached the top (win condition)
      if (newY <= 20) {
        setScore(prev => prev + 100 * level);
        setLevel(prev => prev + 1);
        return { x: 200, y: 480 }; // Reset frog position
      }

      return { x: newX, y: newY };
    });
  }, [gameState, level]);

  const checkCollisions = useCallback(() => {
    const frogRect = {
      x: frog.x,
      y: frog.y,
      width: frogSize,
      height: frogSize
    };

    // Define game zones more clearly
    const zones = {
      topSafe: { start: 0, end: 40 },
      water: { start: 40, end: 160 },
      middleSafe: { start: 160, end: 200 },
      road: { start: 200, end: 400 },
      bottomSafe: { start: 400, end: 500 }
    };

    // Check if frog is in safe zones (no collision checks needed)
    if ((frog.y >= zones.topSafe.start && frog.y < zones.topSafe.end) ||
        (frog.y >= zones.middleSafe.start && frog.y < zones.middleSafe.end) ||
        (frog.y >= zones.bottomSafe.start && frog.y < zones.bottomSafe.end)) {
      return null; // Safe zone, no collision
    }

    // Check car collisions (road area)
    if (frog.y >= zones.road.start && frog.y < zones.road.end) {
      for (let car of cars) {
        if (frogRect.x < car.x + car.width &&
            frogRect.x + frogRect.width > car.x &&
            frogRect.y < car.y + car.height &&
            frogRect.y + frogRect.height > car.y) {
          return 'car';
        }
      }
      return null; // In road but no car collision
    }

    // Check water area
    if (frog.y >= zones.water.start && frog.y < zones.water.end) {
      let onSafeObject = false;

      // Check if on log
      for (let log of logs) {
        if (frogRect.x < log.x + log.width &&
            frogRect.x + frogRect.width > log.x &&
            frogRect.y < log.y + log.height &&
            frogRect.y + frogRect.height > log.y) {
          onSafeObject = true;
          // Move frog with log
          setFrog(prev => ({
            ...prev,
            x: Math.max(0, Math.min(380, prev.x + log.speed))
          }));
          break;
        }
      }

      // Check if on turtle (and not submerged)
      if (!onSafeObject) {
        for (let turtle of turtles) {
          if (!turtle.submerged &&
              frogRect.x < turtle.x + turtle.width &&
              frogRect.x + frogRect.width > turtle.x &&
              frogRect.y < turtle.y + turtle.height &&
              frogRect.y + frogRect.height > turtle.y) {
            onSafeObject = true;
            // Move frog with turtle
            setFrog(prev => ({
              ...prev,
              x: Math.max(0, Math.min(380, prev.x + turtle.speed))
            }));
            break;
          }
        }
      }

      if (!onSafeObject) {
        return 'water';
      }
    }

    return null;
  }, [frog, cars, logs, turtles]);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update cars
    setCars(prevCars => 
      prevCars.map(car => ({
        ...car,
        x: car.speed > 0 
          ? (car.x + car.speed) % (canvasWidth + car.width)
          : car.x + car.speed < -car.width 
            ? canvasWidth 
            : car.x + car.speed
      }))
    );

    // Update logs
    setLogs(prevLogs => 
      prevLogs.map(log => ({
        ...log,
        x: log.speed > 0 
          ? (log.x + log.speed) % (canvasWidth + log.width)
          : log.x + log.speed < -log.width 
            ? canvasWidth 
            : log.x + log.speed
      }))
    );

    // Update turtles
    setTurtles(prevTurtles => 
      prevTurtles.map(turtle => ({
        ...turtle,
        x: turtle.speed > 0 
          ? (turtle.x + turtle.speed) % (canvasWidth + turtle.width)
          : turtle.x + turtle.speed < -turtle.width 
            ? canvasWidth 
            : turtle.x + turtle.speed,
        timer: turtle.timer + 1,
        submerged: Math.floor(turtle.timer / 120) % 3 === 2
      }))
    );

    // Check collisions
    const collision = checkCollisions();
    if (collision) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState('gameOver');
        } else {
          setFrog({ x: 200, y: 480 });
        }
        return newLives;
      });
    }
  }, [gameState, checkCollisions]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw safe zones
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvasWidth, 40); // Top safe zone (0-40)
    ctx.fillRect(0, 160, canvasWidth, 40); // Middle safe zone (160-200)
    ctx.fillRect(0, 400, canvasWidth, 100); // Bottom safe zone (400-500)

    // Draw water
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(0, 40, canvasWidth, 120); // Water zone (40-160)

    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 200, canvasWidth, 200); // Road zone (200-400)

    // Draw lane dividers
    ctx.strokeStyle = '#FFF';
    ctx.setLineDash([10, 10]);
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 200 + i * 40);
      ctx.lineTo(canvasWidth, 200 + i * 40);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw cars with modern shapes
    cars.forEach(car => {
      ctx.save();
      
      // Car body with rounded corners
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.roundRect(car.x, car.y + 10, car.width, car.height, 4);
      ctx.fill();
      
      // Car windows
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.roundRect(car.x + 6, car.y + 12, car.width - 12, car.height - 4, 2);
      ctx.fill();
      
      // Car lights
      ctx.fillStyle = '#FFFF99';
      if (car.speed > 0) {
        // Headlights (right side)
        ctx.fillRect(car.x + car.width - 3, car.y + 12, 2, 4);
        ctx.fillRect(car.x + car.width - 3, car.y + 24, 2, 4);
      } else {
        // Headlights (left side)
        ctx.fillRect(car.x + 1, car.y + 12, 2, 4);
        ctx.fillRect(car.x + 1, car.y + 24, 2, 4);
      }
      
      // Wheels
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(car.x + 8, car.y + 32, 3, 0, Math.PI * 2);
      ctx.arc(car.x + car.width - 8, car.y + 32, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });

    // Draw logs with realistic wood texture
    logs.forEach(log => {
      ctx.save();
      
      // Log body with rounded ends
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.roundRect(log.x, log.y + 10, log.width, log.height, log.height / 2);
      ctx.fill();
      
      // Wood grain lines
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(log.x + 5, log.y + 12 + i * 6);
        ctx.lineTo(log.x + log.width - 5, log.y + 12 + i * 6);
        ctx.stroke();
      }
      
      // Log ends
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      ctx.arc(log.x + 2, log.y + 20, 8, 0, Math.PI * 2);
      ctx.arc(log.x + log.width - 2, log.y + 20, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Tree rings on ends
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 1.5;
      for (let ring = 1; ring <= 2; ring++) {
        ctx.beginPath();
        ctx.arc(log.x + 2, log.y + 20, ring * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(log.x + log.width - 2, log.y + 20, ring * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
    });

    // Draw turtles with detailed shells
    turtles.forEach(turtle => {
      if (!turtle.submerged) {
        ctx.save();
        
        // Draw individual turtles on the platform
        for (let i = 0; i < 3; i++) {
          const turtleX = turtle.x + i * 20;
          const turtleY = turtle.y + 10;
          
          // Turtle body
          ctx.fillStyle = '#228B22';
          ctx.beginPath();
          ctx.ellipse(turtleX + 10, turtleY + 10, 8, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Turtle shell with pattern
          ctx.fillStyle = '#006400';
          ctx.beginPath();
          ctx.ellipse(turtleX + 10, turtleY + 8, 6, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Shell pattern
          ctx.strokeStyle = '#228B22';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(turtleX + 10, turtleY + 4);
          ctx.lineTo(turtleX + 10, turtleY + 12);
          ctx.moveTo(turtleX + 6, turtleY + 8);
          ctx.lineTo(turtleX + 14, turtleY + 8);
          ctx.stroke();
          
          // Turtle head
          ctx.fillStyle = '#32CD32';
          ctx.beginPath();
          ctx.arc(turtleX + 10, turtleY + 15, 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Eyes
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(turtleX + 9, turtleY + 14, 0.5, 0, Math.PI * 2);
          ctx.arc(turtleX + 11, turtleY + 14, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      } else {
        // Draw water ripples when submerged
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.ellipse(turtle.x + turtle.width/2, turtle.y + 15, turtle.width/2, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw frog with detailed sprite
    ctx.save();
    ctx.translate(frog.x + frogSize/2, frog.y + frogSize/2);
    
    // Frog body
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.ellipse(0, 2, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Frog head
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.ellipse(0, -2, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Frog legs
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    // Back legs
    ctx.ellipse(-6, 4, 3, 2, -0.5, 0, Math.PI * 2);
    ctx.ellipse(6, 4, 3, 2, 0.5, 0, Math.PI * 2);
    // Front legs
    ctx.ellipse(-4, 0, 2, 1.5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(4, 0, 2, 1.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Frog eyes
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(-3, -4, 2, 0, Math.PI * 2);
    ctx.arc(3, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-3, -4, 1, 0, Math.PI * 2);
    ctx.arc(3, -4, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Frog mouth
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -1, 2, 0, Math.PI);
    ctx.stroke();
    
    ctx.restore();

    // Draw UI
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Lives: ${lives}`, 150, 25);
    ctx.fillText(`Level: ${level}`, 280, 25);

  }, [frog, cars, logs, turtles, score, lives, level]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      intervalRef.current = setInterval(() => {
        updateGame();
        draw();
      }, 50);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      draw();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState, updateGame, draw]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveFrog('UP');
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveFrog('DOWN');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveFrog('LEFT');
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveFrog('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveFrog]);

  // Handle touch controls
  const handleTouchMove = useCallback((direction) => {
    moveFrog(direction);
  }, [moveFrog]);

  // Initialize on mount
  useEffect(() => {
    draw();
  }, [draw]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={theme}>
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
                background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              🐸 Frogger
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
              <Chip 
                label={`Lives: ${lives}`} 
                color="error" 
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
                  width={canvasWidth}
                  height={canvasHeight}
                  style={{
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: isMobile ? '350px' : '400px',
                    height: 'auto',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)'
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
                        Ready to Cross?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Use arrow keys to guide the frog safely across roads and rivers!
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
                      <Typography variant="body2" color="secondary" paragraph>
                        Level Reached: {level}
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
            
            {/* Mobile Touch Controls */}
            {isMobile && (
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Typography variant="h6" color="primary" mb={1} textAlign="center">
                    Touch Controls
                  </Typography>
                  
                  {/* Up Button */}
                  <IconButton
                    onClick={() => handleTouchMove('UP')}
                    disabled={gameState !== 'playing'}
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': { bgcolor: 'grey.600' },
                      mb: 1
                    }}
                  >
                    <KeyboardArrowUp fontSize="large" />
                  </IconButton>
                  
                  {/* Left and Right Buttons */}
                  <Box display="flex" gap={2} mb={1}>
                    <IconButton
                      onClick={() => handleTouchMove('LEFT')}
                      disabled={gameState !== 'playing'}
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&:disabled': { bgcolor: 'grey.600' }
                      }}
                    >
                      <KeyboardArrowLeft fontSize="large" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleTouchMove('RIGHT')}
                      disabled={gameState !== 'playing'}
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&:disabled': { bgcolor: 'grey.600' }
                      }}
                    >
                      <KeyboardArrowRight fontSize="large" />
                    </IconButton>
                  </Box>
                  
                  {/* Down Button */}
                  <IconButton
                    onClick={() => handleTouchMove('DOWN')}
                    disabled={gameState !== 'playing'}
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': { bgcolor: 'grey.600' }
                    }}
                  >
                    <KeyboardArrowDown fontSize="large" />
                  </IconButton>
                </Paper>
              </Grid>
            )}
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
                  <ListItemText primary="Use arrow keys to move the frog" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>🚗</ListItemIcon>
                  <ListItemText primary="Cross roads without getting hit by cars" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>🪵</ListItemIcon>
                  <ListItemText primary="Jump on logs and turtles to cross rivers" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>🐢</ListItemIcon>
                  <ListItemText primary="Avoid submerged turtles!" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>🎯</ListItemIcon>
                  <ListItemText primary="Reach the top to advance to the next level" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Frogger;