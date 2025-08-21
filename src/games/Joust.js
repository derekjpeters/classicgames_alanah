// src/games/Joust.js
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
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  PlayArrow, 
  RestartAlt,
  KeyboardArrowUp,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import soundGenerator from '../utils/soundUtils';
import './Joust.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5a3c',
      light: '#a67c52',
      dark: '#6b4423',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    error: {
      main: '#ef4444',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          border: '1px solid #8b5a3c',
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
          boxShadow: '0 4px 14px 0 rgba(139, 90, 60, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(139, 90, 60, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          border: '1px solid #8b5a3c',
          borderRadius: '16px',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Simple game constants
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.15; // Much slower gravity
const FLAP_POWER = -3.5; // Much gentler flapping
const PLAYER_SPEED = 1.2; // Much slower movement

const Joust = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const keysRef = useRef({});
  
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  
  // Simple game objects
  const [player, setPlayer] = useState({
    x: 100,
    y: 200,
    vx: 0,
    vy: 0,
    width: 40,
    height: 30,
    facing: 1,
    flapCooldown: 0
  });
  
  const [enemies, setEnemies] = useState([]);
  
  const [platforms] = useState([
    { x: 0, y: 350, width: 150, height: 20 },
    { x: 200, y: 350, width: 200, height: 20 },
    { x: 450, y: 350, width: 150, height: 20 },
    { x: 100, y: 250, width: 120, height: 20 },
    { x: 380, y: 250, width: 120, height: 20 },
    { x: 250, y: 150, width: 100, height: 20 }
  ]);

  // Initialize enemies
  const initEnemies = useCallback(() => {
    const newEnemies = [];
    for (let i = 0; i < 3; i++) {
      newEnemies.push({
        x: 350 + i * 80, // Spread them out more
        y: 250, // Start them on a platform level
        vx: 0, // Start completely still
        vy: 0, // Start completely still
        width: 35,
        height: 25,
        facing: -1,
        aiTimer: 180 + Math.random() * 180 // Very long initial wait
      });
    }
    setEnemies(newEnemies);
  }, []);

  const resetGame = useCallback(() => {
    soundGenerator.blip(400, 0.1);
    setPlayer({ x: 100, y: 200, vx: 0, vy: 0, width: 40, height: 30, facing: 1, flapCooldown: 0 });
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('start');
    initEnemies();
  }, [initEnemies]);

  const startGame = useCallback(() => {
    soundGenerator.blip(600, 0.1);
    setGameState('playing');
    initEnemies();
  }, [initEnemies]);

  // Collision detection
  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  // Platform collision - improved detection
  const checkPlatformCollision = useCallback((obj) => {
    for (let platform of platforms) {
      // Check if object is falling and would intersect with platform
      if (obj.vy > 0) {
        const objLeft = obj.x;
        const objRight = obj.x + obj.width;
        const objBottom = obj.y + obj.height;
        const objTop = obj.y;
        
        const platLeft = platform.x;
        const platRight = platform.x + platform.width;
        const platTop = platform.y;
        
        // Check horizontal overlap
        if (objRight > platLeft && objLeft < platRight) {
          // Check if object is landing on top of platform
          if (objBottom >= platTop && objTop < platTop) {
            return platform;
          }
        }
      }
    }
    return null;
  }, [platforms]);

  // Simple keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update player
    setPlayer(prev => {
      let newPlayer = { ...prev };
      
      // Handle input with momentum
      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
        newPlayer.vx = Math.max(-PLAYER_SPEED, newPlayer.vx - 0.1); // Much slower acceleration
        newPlayer.facing = -1;
      } else if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
        newPlayer.vx = Math.min(PLAYER_SPEED, newPlayer.vx + 0.1); // Much slower acceleration
        newPlayer.facing = 1;
      } else {
        newPlayer.vx *= 0.92; // Less aggressive friction
      }
      
      // Flap with cooldown to prevent spam
      if ((keysRef.current['Space'] || keysRef.current['ArrowUp'] || keysRef.current['KeyW'])) {
        if (!newPlayer.flapCooldown || newPlayer.flapCooldown <= 0) {
          newPlayer.vy = FLAP_POWER;
          newPlayer.flapCooldown = 15; // Longer cooldown for more controlled flapping
          soundGenerator.blip(300, 0.05);
        }
      }
      
      // Decrease flap cooldown
      if (newPlayer.flapCooldown > 0) {
        newPlayer.flapCooldown--;
      }
      
      // Apply gravity
      newPlayer.vy += GRAVITY;
      
      // Update position
      newPlayer.x += newPlayer.vx;
      newPlayer.y += newPlayer.vy;
      
      // Limit velocity
      newPlayer.vy = Math.min(newPlayer.vy, 10);
      
      // Platform collision
      const platformHit = checkPlatformCollision(newPlayer);
      if (platformHit) {
        newPlayer.y = platformHit.y - newPlayer.height;
        newPlayer.vy = 0;
      }
      
      // Boundary collision
      if (newPlayer.x < 0) newPlayer.x = 0;
      if (newPlayer.x > CANVAS_WIDTH - newPlayer.width) newPlayer.x = CANVAS_WIDTH - newPlayer.width;
      if (newPlayer.y < 0) {
        newPlayer.y = 0;
        newPlayer.vy = 0;
      }
      if (newPlayer.y > CANVAS_HEIGHT - newPlayer.height) {
        newPlayer.y = CANVAS_HEIGHT - newPlayer.height;
        newPlayer.vy = 0;
      }
      
      return newPlayer;
    });

    // Update enemies with much more controlled behavior
    setEnemies(prev => prev.map(enemy => {
      let newEnemy = { ...enemy };
      
      // Much more controlled AI
      newEnemy.aiTimer--;
      if (newEnemy.aiTimer <= 0) {
        // Very rarely flap, and only if falling fast
        if (newEnemy.vy > 3 && Math.random() < 0.2) {
          newEnemy.vy = FLAP_POWER * 0.5; // Very gentle flapping
        }
        // Very gentle horizontal movement
        if (Math.random() < 0.15) {
          const direction = Math.random() < 0.5 ? -1 : 1;
          newEnemy.vx += direction * 0.3; // Very small velocity changes
          newEnemy.facing = direction;
        }
        newEnemy.aiTimer = 120 + Math.random() * 240; // Very long intervals
      }
      
      // Apply physics with much stricter limits
      newEnemy.vy += GRAVITY;
      
      // Apply movement
      newEnemy.x += newEnemy.vx;
      newEnemy.y += newEnemy.vy;
      
      // Strong friction to prevent buildup
      newEnemy.vx *= 0.95;
      
      // Very strict velocity limits
      const maxHorizontalSpeed = 1;
      const maxVerticalSpeed = 4;
      newEnemy.vx = Math.max(-maxHorizontalSpeed, Math.min(maxHorizontalSpeed, newEnemy.vx));
      newEnemy.vy = Math.max(-maxVerticalSpeed, Math.min(maxVerticalSpeed, newEnemy.vy));
      
      // Platform collision - more reliable
      const platformHit = checkPlatformCollision(newEnemy);
      if (platformHit) {
        newEnemy.y = platformHit.y - newEnemy.height;
        newEnemy.vy = 0; // Complete stop on platform
        newEnemy.vx *= 0.8; // Reduce horizontal movement too
      }
      
      // Boundary collision - very gentle
      if (newEnemy.x < 0) {
        newEnemy.x = 0;
        newEnemy.vx = 0.3; // Very gentle bounce
        newEnemy.facing = 1;
      }
      if (newEnemy.x > CANVAS_WIDTH - newEnemy.width) {
        newEnemy.x = CANVAS_WIDTH - newEnemy.width;
        newEnemy.vx = -0.3; // Very gentle bounce
        newEnemy.facing = -1;
      }
      if (newEnemy.y < 0) {
        newEnemy.y = 0;
        newEnemy.vy = 0;
      }
      if (newEnemy.y > CANVAS_HEIGHT - newEnemy.height) {
        newEnemy.y = CANVAS_HEIGHT - newEnemy.height;
        newEnemy.vy = 0;
        newEnemy.vx *= 0.5; // Stop movement when hitting ground
      }
      
      return newEnemy;
    }));
    
  }, [gameState, checkPlatformCollision]);

  // Check collisions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    enemies.forEach((enemy, index) => {
      if (checkCollision(player, enemy)) {
        // Player wins if they're above the enemy (landing on top)
        const playerBottom = player.y + player.height;
        const enemyCenter = enemy.y + enemy.height / 2;
        
        if (playerBottom <= enemyCenter && player.vy >= 0) {
          // Player is above enemy center and falling/stationary - player wins
          soundGenerator.coin();
          setScore(s => s + 100);
          setEnemies(prev => prev.filter((_, i) => i !== index));
          // Give player a small bounce
          setPlayer(p => ({ ...p, vy: -1.5 }));
        } else {
          // Enemy wins - player hit from side or below
          soundGenerator.hit();
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              soundGenerator.gameOver();
              setGameState('gameOver');
            }
            return newLives;
          });
          // Reset player position
          setPlayer(p => ({ ...p, x: 100, y: 200, vx: 0, vy: 0, flapCooldown: 0 }));
        }
      }
    });

    if (enemies.length === 0) {
      setLevel(l => l + 1);
      setScore(s => s + 500);
      setTimeout(initEnemies, 1000);
    }
  }, [player, enemies, gameState, initEnemies]);

  // Draw everything
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw platforms
    platforms.forEach(platform => {
      ctx.fillStyle = '#8b7355';
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(platform.x, platform.y, platform.width, 3);
    });

    // Draw player
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    ctx.scale(player.facing, 1);
    
    // Body
    ctx.fillStyle = '#8b5a3c';
    ctx.fillRect(-15, -10, 30, 20);
    
    // Wing
    ctx.fillStyle = '#a67c52';
    ctx.fillRect(-12, -8, 15, 8);
    
    // Head
    ctx.fillStyle = '#8b5a3c';
    ctx.fillRect(8, -15, 10, 8);
    
    // Beak
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(18, -12, 5, 3);
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(12, -13, 3, 3);
    
    ctx.restore();

    // Draw enemies
    enemies.forEach(enemy => {
      ctx.save();
      ctx.translate(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
      ctx.scale(enemy.facing, 1);
      
      ctx.fillStyle = '#654321';
      ctx.fillRect(-12, -8, 24, 16);
      
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(-10, -6, 12, 6);
      
      ctx.fillStyle = '#654321';
      ctx.fillRect(6, -12, 8, 6);
      
      ctx.fillStyle = '#ff6347';
      ctx.fillRect(14, -10, 4, 2);
      
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(8, -11, 2, 2);
      
      ctx.restore();
    });

    // Draw UI
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Lives: ${lives}`, 150, 25);
    ctx.fillText(`Level: ${level}`, 250, 25);

  }, [player, enemies, platforms, score, lives, level]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      gameLoop();
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (gameState === 'playing') {
      animate();
    } else {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop, draw]);

  // Initialize
  useEffect(() => {
    initEnemies();
    draw();
  }, [initEnemies, draw]);

  const themeHook = useTheme();
  const isMobile = useMediaQuery(themeHook.breakpoints.down('md'));

  // Mobile controls
  const handleMobileControl = (action) => {
    if (gameState !== 'playing') return;
    
    switch (action) {
      case 'left':
        setPlayer(prev => ({
          ...prev,
          x: Math.max(0, prev.x - 20),
          facing: -1
        }));
        break;
      case 'right':
        setPlayer(prev => ({
          ...prev,
          x: Math.min(CANVAS_WIDTH - prev.width, prev.x + 20),
          facing: 1
        }));
        break;
      case 'flap':
        setPlayer(prev => ({
          ...prev,
          vy: FLAP_POWER
        }));
        soundGenerator.blip(300, 0.05);
        break;
      default:
        break;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 50%, #8b5a3c 100%)',
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
                background: 'linear-gradient(135deg, #8b5a3c, #f59e0b, #fbbf24)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              🦅 JOUST
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
          <Box display="flex" justifyContent="center" mb={3}>
            <Paper 
              elevation={3}
              sx={{ 
                position: 'relative',
                p: { xs: 1, md: 2 },
                borderRadius: 3,
                background: 'rgba(0, 0, 0, 0.1)',
                border: '2px solid #8b5a3c'
              }}
            >
              <canvas 
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                tabIndex={0}
                style={{
                  border: '2px solid #8b5a3c',
                  borderRadius: '12px',
                  width: '100%',
                  maxWidth: isMobile ? '350px' : '600px',
                  height: 'auto',
                  boxShadow: '0 8px 32px rgba(139, 90, 60, 0.25)',
                  outline: 'none'
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
                        Ready to Soar?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Use WASD or Arrow Keys to move. Spacebar to flap!
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<PlayArrow />}
                        onClick={startGame}
                        sx={{ 
                          background: 'linear-gradient(45deg, #8b5a3c, #f59e0b)',
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
                          background: 'linear-gradient(45deg, #ef4444, #f87171)',
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
          </Box>

          {/* Mobile Controls */}
          {isMobile && gameState === 'playing' && (
            <Card sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                  Touch Controls
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <IconButton
                    onClick={() => handleMobileControl('left')}
                    sx={{
                      width: 70,
                      height: 70,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <KeyboardArrowLeft fontSize="large" />
                  </IconButton>
                  
                  <IconButton
                    onClick={() => handleMobileControl('flap')}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'secondary.dark' }
                    }}
                  >
                    <KeyboardArrowUp fontSize="large" />
                  </IconButton>
                  
                  <IconButton
                    onClick={() => handleMobileControl('right')}
                    sx={{
                      width: 70,
                      height: 70,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    <KeyboardArrowRight fontSize="large" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {/* Instructions */}
          <Card sx={{ maxWidth: 600, mx: 'auto' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                How to Play
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Use WASD or Arrow Keys to move left/right
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Press Spacebar, W, or Up Arrow to flap wings
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Land on enemies from above to defeat them
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Avoid being hit by enemies from below or the side
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Use platforms to help position yourself
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Joust;