// src/games/PacMan.js
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
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { gameThemes } from '../theme/gameTheme';
import soundGenerator from '../utils/soundUtils';
import './PacMan.css';

// Game constants
const CELL_SIZE = 20;
const MAZE_WIDTH = 19;
const MAZE_HEIGHT = 21;

// Original Pac-Man maze layout (0=wall, 1=dot, 2=power pellet, 3=empty)
const MAZE_LAYOUT = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
  [0,2,0,0,1,1,1,1,1,0,1,1,1,1,1,0,0,2,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0],
  [0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0],
  [3,3,3,0,1,0,3,1,1,3,1,1,3,0,1,0,3,3,3],
  [0,0,0,0,1,0,3,0,3,3,3,0,3,0,1,0,0,0,0],
  [3,3,3,3,1,1,3,0,3,3,3,0,3,1,1,3,3,3,3],
  [0,0,0,0,1,0,3,0,0,0,0,0,3,0,1,0,0,0,0],
  [3,3,3,0,1,0,3,3,3,3,3,3,3,0,1,0,3,3,3],
  [0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0],
  [0,2,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,2,0],
  [0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0],
  [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Ghost configurations - authentic colors and positions
const GHOST_CONFIGS = [
  { id: 'blinky', color: '#FF0000', homeX: 9, homeY: 9, scatterX: 17, scatterY: 1 },
  { id: 'pinky', color: '#FFB8DE', homeX: 8, homeY: 9, scatterX: 1, scatterY: 1 },
  { id: 'inky', color: '#00FFDE', homeX: 10, homeY: 9, scatterX: 17, scatterY: 19 },
  { id: 'clyde', color: '#FFB852', homeX: 9, homeY: 10, scatterX: 1, scatterY: 19 }
];

const PacMan = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gameDataRef = useRef({
    pacman: { 
      x: 9, y: 15, 
      direction: 2, // Start facing left like original
      nextDirection: 2,
      moving: false,
      animFrame: 0
    },
    ghosts: GHOST_CONFIGS.map(config => ({
      ...config,
      x: config.homeX,
      y: config.homeY,
      direction: 0,
      mode: 'scatter',
      modeTimer: 420, // 7 seconds at 60fps
      inHouse: config.id !== 'blinky',
      exitTimer: config.id === 'pinky' ? 60 : config.id === 'inky' ? 120 : 180,
      speed: 0.08
    })),
    dots: [],
    powerPellets: [],
    gameTime: 0,
    modeSwitchTimer: 420,
    currentMode: 'scatter' // scatter or chase
  });

  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  // Initialize dots and power pellets
  const initializeDots = useCallback(() => {
    const dots = [];
    const powerPellets = [];
    
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (MAZE_LAYOUT[y][x] === 1) {
          dots.push({ x, y });
        } else if (MAZE_LAYOUT[y][x] === 2) {
          powerPellets.push({ x, y });
        }
      }
    }
    
    gameDataRef.current.dots = dots;
    gameDataRef.current.powerPellets = powerPellets;
  }, []);

  const resetGame = useCallback(() => {
    const gameData = gameDataRef.current;
    
    // Reset Pac-Man
    gameData.pacman = {
      x: 9, y: 15,
      direction: 2,
      nextDirection: 2,
      moving: false,
      animFrame: 0
    };
    
    // Reset ghosts
    gameData.ghosts = GHOST_CONFIGS.map(config => ({
      ...config,
      x: config.homeX,
      y: config.homeY,
      direction: 0,
      mode: 'scatter',
      modeTimer: 420,
      inHouse: config.id !== 'blinky',
      exitTimer: config.id === 'pinky' ? 60 : config.id === 'inky' ? 120 : 180,
      speed: 0.08
    }));
    
    gameData.gameTime = 0;
    gameData.modeSwitchTimer = 420;
    gameData.currentMode = 'scatter';
    
    initializeDots();
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('start');
  }, [initializeDots]);

  const startGame = useCallback(() => {
    soundGenerator.blip(600, 0.1);
    setGameState('playing');
  }, []);

  // Check if position is valid
  const isValidPosition = useCallback((x, y) => {
    const cellX = Math.floor(x);
    const cellY = Math.floor(y);
    
    if (cellX < 0 || cellX >= MAZE_WIDTH || cellY < 0 || cellY >= MAZE_HEIGHT) {
      return x < 0 || x >= MAZE_WIDTH; // Allow tunnel wrapping
    }
    
    const cell = MAZE_LAYOUT[cellY][cellX];
    return cell !== 0; // Can't move into walls (0)
  }, []);

  // Get direction vectors
  const getDirectionVector = (direction) => {
    switch (direction) {
      case 0: return { dx: 1, dy: 0 };   // right
      case 1: return { dx: 0, dy: 1 };   // down
      case 2: return { dx: -1, dy: 0 };  // left
      case 3: return { dx: 0, dy: -1 };  // up
      default: return { dx: 0, dy: 0 };
    }
  };

  // Handle tunnel wrapping
  const wrapPosition = (x, y) => {
    let newX = x;
    if (x < -0.5) newX = MAZE_WIDTH - 0.5;
    if (x >= MAZE_WIDTH - 0.5) newX = -0.5;
    return { x: newX, y };
  };

  // Update Pac-Man with grid-based movement
  const updatePacMan = useCallback(() => {
    const gameData = gameDataRef.current;
    const pacman = gameData.pacman;
    
    // Try to change direction if requested
    if (pacman.nextDirection !== pacman.direction) {
      const nextDir = getDirectionVector(pacman.nextDirection);
      let testX = pacman.x + nextDir.dx;
      let testY = pacman.y + nextDir.dy;
      
      // Handle tunnel wrapping
      if (testX < 0) testX = MAZE_WIDTH - 1;
      if (testX >= MAZE_WIDTH) testX = 0;
      
      if (isValidPosition(testX, testY)) {
        pacman.direction = pacman.nextDirection;
      }
    }
    
    // Move in current direction
    const dir = getDirectionVector(pacman.direction);
    let newX = pacman.x + dir.dx;
    let newY = pacman.y + dir.dy;
    
    // Handle tunnel wrapping
    if (newX < 0) newX = MAZE_WIDTH - 1;
    if (newX >= MAZE_WIDTH) newX = 0;
    
    if (isValidPosition(newX, newY)) {
      pacman.x = newX;
      pacman.y = newY;
      pacman.moving = true;
      pacman.animFrame = (pacman.animFrame + 1) % 20;
      
      // Check for dot collection
      const dotIndex = gameData.dots.findIndex(dot => dot.x === newX && dot.y === newY);
      if (dotIndex !== -1) {
        soundGenerator.waka();
        gameData.dots.splice(dotIndex, 1);
        setScore(prev => prev + 10);
      }
      
      // Collect power pellets
      const powerIndex = gameData.powerPellets.findIndex(pellet => pellet.x === newX && pellet.y === newY);
      if (powerIndex !== -1) {
        soundGenerator.powerUp();
        gameData.powerPellets.splice(powerIndex, 1);
        setScore(prev => prev + 50);
        
        // Make ghosts frightened
        gameData.ghosts.forEach(ghost => {
          if (ghost.mode !== 'eaten') {
            ghost.mode = 'frightened';
            ghost.modeTimer = 300;
            ghost.direction = (ghost.direction + 2) % 4;
          }
        });
      }
    } else {
      pacman.moving = false;
    }
  }, [isValidPosition, getDirectionVector]);

  // Update ghosts with proper AI
  const updateGhosts = useCallback(() => {
    const gameData = gameDataRef.current;
    const pacman = gameData.pacman;
    
    gameData.ghosts.forEach(ghost => {
      // Handle mode timers
      if (ghost.mode === 'frightened' && ghost.modeTimer > 0) {
        ghost.modeTimer--;
        if (ghost.modeTimer === 0) {
          ghost.mode = gameData.currentMode;
        }
      }
      
      // Handle ghost house exit
      if (ghost.inHouse) {
        if (ghost.exitTimer > 0) {
          ghost.exitTimer--;
        } else {
          ghost.inHouse = false;
          ghost.y = 7; // Exit to corridor above house
        }
        return;
      }
      
      // Get target based on mode
      let targetX, targetY;
      
      switch (ghost.mode) {
        case 'scatter':
          targetX = ghost.scatterX;
          targetY = ghost.scatterY;
          break;
        case 'chase':
          targetX = Math.floor(pacman.x);
          targetY = Math.floor(pacman.y);
          break;
        case 'frightened':
          // Random but valid movement
          const validDirections = [0, 1, 2, 3].filter(dir => {
            const dirVector = getDirectionVector(dir);
            const testX = ghost.x + dirVector.dx * ghost.speed;
            const testY = ghost.y + dirVector.dy * ghost.speed;
            return isValidPosition(testX, testY);
          });
          if (validDirections.length > 0) {
            ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
          }
          break;
        case 'eaten':
          targetX = ghost.homeX;
          targetY = ghost.homeY;
          ghost.speed = 0.12; // Faster when returning
          break;
        default:
          targetX = ghost.x;
          targetY = ghost.y;
      }
      
      // Simple movement for non-frightened ghosts
      if (ghost.mode !== 'frightened') {
        const directions = [0, 1, 2, 3];
        let bestDirection = ghost.direction;
        let bestDistance = Infinity;
        
        directions.forEach(dir => {
          // Don't reverse unless necessary
          if (dir === (ghost.direction + 2) % 4) return;
          
          const dirVector = getDirectionVector(dir);
          const testX = ghost.x + dirVector.dx * ghost.speed;
          const testY = ghost.y + dirVector.dy * ghost.speed;
          
          if (isValidPosition(testX, testY)) {
            const distance = Math.sqrt(
              Math.pow(testX - targetX, 2) + Math.pow(testY - targetY, 2)
            );
            
            if (distance < bestDistance) {
              bestDirection = dir;
              bestDistance = distance;
            }
          }
        });
        
        ghost.direction = bestDirection;
      }
      
      // Move ghost
      const dir = getDirectionVector(ghost.direction);
      const newX = ghost.x + dir.dx * ghost.speed;
      const newY = ghost.y + dir.dy * ghost.speed;
      
      if (isValidPosition(newX, newY)) {
        const wrapped = wrapPosition(newX, newY);
        ghost.x = wrapped.x;
        ghost.y = wrapped.y;
      }
      
      // Reset speed if not eaten
      if (ghost.mode !== 'eaten') {
        ghost.speed = 0.08;
      }
    });
  }, [isValidPosition, getDirectionVector, wrapPosition]);

  // Check collisions
  const checkCollisions = useCallback(() => {
    const gameData = gameDataRef.current;
    const pacman = gameData.pacman;
    
    gameData.ghosts.forEach(ghost => {
      const distance = Math.sqrt(
        Math.pow(pacman.x - ghost.x, 2) + Math.pow(pacman.y - ghost.y, 2)
      );
      
      if (distance < 0.7) {
        if (ghost.mode === 'frightened') {
          // Eat ghost
          soundGenerator.coin();
          setScore(prev => prev + 200);
          ghost.mode = 'eaten';
          ghost.modeTimer = 0;
        } else if (ghost.mode !== 'eaten') {
          // Pac-Man dies
          soundGenerator.hit();
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              soundGenerator.gameOver();
              setGameState('gameOver');
            } else {
              // Reset positions
              gameData.pacman.x = 9.5;
              gameData.pacman.y = 15.5;
              gameData.pacman.direction = 0;
              gameData.pacman.nextDirection = 0;
              
              gameData.ghosts.forEach(g => {
                g.x = g.homeX + 0.5;
                g.y = g.homeY + 0.5;
                g.mode = 'scatter';
                g.inHouse = g.id !== 'blinky';
              });
            }
            return newLives;
          });
        }
      }
    });
  }, []);

  // Check level complete
  const checkLevelComplete = useCallback(() => {
    const gameData = gameDataRef.current;
    if (gameData.dots.length === 0 && gameData.powerPellets.length === 0) {
      soundGenerator.victory();
      setLevel(prev => prev + 1);
      
      // Reset for next level
      setTimeout(() => {
        initializeDots();
        const pacman = gameData.pacman;
        pacman.x = 9;
        pacman.y = 15;
        pacman.direction = 2;
        pacman.nextDirection = 2;
        
        gameData.ghosts.forEach(ghost => {
          ghost.x = ghost.homeX;
          ghost.y = ghost.homeY;
          ghost.mode = 'scatter';
          ghost.inHouse = ghost.id !== 'blinky';
          ghost.exitTimer = ghost.id === 'pinky' ? 60 : ghost.id === 'inky' ? 120 : 180;
          ghost.speed = 0.08;
        });
      }, 1000);
    }
  }, [initializeDots]);

  // Game loop with timing control
  const gameLoop = useCallback(() => {
    if (gameState === 'playing') {
      const gameData = gameDataRef.current;
      
      // Update every 4 frames for classic Pac-Man speed
      if (gameData.gameTime % 4 === 0) {
        updatePacMan();
      }
      
      if (gameData.gameTime % 5 === 0) {
        updateGhosts();
      }
      
      checkCollisions();
      checkLevelComplete();
      
      // Handle mode switching
      gameData.gameTime++;
      gameData.modeSwitchTimer--;
      
      if (gameData.modeSwitchTimer <= 0) {
        gameData.currentMode = gameData.currentMode === 'scatter' ? 'chase' : 'scatter';
        gameData.modeSwitchTimer = gameData.currentMode === 'scatter' ? 420 : 1200;
        
        // Update ghost modes (except frightened)
        gameData.ghosts.forEach(ghost => {
          if (ghost.mode === 'scatter' || ghost.mode === 'chase') {
            ghost.mode = gameData.currentMode;
            ghost.direction = (ghost.direction + 2) % 4;
          }
        });
      }
    }
  }, [gameState, updatePacMan, updateGhosts, checkCollisions, checkLevelComplete]);

  // Handle input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      e.preventDefault();
      
      const gameData = gameDataRef.current;
      const pacman = gameData.pacman;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
          pacman.nextDirection = 0;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          pacman.nextDirection = 1;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          pacman.nextDirection = 2;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          pacman.nextDirection = 3;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      gameLoop();
      
      // Draw
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const gameData = gameDataRef.current;
      
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw maze walls with better graphics
      ctx.fillStyle = '#1E3A8A';
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 1;
      
      for (let y = 0; y < MAZE_HEIGHT; y++) {
        for (let x = 0; x < MAZE_WIDTH; x++) {
          const cell = MAZE_LAYOUT[y][x];
          if (cell === 0) {
            // Draw wall with border
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
      
      // Draw dots
      ctx.fillStyle = '#FFFF00';
      gameData.dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(
          dot.x * CELL_SIZE + CELL_SIZE / 2,
          dot.y * CELL_SIZE + CELL_SIZE / 2,
          1.5, 0, Math.PI * 2
        );
        ctx.fill();
      });
      
      // Draw power pellets
      gameData.powerPellets.forEach(pellet => {
        ctx.beginPath();
        ctx.arc(
          pellet.x * CELL_SIZE + CELL_SIZE / 2,
          pellet.y * CELL_SIZE + CELL_SIZE / 2,
          4, 0, Math.PI * 2
        );
        ctx.fill();
      });
      
      // Draw Pac-Man - classic style
      const pacman = gameData.pacman;
      const pacX = pacman.x * CELL_SIZE + CELL_SIZE / 2;
      const pacY = pacman.y * CELL_SIZE + CELL_SIZE / 2;
      const radius = CELL_SIZE / 2 - 2;
      
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      
      // Classic mouth animation
      const mouthAngle = pacman.moving ? Math.sin(pacman.animFrame * 0.5) * 0.8 + 0.2 : 0.6;
      let startAngle, endAngle;
      
      switch (pacman.direction) {
        case 0: // right
          startAngle = mouthAngle;
          endAngle = Math.PI * 2 - mouthAngle;
          break;
        case 1: // down
          startAngle = Math.PI / 2 + mouthAngle;
          endAngle = Math.PI * 3/2 - mouthAngle;
          break;
        case 2: // left
          startAngle = Math.PI + mouthAngle;
          endAngle = Math.PI - mouthAngle;
          break;
        case 3: // up
          startAngle = Math.PI * 3/2 + mouthAngle;
          endAngle = Math.PI / 2 - mouthAngle;
          break;
        default:
          startAngle = 0.2;
          endAngle = Math.PI * 2 - 0.2;
      }
      
      ctx.arc(pacX, pacY, radius, startAngle, endAngle);
      ctx.lineTo(pacX, pacY);
      ctx.fill();
      
      // Draw ghosts - classic Pac-Man style
      gameData.ghosts.forEach(ghost => {
        const ghostX = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const ghostY = ghost.y * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 - 2;
        
        let bodyColor = ghost.color;
        if (ghost.mode === 'frightened') {
          bodyColor = ghost.modeTimer > 60 ? '#0000FF' : (ghost.modeTimer % 20 < 10 ? '#0000FF' : '#FFFFFF');
        } else if (ghost.mode === 'eaten') {
          // Draw just eyes when eaten
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(ghostX - 4, ghostY - 4, 3, 3);
          ctx.fillRect(ghostX + 1, ghostY - 4, 3, 3);
          ctx.fillStyle = '#000000';
          ctx.fillRect(ghostX - 3, ghostY - 3, 1, 1);
          ctx.fillRect(ghostX + 2, ghostY - 3, 1, 1);
          return;
        }
        
        ctx.fillStyle = bodyColor;
        
        // Classic ghost body shape
        ctx.beginPath();
        // Top rounded part
        ctx.arc(ghostX, ghostY - 3, radius, Math.PI, 0);
        
        // Straight sides
        ctx.lineTo(ghostX + radius, ghostY + radius - 3);
        
        // Bottom wavy edge - classic pac-man style
        const waveSize = 3;
        for (let i = 0; i < 4; i++) {
          const x1 = ghostX + radius - (i * radius / 2);
          const x2 = ghostX + radius - ((i + 1) * radius / 2);
          const y1 = ghostY + radius - 3;
          const y2 = i % 2 === 0 ? ghostY + radius : ghostY + radius - waveSize;
          ctx.lineTo(x1, y1);
          ctx.lineTo(x2, y2);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Classic ghost eyes
        if (ghost.mode !== 'eaten') {
          // White eye background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(ghostX - 6, ghostY - 6, 4, 5);
          ctx.fillRect(ghostX + 2, ghostY - 6, 4, 5);
          
          // Black pupils
          ctx.fillStyle = ghost.mode === 'frightened' ? '#FF0000' : '#000000';
          const pupilSize = 2;
          ctx.fillRect(ghostX - 5, ghostY - 5, pupilSize, pupilSize);
          ctx.fillRect(ghostX + 3, ghostY - 5, pupilSize, pupilSize);
        }
      });
      
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
  }, [gameState, gameLoop]);

  // Initialize game
  useEffect(() => {
    initializeDots();
  }, [initializeDots]);

  // Mobile touch controls
  const handleTouchControl = useCallback((direction) => {
    if (gameState !== 'playing') return;
    const gameData = gameDataRef.current;
    gameData.pacman.nextDirection = direction;
  }, [gameState]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={gameThemes.pacman || gameThemes.snake}>
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
                background: 'linear-gradient(135deg, #FFFF00, #FFA500, #FF69B4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              👻 Pac-Man
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
                  background: 'rgba(0, 0, 0, 0.9)',
                }}
              >
                <canvas 
                  ref={canvasRef} 
                  width={MAZE_WIDTH * CELL_SIZE} 
                  height={MAZE_HEIGHT * CELL_SIZE}
                  style={{
                    border: '2px solid #FFFF00',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: isMobile ? '350px' : `${MAZE_WIDTH * CELL_SIZE}px`,
                    height: 'auto',
                    boxShadow: '0 8px 32px rgba(255, 255, 0, 0.15)',
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
                          Ready Player One!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Navigate the maze and eat all the dots!
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<PlayArrow />}
                          onClick={startGame}
                          sx={{ 
                            background: 'linear-gradient(45deg, #FFFF00, #FFA500)',
                            color: '#000',
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
                      
                      {/* Up Button */}
                      <Box display="flex" justifyContent="center" mb={1}>
                        <IconButton
                          onClick={() => handleTouchControl(3)}
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          <KeyboardArrowUp fontSize="large" />
                        </IconButton>
                      </Box>
                      
                      {/* Left and Right Buttons */}
                      <Box display="flex" justifyContent="center" gap={2} mb={1}>
                        <IconButton
                          onClick={() => handleTouchControl(2)}
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
                          onClick={() => handleTouchControl(0)}
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
                      
                      {/* Down Button */}
                      <Box display="flex" justifyContent="center">
                        <IconButton
                          onClick={() => handleTouchControl(1)}
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          <KeyboardArrowDown fontSize="large" />
                        </IconButton>
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
                        <ListItemIcon>🕹️</ListItemIcon>
                        <ListItemText primary={isMobile ? "Use touch controls to move" : "Arrow keys or WASD to move"} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>🟡</ListItemIcon>
                        <ListItemText primary="Collect all dots to advance levels" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>🔵</ListItemIcon>
                        <ListItemText primary="Power pellets make ghosts vulnerable" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>👻</ListItemIcon>
                        <ListItemText primary="Avoid ghosts or eat them when blue" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>🏆</ListItemIcon>
                        <ListItemText primary="Get the highest score possible!" />
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

export default PacMan;