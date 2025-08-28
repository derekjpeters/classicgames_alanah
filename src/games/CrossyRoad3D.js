// src/games/CrossyRoad3D.js
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box as MuiBox,
  Chip,
  Stack,
  Card,
  CardContent,
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
import * as THREE from 'three';
import soundGenerator from '../utils/soundUtils';
import './CrossyRoad3D.css';

const crossyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', // Purple for 3D theme
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    secondary: {
      main: '#06b6d4', // Cyan
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
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
          boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(139, 92, 246, 0.35)',
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
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Player Character Component
function Player({ position, direction, isJumping, jumpProgress }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Jumping animation
      const jumpHeight = isJumping ? Math.sin(jumpProgress * Math.PI) * 1.5 : 0;
      meshRef.current.position.y = 0.5 + jumpHeight;
      
      // Rotation based on direction
      let targetRotation = 0;
      switch (direction) {
        case 'forward': targetRotation = 0; break;
        case 'backward': targetRotation = Math.PI; break;
        case 'left': targetRotation = Math.PI / 2; break;
        case 'right': targetRotation = -Math.PI / 2; break;
      }
      
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation,
        0.1
      );
      
      // Slight bounce animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        {/* Main body */}
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.2, 0.7, 0.4]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.2, 0.7, 0.4]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Eye pupils */}
      <mesh position={[0.2, 0.7, 0.5]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.2, 0.7, 0.5]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

// Car Component
function Car({ position, speed, color }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += speed;
      
      // Reset position when off screen
      if (speed > 0 && meshRef.current.position.x > 25) {
        meshRef.current.position.x = -25;
      } else if (speed < 0 && meshRef.current.position.x < -25) {
        meshRef.current.position.x = 25;
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Car body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Car roof */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[1.2, 0.4, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[0.7, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.7, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.7, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.7, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

// Log Component
function Log({ position, speed }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += speed;
      
      // Reset position when off screen
      if (speed > 0 && meshRef.current.position.x > 25) {
        meshRef.current.position.x = -25;
      } else if (speed < 0 && meshRef.current.position.x < -25) {
        meshRef.current.position.x = 25;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.4, 0.4, 3, 8]} />
      <meshStandardMaterial color="#8b4513" />
    </mesh>
  );
}

// Road Lane Component
function RoadLane({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 2]} />
      <meshStandardMaterial color="#404040" />
    </mesh>
  );
}

// Water Lane Component
function WaterLane({ position }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 2]} />
      <meshStandardMaterial color="#1e40af" />
    </mesh>
  );
}

// Safe Zone Component
function SafeZone({ position, color = "#22c55e" }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// 3D Scene Component
function Scene({ player, cars, logs, gameState }) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Follow player with camera
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, player.x, 0.1);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, player.z + 8, 0.1);
    camera.lookAt(player.x, 0, player.z);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      
      {/* Ground/Base */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 100]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Safe zones */}
      <SafeZone position={[0, 0, -20]} />
      <SafeZone position={[0, 0, 0]} />
      <SafeZone position={[0, 0, 20]} color="#fbbf24" />
      
      {/* Road lanes */}
      <RoadLane position={[0, 0, -18]} />
      <RoadLane position={[0, 0, -16]} />
      <RoadLane position={[0, 0, -14]} />
      <RoadLane position={[0, 0, -12]} />
      <RoadLane position={[0, 0, -10]} />
      
      {/* Water lanes */}
      <WaterLane position={[0, 0, 2]} />
      <WaterLane position={[0, 0, 4]} />
      <WaterLane position={[0, 0, 6]} />
      <WaterLane position={[0, 0, 8]} />
      <WaterLane position={[0, 0, 10]} />
      
      {/* Player */}
      <Player 
        position={[player.x, 0, player.z]} 
        direction={player.direction}
        isJumping={player.isJumping}
        jumpProgress={player.jumpProgress}
      />
      
      {/* Cars */}
      {cars.map((car, index) => (
        <Car
          key={index}
          position={[car.x, 0, car.z]}
          speed={car.speed}
          color={car.color}
        />
      ))}
      
      {/* Logs */}
      {logs.map((log, index) => (
        <Log
          key={index}
          position={[log.x, 0, log.z]}
          speed={log.speed}
        />
      ))}
    </>
  );
}

const CrossyRoad3D = () => {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver'
  const [player, setPlayer] = useState({ 
    x: 0, 
    z: -20, 
    direction: 'forward', 
    isJumping: false, 
    jumpProgress: 0 
  });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  
  // Game objects
  const [cars, setCars] = useState([]);
  const [logs, setLogs] = useState([]);

  // Initialize game objects
  const initializeObjects = useCallback(() => {
    const newCars = [];
    const newLogs = [];

    // Create cars on road lanes
    const roadLanes = [-18, -16, -14, -12, -10];
    roadLanes.forEach((laneZ, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const speed = direction * (0.02 + Math.random() * 0.03) * (1 + level * 0.2);
      const carCount = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < carCount; i++) {
        newCars.push({
          x: (i * 8 + Math.random() * 4) * direction,
          z: laneZ,
          speed: speed,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        });
      }
    });

    // Create logs on water lanes
    const waterLanes = [2, 4, 6, 8, 10];
    waterLanes.forEach((laneZ, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const speed = direction * (0.01 + Math.random() * 0.02);
      const logCount = 2 + Math.floor(Math.random() * 1);
      
      for (let i = 0; i < logCount; i++) {
        newLogs.push({
          x: (i * 10 + Math.random() * 3) * direction,
          z: laneZ,
          speed: speed
        });
      }
    });

    setCars(newCars);
    setLogs(newLogs);
  }, [level]);

  const resetGame = useCallback(() => {
    setPlayer({ x: 0, z: -20, direction: 'forward', isJumping: false, jumpProgress: 0 });
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('start');
    initializeObjects();
  }, [initializeObjects]);

  const startGame = useCallback(() => {
    setGameState('playing');
    initializeObjects();
  }, [initializeObjects]);

  const movePlayer = useCallback((direction) => {
    if (gameState !== 'playing') return;
    
    setPlayer(prevPlayer => {
      if (prevPlayer.isJumping) return prevPlayer;
      
      soundGenerator.blip(400, 0.1);
      let newX = prevPlayer.x;
      let newZ = prevPlayer.z;

      switch (direction) {
        case 'forward':
          newZ = Math.min(20, prevPlayer.z + 2);
          break;
        case 'backward':
          newZ = Math.max(-20, prevPlayer.z - 2);
          break;
        case 'left':
          newX = Math.max(-20, prevPlayer.x - 2);
          break;
        case 'right':
          newX = Math.min(20, prevPlayer.x + 2);
          break;
      }

      // Check if reached the end zone
      if (newZ >= 20) {
        soundGenerator.victory();
        setScore(prev => prev + 100 * level);
        setLevel(prev => prev + 1);
        return { x: 0, z: -20, direction: 'forward', isJumping: false, jumpProgress: 0 };
      }

      return { 
        x: newX, 
        z: newZ, 
        direction: direction, 
        isJumping: true, 
        jumpProgress: 0 
      };
    });
  }, [gameState, level]);

  // Check collisions
  const checkCollisions = useCallback(() => {
    // Check car collisions
    const roadLanes = [-18, -16, -14, -12, -10];
    if (roadLanes.includes(player.z)) {
      for (let car of cars) {
        if (Math.abs(car.x - player.x) < 1.5 && Math.abs(car.z - player.z) < 1) {
          return 'car';
        }
      }
    }

    // Check water without log
    const waterLanes = [2, 4, 6, 8, 10];
    if (waterLanes.includes(player.z)) {
      let onLog = false;
      for (let log of logs) {
        if (Math.abs(log.x - player.x) < 2 && Math.abs(log.z - player.z) < 1) {
          onLog = true;
          // Move player with log
          setPlayer(prev => ({
            ...prev,
            x: Math.max(-20, Math.min(20, prev.x + log.speed))
          }));
          break;
        }
      }
      if (!onLog) {
        return 'water';
      }
    }

    return 'safe';
  }, [player, cars, logs]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      // Update player jump animation
      setPlayer(prevPlayer => {
        if (prevPlayer.isJumping) {
          const newProgress = prevPlayer.jumpProgress + 0.15;
          if (newProgress >= 1) {
            return { ...prevPlayer, isJumping: false, jumpProgress: 0 };
          }
          return { ...prevPlayer, jumpProgress: newProgress };
        }
        return prevPlayer;
      });

      // Check collisions
      const collision = checkCollisions();
      if (collision === 'car' || collision === 'water') {
        soundGenerator.hit();
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            soundGenerator.gameOver();
            setGameState('gameOver');
          } else {
            setPlayer({ x: 0, z: -20, direction: 'forward', isJumping: false, jumpProgress: 0 });
          }
          return newLives;
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, checkCollisions]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer('forward');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer('backward');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={crossyTheme}>
      <MuiBox 
        sx={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          py: { xs: 2, md: 4 }
        }}
      >
        <Container maxWidth={isMobile ? "sm" : "xl"}>
          {/* Header */}
          <MuiBox textAlign="center" mb={{ xs: 2, md: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              🎮 Crossy Road 3D
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
          </MuiBox>

          {/* Game Area */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} lg={8}>
              <Paper 
                elevation={3}
                sx={{ 
                  position: 'relative',
                  p: { xs: 1, md: 2 },
                  borderRadius: 3,
                  background: 'rgba(0, 0, 0, 0.8)',
                  height: '60vh',
                  minHeight: '400px'
                }}
              >
                <Canvas
                  camera={{ position: [0, 10, 8], fov: 75 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <Scene 
                    player={player}
                    cars={cars}
                    logs={logs}
                    gameState={gameState}
                  />
                </Canvas>
              
                {gameState === 'start' && (
                  <MuiBox
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Navigate the 3D world! Use arrow keys or WASD to move forward, backward, left, and right.
                        </Typography>
                        <Button 
                          variant="contained" 
                          startIcon={<PlayArrow />}
                          onClick={startGame}
                          sx={{ 
                            background: 'linear-gradient(45deg, #8b5cf6, #a78bfa)',
                            mt: 2
                          }}
                        >
                          Start Game
                        </Button>
                      </CardContent>
                    </Card>
                  </MuiBox>
                )}

                {gameState === 'gameOver' && (
                  <MuiBox
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
                  </MuiBox>
                )}
              </Paper>
            </Grid>
            
            {/* Mobile Touch Controls */}
            {isMobile && (
              <Grid item xs={12} lg={4}>
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
                  
                  {/* Forward Button */}
                  <IconButton
                    onClick={() => movePlayer('forward')}
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
                  <MuiBox display="flex" gap={2} mb={1}>
                    <IconButton
                      onClick={() => movePlayer('left')}
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
                      onClick={() => movePlayer('right')}
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
                  </MuiBox>
                  
                  {/* Backward Button */}
                  <IconButton
                    onClick={() => movePlayer('backward')}
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

          {/* Instructions */}
          <Card sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                How to Play Crossy Road 3D
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    🎮 <strong>Controls:</strong> Arrow keys or WASD to move
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    🚗 <strong>Roads:</strong> Avoid moving cars
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    💧 <strong>Water:</strong> Jump on logs to cross safely
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    🎯 <strong>Goal:</strong> Reach the golden safe zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ⚠️ <strong>Danger:</strong> Don't fall in water or get hit
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📈 <strong>Levels:</strong> Each level gets faster and harder
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </MuiBox>
    </ThemeProvider>
  );
};

export default CrossyRoad3D;