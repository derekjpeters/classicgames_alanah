import { useRef, useEffect, useState, useCallback } from 'react';
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
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { gameThemes } from '../theme/gameTheme';
import soundGenerator from '../utils/soundUtils';
import './SpaceDefender.css';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 20;
const POWERUP_SIZE = 20;

const SpaceDefender = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gameDataRef = useRef({
    player: {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: 5
    },
    bullets: [],
    enemies: [],
    powerups: [],
    particles: [],
    keys: {},
    gameTime: 0,
    enemySpawnTimer: 0,
    powerupSpawnTimer: 0,
    bulletSpeed: 8,
    enemySpeed: 2,
    waveNumber: 1,
    enemiesInWave: 5,
    enemiesSpawned: 0,
    playerHasRapidFire: false,
    rapidFireTimer: 0
  });

  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  const resetGame = useCallback(() => {
    const gameData = gameDataRef.current;
    
    gameData.player = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speed: 5
    };
    
    gameData.bullets = [];
    gameData.enemies = [];
    gameData.powerups = [];
    gameData.particles = [];
    gameData.keys = {};
    gameData.gameTime = 0;
    gameData.enemySpawnTimer = 0;
    gameData.powerupSpawnTimer = 0;
    gameData.bulletSpeed = 8;
    gameData.enemySpeed = 2;
    gameData.waveNumber = 1;
    gameData.enemiesInWave = 5;
    gameData.enemiesSpawned = 0;
    gameData.playerHasRapidFire = false;
    gameData.rapidFireTimer = 0;
    
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('start');
  }, []);

  const startGame = useCallback(() => {
    soundGenerator.blip(600, 0.1);
    setGameState('playing');
  }, []);

  const createParticle = (x, y, color = '#FFD700') => {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 30,
      maxLife: 30,
      color
    };
  };

  const spawnEnemy = useCallback(() => {
    const gameData = gameDataRef.current;
    const enemy = {
      x: Math.random() * (CANVAS_WIDTH - ENEMY_WIDTH),
      y: -ENEMY_HEIGHT,
      width: ENEMY_WIDTH,
      height: ENEMY_HEIGHT,
      speed: gameData.enemySpeed + Math.random() * 2,
      type: Math.random() < 0.8 ? 'basic' : 'fast',
      health: Math.random() < 0.9 ? 1 : 2
    };
    
    if (enemy.type === 'fast') {
      enemy.speed *= 1.5;
      enemy.width = 25;
      enemy.height = 15;
    }
    
    gameData.enemies.push(enemy);
    gameData.enemiesSpawned++;
  }, []);

  const spawnPowerup = useCallback((x, y) => {
    const gameData = gameDataRef.current;
    const types = ['rapidfire', 'shield', 'multishot'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    gameData.powerups.push({
      x,
      y,
      width: POWERUP_SIZE,
      height: POWERUP_SIZE,
      type,
      speed: 3,
      life: 300
    });
  }, []);

  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const gameData = gameDataRef.current;
    gameData.gameTime++;

    // Update player position
    if (gameData.keys['ArrowLeft'] || gameData.keys['a'] || gameData.keys['A']) {
      gameData.player.x = Math.max(0, gameData.player.x - gameData.player.speed);
    }
    if (gameData.keys['ArrowRight'] || gameData.keys['d'] || gameData.keys['D']) {
      gameData.player.x = Math.min(CANVAS_WIDTH - gameData.player.width, gameData.player.x + gameData.player.speed);
    }

    // Shooting
    const canShoot = gameData.playerHasRapidFire ? gameData.gameTime % 5 === 0 : gameData.gameTime % 15 === 0;
    if ((gameData.keys[' '] || gameData.keys['Space']) && canShoot) {
      gameData.bullets.push({
        x: gameData.player.x + gameData.player.width / 2 - BULLET_WIDTH / 2,
        y: gameData.player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: gameData.bulletSpeed
      });
      soundGenerator.blip(800, 0.05);
    }

    // Update bullets
    gameData.bullets.forEach((bullet, index) => {
      bullet.y -= bullet.speed;
      if (bullet.y < -bullet.height) {
        gameData.bullets.splice(index, 1);
      }
    });

    // Spawn enemies
    if (gameData.enemiesSpawned < gameData.enemiesInWave) {
      gameData.enemySpawnTimer++;
      if (gameData.enemySpawnTimer >= 60 - (gameData.waveNumber * 2)) {
        spawnEnemy();
        gameData.enemySpawnTimer = 0;
      }
    }

    // Update enemies
    gameData.enemies.forEach((enemy, index) => {
      enemy.y += enemy.speed;
      if (enemy.y > CANVAS_HEIGHT) {
        gameData.enemies.splice(index, 1);
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            soundGenerator.gameOver();
            setGameState('gameOver');
          } else {
            soundGenerator.hit();
          }
          return newLives;
        });
      }
    });

    // Check bullet-enemy collisions
    gameData.bullets.forEach((bullet, bulletIndex) => {
      gameData.enemies.forEach((enemy, enemyIndex) => {
        if (checkCollision(bullet, enemy)) {
          // Create explosion particles
          for (let i = 0; i < 6; i++) {
            gameData.particles.push(createParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#FF4444'));
          }
          
          enemy.health--;
          gameData.bullets.splice(bulletIndex, 1);
          
          if (enemy.health <= 0) {
            gameData.enemies.splice(enemyIndex, 1);
            soundGenerator.coin();
            setScore(prev => prev + (enemy.type === 'fast' ? 20 : 10));
            
            // Chance to spawn powerup
            if (Math.random() < 0.15) {
              spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }
          }
        }
      });
    });

    // Check player-enemy collisions
    gameData.enemies.forEach((enemy, index) => {
      if (checkCollision(gameData.player, enemy)) {
        gameData.enemies.splice(index, 1);
        soundGenerator.hit();
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            soundGenerator.gameOver();
            setGameState('gameOver');
          }
          return newLives;
        });
        
        // Create explosion particles
        for (let i = 0; i < 8; i++) {
          gameData.particles.push(createParticle(gameData.player.x + gameData.player.width / 2, gameData.player.y + gameData.player.height / 2, '#FF0000'));
        }
      }
    });

    // Update powerups
    gameData.powerups.forEach((powerup, index) => {
      powerup.y += powerup.speed;
      powerup.life--;
      
      if (powerup.y > CANVAS_HEIGHT || powerup.life <= 0) {
        gameData.powerups.splice(index, 1);
      }
      
      // Check player-powerup collision
      if (checkCollision(gameData.player, powerup)) {
        gameData.powerups.splice(index, 1);
        soundGenerator.powerUp();
        setScore(prev => prev + 50);
        
        switch (powerup.type) {
          case 'rapidfire':
            gameData.playerHasRapidFire = true;
            gameData.rapidFireTimer = 300;
            break;
          case 'shield':
            // Simple shield - add extra life
            setLives(prev => Math.min(prev + 1, 5));
            break;
          case 'multishot':
            gameData.bulletSpeed += 2;
            break;
          default:
            break;
        }
      }
    });

    // Update powerup timers
    if (gameData.rapidFireTimer > 0) {
      gameData.rapidFireTimer--;
      if (gameData.rapidFireTimer === 0) {
        gameData.playerHasRapidFire = false;
      }
    }

    // Update particles
    gameData.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.vy += 0.1; // gravity
      
      if (particle.life <= 0) {
        gameData.particles.splice(index, 1);
      }
    });

    // Check wave completion
    if (gameData.enemies.length === 0 && gameData.enemiesSpawned >= gameData.enemiesInWave) {
      // Next wave
      gameData.waveNumber++;
      gameData.enemiesInWave = Math.floor(5 + gameData.waveNumber * 1.5);
      gameData.enemiesSpawned = 0;
      gameData.enemySpeed = Math.min(5, 2 + gameData.waveNumber * 0.3);
      setLevel(gameData.waveNumber);
      soundGenerator.victory();
      setScore(prev => prev + gameData.waveNumber * 100);
    }
  }, [gameState, spawnEnemy, spawnPowerup]);

  // Handle input
  useEffect(() => {
    const handleKeyDown = (e) => {
      gameDataRef.current.keys[e.key] = true;
      e.preventDefault();
    };

    const handleKeyUp = (e) => {
      gameDataRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls
  const handleTouchMove = useCallback((direction) => {
    if (gameState !== 'playing') return;
    const gameData = gameDataRef.current;
    
    if (direction === 'left') {
      gameData.player.x = Math.max(0, gameData.player.x - gameData.player.speed * 2);
    } else if (direction === 'right') {
      gameData.player.x = Math.min(CANVAS_WIDTH - gameData.player.width, gameData.player.x + gameData.player.speed * 2);
    }
  }, [gameState]);

  const handleTouchShoot = useCallback(() => {
    if (gameState !== 'playing') return;
    const gameData = gameDataRef.current;
    
    gameData.bullets.push({
      x: gameData.player.x + gameData.player.width / 2 - BULLET_WIDTH / 2,
      y: gameData.player.y,
      width: BULLET_WIDTH,
      height: BULLET_HEIGHT,
      speed: gameData.bulletSpeed
    });
    soundGenerator.blip(800, 0.05);
  }, [gameState]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updateGame();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const gameData = gameDataRef.current;
      
      // Clear canvas with starfield
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#000011');
      gradient.addColorStop(1, '#000033');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw stars
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 50; i++) {
        const x = (i * 137 + gameData.gameTime * 0.5) % CANVAS_WIDTH;
        const y = (i * 211 + gameData.gameTime * 2) % CANVAS_HEIGHT;
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
      }
      
      // Draw player
      ctx.fillStyle = gameData.playerHasRapidFire ? '#00FF00' : '#00AAFF';
      ctx.fillRect(gameData.player.x, gameData.player.y, gameData.player.width, gameData.player.height);
      
      // Draw player details
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(gameData.player.x + 5, gameData.player.y + 5, 30, 5);
      ctx.fillRect(gameData.player.x + 15, gameData.player.y, 10, 15);
      
      // Draw bullets
      ctx.fillStyle = '#FFFF00';
      gameData.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });
      
      // Draw enemies
      gameData.enemies.forEach(enemy => {
        ctx.fillStyle = enemy.type === 'fast' ? '#FF6600' : '#FF0000';
        if (enemy.health > 1) ctx.fillStyle = '#AA0000';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Enemy details
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, 3);
        ctx.fillRect(enemy.x + enemy.width/2 - 2, enemy.y + enemy.height - 5, 4, 5);
      });
      
      // Draw powerups
      gameData.powerups.forEach(powerup => {
        const alpha = Math.sin(gameData.gameTime * 0.2) * 0.3 + 0.7;
        ctx.globalAlpha = alpha;
        
        switch (powerup.type) {
          case 'rapidfire':
            ctx.fillStyle = '#00FF00';
            break;
          case 'shield':
            ctx.fillStyle = '#0000FF';
            break;
          case 'multishot':
            ctx.fillStyle = '#FF00FF';
            break;
          default:
            ctx.fillStyle = '#FFFFFF';
            break;
        }
        
        ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
        ctx.globalAlpha = 1;
      });
      
      // Draw particles
      gameData.particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
      });
      ctx.globalAlpha = 1;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, updateGame]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={gameThemes.galaga || gameThemes.snake}>
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
                background: 'linear-gradient(135deg, #00AAFF, #0099CC, #FFFF00)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              🚀 Space Defender
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
                label={`Wave: ${level}`} 
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
                  background: 'rgba(0, 0, 0, 0.9)',
                }}
              >
                <canvas 
                  ref={canvasRef} 
                  width={CANVAS_WIDTH} 
                  height={CANVAS_HEIGHT}
                  style={{
                    border: '2px solid #00AAFF',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: isMobile ? '350px' : `${CANVAS_WIDTH}px`,
                    height: 'auto',
                    boxShadow: '0 8px 32px rgba(0, 170, 255, 0.15)',
                    imageRendering: 'pixelated'
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
                          Defend Earth!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Destroy the alien invaders before they reach Earth!
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<PlayArrow />}
                          onClick={startGame}
                          sx={{ 
                            background: 'linear-gradient(45deg, #00AAFF, #0099CC)',
                            mt: 2
                          }}
                        >
                          Start Mission
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
                          Mission Failed!
                        </Typography>
                        <Typography variant="body1" color="primary" gutterBottom>
                          Final Score: {score}
                        </Typography>
                        <Typography variant="body2" color="secondary" sx={{ mb: 2 }}>
                          Waves Completed: {level - 1}
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
                          Retry Mission
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
                {/* Mobile Touch Controls */}
                {isMobile && gameState === 'playing' && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                        Touch Controls
                      </Typography>
                      
                      {/* Movement Buttons */}
                      <Box display="flex" justifyContent="center" gap={2} mb={2}>
                        <IconButton
                          onTouchStart={() => handleTouchMove('left')}
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          <KeyboardArrowLeft fontSize="large" />
                        </IconButton>
                        <IconButton
                          onTouchStart={() => handleTouchMove('right')}
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          <KeyboardArrowRight fontSize="large" />
                        </IconButton>
                      </Box>
                      
                      {/* Shoot Button */}
                      <Box display="flex" justifyContent="center">
                        <Button
                          variant="contained"
                          onTouchStart={handleTouchShoot}
                          sx={{
                            width: 100,
                            height: 50,
                            bgcolor: 'secondary.main',
                            color: 'white',
                            fontSize: '1.2rem',
                            '&:hover': { bgcolor: 'secondary.dark' }
                          }}
                        >
                          FIRE
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Controls */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                      How to Play
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>🚀</ListItemIcon>
                        <ListItemText primary={isMobile ? "Use touch controls to move and shoot" : "Arrow keys or A/D to move, Space to shoot"} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>👾</ListItemIcon>
                        <ListItemText primary="Destroy aliens before they reach Earth" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>💎</ListItemIcon>
                        <ListItemText primary="Collect power-ups for special abilities" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>🌊</ListItemIcon>
                        <ListItemText primary="Survive waves of increasing difficulty" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>🏆</ListItemIcon>
                        <ListItemText primary="Achieve the highest score possible!" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                {/* Reset Button */}
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

export default SpaceDefender;