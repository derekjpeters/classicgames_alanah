// src/games/Galaga.js
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
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  PlayArrow, 
  RestartAlt
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './Galaga.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Space indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#f59e0b', // Cosmic amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#0c0c0c', // Deep space
      paper: '#1a1a2e', // Dark space
    },
    text: {
      primary: '#f8fafc', // Bright white
      secondary: '#cbd5e1', // Light gray
    },
    error: {
      main: '#ef4444', // Red
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a2e',
          border: '1px solid #374151',
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
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a2e',
          border: '1px solid #374151',
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

const Galaga = () => {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver'
  const [player, setPlayer] = useState({ x: 200, y: 450, width: 30, height: 20 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [wave, setWave] = useState(1);

  const canvasWidth = 400;
  const canvasHeight = 500;
  const playerSpeed = 5;
  const bulletSpeed = 8;
  const enemyBulletSpeed = 3;

  // Enemy types
  const enemyTypes = {
    bee: { points: 50, color: '#FFD700', width: 20, height: 15 },
    butterfly: { points: 80, color: '#FF69B4', width: 22, height: 18 },
    boss: { points: 150, color: '#FF4500', width: 25, height: 20 }
  };

  // Initialize enemy formation
  const initializeEnemies = useCallback(() => {
    const newEnemies = [];
    const formationStartX = 50;
    const formationStartY = 50;
    
    // Top rows - Boss Galaga (red)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 8; col++) {
        newEnemies.push({
          id: `boss-${row}-${col}`,
          type: 'boss',
          x: formationStartX + col * 35,
          y: formationStartY + row * 30,
          formationX: formationStartX + col * 35,
          formationY: formationStartY + row * 30,
          width: enemyTypes.boss.width,
          height: enemyTypes.boss.height,
          color: enemyTypes.boss.color,
          points: enemyTypes.boss.points,
          inFormation: true,
          diving: false,
          divePattern: [],
          diveIndex: 0,
          shootTimer: Math.random() * 120,
          animFrame: 0
        });
      }
    }

    // Middle rows - Butterflies (pink)
    for (let row = 2; row < 4; row++) {
      for (let col = 0; col < 8; col++) {
        newEnemies.push({
          id: `butterfly-${row}-${col}`,
          type: 'butterfly',
          x: formationStartX + col * 35,
          y: formationStartY + row * 30,
          formationX: formationStartX + col * 35,
          formationY: formationStartY + row * 30,
          width: enemyTypes.butterfly.width,
          height: enemyTypes.butterfly.height,
          color: enemyTypes.butterfly.color,
          points: enemyTypes.butterfly.points,
          inFormation: true,
          diving: false,
          divePattern: [],
          diveIndex: 0,
          shootTimer: Math.random() * 180,
          animFrame: 0
        });
      }
    }

    // Bottom rows - Bees (yellow)
    for (let row = 4; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        newEnemies.push({
          id: `bee-${row}-${col}`,
          type: 'bee',
          x: formationStartX + col * 35,
          y: formationStartY + row * 30,
          formationX: formationStartX + col * 35,
          formationY: formationStartY + row * 30,
          width: enemyTypes.bee.width,
          height: enemyTypes.bee.height,
          color: enemyTypes.bee.color,
          points: enemyTypes.bee.points,
          inFormation: true,
          diving: false,
          divePattern: [],
          diveIndex: 0,
          shootTimer: Math.random() * 240,
          animFrame: 0
        });
      }
    }

    setEnemies(newEnemies);
  }, []);

  const resetGame = useCallback(() => {
    setPlayer({ x: 200, y: 450, width: 30, height: 20 });
    setBullets([]);
    setEnemyBullets([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setWave(1);
    setGameState('start');
    initializeEnemies();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initializeEnemies]);

  const startGame = useCallback(() => {
    setGameState('playing');
    initializeEnemies();
  }, [initializeEnemies]);

  const movePlayer = useCallback((direction) => {
    if (gameState !== 'playing') return;

    setPlayer(prev => {
      let newX = prev.x;
      
      if (direction === 'left') {
        newX = Math.max(0, prev.x - playerSpeed);
      } else if (direction === 'right') {
        newX = Math.min(canvasWidth - prev.width, prev.x + playerSpeed);
      }
      
      return { ...prev, x: newX };
    });
  }, [gameState]);

  const shoot = useCallback(() => {
    if (gameState !== 'playing') return;

    setBullets(prev => [
      ...prev,
      {
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 8,
        speed: bulletSpeed
      }
    ]);
  }, [player, gameState]);

  // Generate dive pattern for enemies
  const generateDivePattern = useCallback((enemy) => {
    const pattern = [];
    const steps = 60;
    const amplitude = 100;
    
    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      const x = enemy.formationX + Math.sin(progress * Math.PI * 4) * amplitude;
      const y = enemy.formationY + progress * 300;
      pattern.push({ x, y });
    }
    
    return pattern;
  }, []);

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    // Update player bullets
    setBullets(prev => 
      prev.map(bullet => ({ ...bullet, y: bullet.y - bullet.speed }))
          .filter(bullet => bullet.y > -bullet.height)
    );

    // Update enemy bullets
    setEnemyBullets(prev => 
      prev.map(bullet => ({ ...bullet, y: bullet.y + bullet.speed }))
          .filter(bullet => bullet.y < canvasHeight)
    );

    // Update enemies
    setEnemies(prev => prev.map(enemy => {
      let newEnemy = { ...enemy };
      newEnemy.animFrame = (newEnemy.animFrame + 1) % 60;
      newEnemy.shootTimer--;

      if (newEnemy.inFormation) {
        // Formation movement
        const sway = Math.sin(Date.now() * 0.002) * 10;
        newEnemy.x = newEnemy.formationX + sway;
        
        // Randomly start diving
        if (Math.random() < 0.001 * level) {
          newEnemy.diving = true;
          newEnemy.inFormation = false;
          newEnemy.divePattern = generateDivePattern(newEnemy);
          newEnemy.diveIndex = 0;
        }
      } else if (newEnemy.diving) {
        // Diving behavior
        if (newEnemy.diveIndex < newEnemy.divePattern.length) {
          const target = newEnemy.divePattern[newEnemy.diveIndex];
          newEnemy.x = target.x;
          newEnemy.y = target.y;
          newEnemy.diveIndex++;
        } else {
          // Return to formation or leave screen
          if (newEnemy.y > canvasHeight) {
            newEnemy.x = newEnemy.formationX;
            newEnemy.y = -50;
            newEnemy.diving = false;
            newEnemy.inFormation = true;
          }
        }
      }

      // Enemy shooting
      if (newEnemy.shootTimer <= 0 && Math.random() < 0.02) {
        setEnemyBullets(prevBullets => [
          ...prevBullets,
          {
            x: newEnemy.x + newEnemy.width / 2,
            y: newEnemy.y + newEnemy.height,
            width: 3,
            height: 6,
            speed: enemyBulletSpeed
          }
        ]);
        newEnemy.shootTimer = 120 + Math.random() * 240;
      }

      return newEnemy;
    }));

    // Check bullet-enemy collisions
    setBullets(prevBullets => {
      let newBullets = [...prevBullets];
      
      setEnemies(prevEnemies => {
        let newEnemies = [...prevEnemies];
        
        prevBullets.forEach((bullet, bulletIndex) => {
          prevEnemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
              
              // Remove bullet and enemy
              newBullets = newBullets.filter((_, i) => i !== bulletIndex);
              newEnemies = newEnemies.filter((_, i) => i !== enemyIndex);
              
              setScore(prevScore => prevScore + enemy.points);
            }
          });
        });
        
        return newEnemies;
      });
      
      return newBullets;
    });

    // Check enemy bullet-player collisions
    setEnemyBullets(prevBullets => {
      const newBullets = prevBullets.filter(bullet => {
        const hit = bullet.x < player.x + player.width &&
                   bullet.x + bullet.width > player.x &&
                   bullet.y < player.y + player.height &&
                   bullet.y + bullet.height > player.y;
        
        if (hit) {
          setLives(prevLives => {
            const newLives = prevLives - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
            }
            return newLives;
          });
        }
        
        return !hit;
      });
      
      return newBullets;
    });

    // Check if all enemies destroyed
    if (enemies.length === 0) {
      setWave(prev => prev + 1);
      if (wave % 3 === 0) {
        setLevel(prev => prev + 1);
      }
      setTimeout(() => {
        initializeEnemies();
      }, 1000);
    }

  }, [gameState, player, enemies, level, wave, generateDivePattern, initializeEnemies]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with star field
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw stars
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % canvasWidth;
      const y = (i * 53 + Date.now() * 0.1) % canvasHeight;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player with modern ship design
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    
    // Ship body
    ctx.fillStyle = '#00FF88';
    ctx.beginPath();
    ctx.moveTo(0, -player.height/2);
    ctx.lineTo(-player.width/3, player.height/2);
    ctx.lineTo(player.width/3, player.height/2);
    ctx.closePath();
    ctx.fill();
    
    // Ship cockpit
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(0, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine glow
    ctx.fillStyle = '#00AAFF';
    ctx.beginPath();
    ctx.moveTo(-8, player.height/2);
    ctx.lineTo(-4, player.height/2 + 5);
    ctx.lineTo(0, player.height/2);
    ctx.lineTo(4, player.height/2 + 5);
    ctx.lineTo(8, player.height/2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();

    // Draw player bullets
    ctx.fillStyle = '#FFFF00';
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies with modern shapes
    enemies.forEach(enemy => {
      ctx.save();
      const bob = Math.sin(enemy.animFrame * 0.2) * 2;
      ctx.translate(enemy.x + enemy.width/2, enemy.y + bob + enemy.height/2);
      
      if (enemy.type === 'boss') {
        // Boss Galaga - menacing shape
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(0, -enemy.height/2);
        ctx.lineTo(-enemy.width/2, 0);
        ctx.lineTo(-enemy.width/3, enemy.height/2);
        ctx.lineTo(enemy.width/3, enemy.height/2);
        ctx.lineTo(enemy.width/2, 0);
        ctx.closePath();
        ctx.fill();
        
        // Boss eyes with glow
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(-6, -3, 3, 0, Math.PI * 2);
        ctx.arc(6, -3, 3, 0, Math.PI * 2);
        ctx.fill();
        
      } else if (enemy.type === 'butterfly') {
        // Butterfly - elegant wing design
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        // Left wing
        ctx.ellipse(-8, 0, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.ellipse(8, 0, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-2, -enemy.height/2, 4, enemy.height);
        
      } else {
        // Bee - hexagonal body with animated wings
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.moveTo(0, -enemy.height/2);
        ctx.lineTo(enemy.width/3, -enemy.height/4);
        ctx.lineTo(enemy.width/3, enemy.height/4);
        ctx.lineTo(0, enemy.height/2);
        ctx.lineTo(-enemy.width/3, enemy.height/4);
        ctx.lineTo(-enemy.width/3, -enemy.height/4);
        ctx.closePath();
        ctx.fill();
        
        // Animated wings
        const wingFlap = Math.sin(enemy.animFrame * 0.5) * 0.3;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(-enemy.width/2, -2, 4, 2, wingFlap, 0, Math.PI * 2);
        ctx.ellipse(enemy.width/2, -2, 4, 2, -wingFlap, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.restore();
    });

    // Draw enemy bullets
    ctx.fillStyle = '#FF0000';
    enemyBullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw UI
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Lives: ${lives}`, 150, 25);
    ctx.fillText(`Level: ${level}`, 250, 25);
    ctx.fillText(`Wave: ${wave}`, 320, 25);

  }, [player, bullets, enemies, enemyBullets, score, lives, level, wave]);

  // Game loop with appropriate speed
  useEffect(() => {
    if (gameState === 'playing') {
      intervalRef.current = setInterval(() => {
        updateGame();
        draw();
      }, 33); // ~30 FPS for better gameplay balance
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
    const keys = {};
    
    const handleKeyDown = (e) => {
      keys[e.key] = true;
      
      if (e.key === ' ') {
        e.preventDefault();
        shoot();
      }
    };
    
    const handleKeyUp = (e) => {
      keys[e.key] = false;
    };

    const gameLoop = setInterval(() => {
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        movePlayer('left');
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        movePlayer('right');
      }
    }, 16);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(gameLoop);
    };
  }, [movePlayer, shoot]);

  // Initialize on mount
  useEffect(() => {
    draw();
  }, [draw]);

  const themeHook = useTheme();
  const isMobile = useMediaQuery(themeHook.breakpoints.down('md'));

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #0c0c0c 0%, #1a0033 50%, #000000 100%)',
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
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f59e0b)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                textShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
              }}
            >
              🚀 GALAGA
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
              <Chip 
                label={`Wave: ${wave}`} 
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
                background: 'rgba(0, 0, 0, 0.9)',
                border: '1px solid #6366f1'
              }}
            >
              <canvas 
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                style={{
                  border: '2px solid #6366f1',
                  borderRadius: '12px',
                  width: '100%',
                  maxWidth: isMobile ? '350px' : '400px',
                  height: 'auto',
                  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25)'
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
                  bgcolor="rgba(0, 0, 0, 0.9)"
                  borderRadius={3}
                >
                  <Card sx={{ maxWidth: 300, textAlign: 'center' }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom color="primary">
                        Ready for Battle?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Destroy the alien formation with precise shooting!
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<PlayArrow />}
                        onClick={startGame}
                        sx={{ 
                          background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
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
                  bgcolor="rgba(0, 0, 0, 0.9)"
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
                      <Typography variant="body2" color="secondary" gutterBottom>
                        Level Reached: {level}
                      </Typography>
                      <Typography variant="body2" color="secondary" paragraph>
                        Waves Completed: {wave - 1}
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

          {/* Controls */}
          <Card sx={{ maxWidth: 600, mx: 'auto' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                How to Play
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Use arrow keys or A/D to move your ship
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Press spacebar to shoot
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Destroy alien formations for points
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Watch out for diving enemies!
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Avoid enemy fire to survive
                </Box>
                <Box component="li" sx={{ mb: 0.5, color: 'text.secondary' }}>
                  Clear all enemies to advance waves
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Galaga;