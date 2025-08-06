// src/games/Pong.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  PlayArrow, 
  RestartAlt,
  Pause,
  SportsEsports
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { gameThemes } from '../theme/gameTheme';
import soundGenerator from '../utils/soundUtils';
import './Pong.css';

// Game constants
const canvasWidth = 600;
const canvasHeight = 400;
const winningScore = 5;

const difficultySettings = {
  easy: { aiSpeed: 2, ballSpeed: 3, aiAccuracy: 0.7 },
  medium: { aiSpeed: 4, ballSpeed: 5, aiAccuracy: 0.85 },
  hard: { aiSpeed: 6, ballSpeed: 7, aiAccuracy: 0.95 },
  nuclear: { aiSpeed: 8, ballSpeed: 9, aiAccuracy: 1.0 }
};

const Pong = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const [gameState, setGameState] = useState('start'); // 'start', 'serving', 'playing', 'paused', 'gameOver'
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  

  const gameData = useRef({
    paddleHeight: 75,
    paddleWidth: 12,
    leftY: (canvasHeight - 75) / 2,
    rightY: (canvasHeight - 75) / 2,
    ballX: canvasWidth / 2,
    ballY: canvasHeight / 2,
    ballSpeedX: 5,
    ballSpeedY: 4,
    ballRadius: 8,
    aiSpeed: 4,
    serving: false
  });

  const resetBall = useCallback(() => {
    const data = gameData.current;
    data.ballX = canvasWidth / 2;
    data.ballY = canvasHeight / 2;
    data.ballSpeedX = 0;
    data.ballSpeedY = 0;
    data.serving = true;
    setGameState('serving');
  }, []);

  const serveBall = useCallback(() => {
    soundGenerator.blip(800, 0.1);
    const data = gameData.current;
    const settings = difficultySettings[difficulty];
    data.ballSpeedX = Math.random() > 0.5 ? settings.ballSpeed : -settings.ballSpeed;
    data.ballSpeedY = (Math.random() - 0.5) * 6;
    data.serving = false;
    setGameState('playing');
  }, [difficulty]);

  const resetGame = useCallback(() => {
    setPlayerScore(0);
    setAiScore(0);
    setGameState('start');
    const data = gameData.current;
    data.ballX = canvasWidth / 2;
    data.ballY = canvasHeight / 2;
    data.ballSpeedX = 0;
    data.ballSpeedY = 0;
    data.serving = false;
  }, []);

  const startGame = useCallback(() => {
    const data = gameData.current;
    const settings = difficultySettings[difficulty];
    data.aiSpeed = settings.aiSpeed;
    resetBall();
  }, [resetBall, difficulty]);

  const pauseGame = useCallback(() => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = gameData.current;

    const draw = () => {
      // Background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2, 0);
      ctx.lineTo(canvasWidth / 2, canvasHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ball with glow effect
      const ballGradient = ctx.createRadialGradient(
        data.ballX, data.ballY, 0,
        data.ballX, data.ballY, data.ballRadius * 2
      );
      ballGradient.addColorStop(0, '#00f5ff');
      ballGradient.addColorStop(1, 'rgba(0, 245, 255, 0.2)');
      
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(data.ballX, data.ballY, data.ballRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(data.ballX, data.ballY, data.ballRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Player paddle (left) with gradient
      const playerGradient = ctx.createLinearGradient(0, data.leftY, data.paddleWidth, data.leftY + data.paddleHeight);
      playerGradient.addColorStop(0, '#00f5ff');
      playerGradient.addColorStop(1, '#4ecdc4');
      ctx.fillStyle = playerGradient;
      ctx.fillRect(0, data.leftY, data.paddleWidth, data.paddleHeight);
      
      // Paddle highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, data.leftY, 3, data.paddleHeight);

      // AI paddle (right) with gradient
      const aiGradient = ctx.createLinearGradient(canvasWidth - data.paddleWidth, data.rightY, canvasWidth, data.rightY + data.paddleHeight);
      aiGradient.addColorStop(0, '#ff6b6b');
      aiGradient.addColorStop(1, '#ffa726');
      ctx.fillStyle = aiGradient;
      ctx.fillRect(canvasWidth - data.paddleWidth, data.rightY, data.paddleWidth, data.paddleHeight);
      
      // AI paddle highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(canvasWidth - 3, data.rightY, 3, data.paddleHeight);
    };

    const update = () => {
      if (gameState !== 'playing') return;

      // Ball movement
      data.ballX += data.ballSpeedX;
      data.ballY += data.ballSpeedY;

      // Ball collision with top and bottom
      if (data.ballY - data.ballRadius < 0 || data.ballY + data.ballRadius > canvasHeight) {
        soundGenerator.bounce();
        data.ballSpeedY *= -1;
      }

      // Ball collision with player paddle (left)
      if (
        data.ballX - data.ballRadius < data.paddleWidth &&
        data.ballY > data.leftY &&
        data.ballY < data.leftY + data.paddleHeight
      ) {
        soundGenerator.bounce();
        data.ballSpeedX = Math.abs(data.ballSpeedX);
        // Add spin based on where ball hits paddle
        const hitPosition = (data.ballY - (data.leftY + data.paddleHeight / 2)) / (data.paddleHeight / 2);
        data.ballSpeedY = hitPosition * 6;
      }

      // Ball collision with AI paddle (right)
      if (
        data.ballX + data.ballRadius > canvasWidth - data.paddleWidth &&
        data.ballY > data.rightY &&
        data.ballY < data.rightY + data.paddleHeight
      ) {
        soundGenerator.bounce();
        data.ballSpeedX = -Math.abs(data.ballSpeedX);
        const hitPosition = (data.ballY - (data.rightY + data.paddleHeight / 2)) / (data.paddleHeight / 2);
        data.ballSpeedY = hitPosition * 6;
      }

      // AI movement with difficulty-based accuracy
      const settings = difficultySettings[difficulty];
      const aiCenter = data.rightY + data.paddleHeight / 2;
      // Add some randomness based on difficulty
      const accuracy = settings.aiAccuracy;
      const targetY = data.ballY + (Math.random() - 0.5) * (1 - accuracy) * 50;
      const adjustedDistance = targetY - aiCenter;
      
      if (Math.abs(adjustedDistance) > 5) {
        if (adjustedDistance > 0) {
          data.rightY += Math.min(data.aiSpeed, adjustedDistance);
        } else {
          data.rightY += Math.max(-data.aiSpeed, adjustedDistance);
        }
      }

      // Keep AI paddle in bounds
      data.rightY = Math.max(0, Math.min(canvasHeight - data.paddleHeight, data.rightY));

      // Scoring
      if (data.ballX < 0) {
        setAiScore(prev => {
          const newScore = prev + 1;
          if (newScore >= winningScore) {
            soundGenerator.gameOver();
            setGameState('gameOver');
            return newScore;
          }
          soundGenerator.coin();
          resetBall();
          return newScore;
        });
      } else if (data.ballX > canvasWidth) {
        setPlayerScore(prev => {
          const newScore = prev + 1;
          if (newScore >= winningScore) {
            soundGenerator.victory();
            setGameState('gameOver');
            return newScore;
          }
          soundGenerator.coin();
          resetBall();
          return newScore;
        });
      }
    };

    const gameLoop = () => {
      update();
      draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      gameLoop();
    } else {
      draw();
    }

    const handleMouseMove = (e) => {
      if (gameState !== 'playing') return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      data.leftY = mouseY - data.paddleHeight / 2;
      data.leftY = Math.max(0, Math.min(canvasHeight - data.paddleHeight, data.leftY));
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'serving') {
          serveBall();
        } else if (gameState === 'playing' || gameState === 'paused') {
          pauseGame();
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, pauseGame, resetBall, serveBall, difficulty]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={gameThemes.pong}>
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
                background: 'linear-gradient(135deg, #2196f3, #64b5f6, #90caf9)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              🏓 Pong
            </Typography>
            
            <Stack 
              direction={{ xs: 'row', sm: 'row' }} 
              spacing={{ xs: 1, sm: 2 }} 
              justifyContent="center"
              flexWrap="wrap"
              gap={1}
            >
              <Chip 
                label={`You: ${playerScore}`} 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                size={isMobile ? "small" : "medium"}
              />
              <Chip 
                label={`AI: ${aiScore}`} 
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
                    border: '2px solid #2196f3',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: isMobile ? '350px' : '600px',
                    height: 'auto',
                    boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)'
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
                  <Card sx={{ maxWidth: 350, textAlign: 'center' }}>
                    <CardContent>
                      <Typography variant="h5" gutterBottom color="primary">
                        Choose Difficulty
                      </Typography>
                      <ToggleButtonGroup
                        value={difficulty}
                        exclusive
                        onChange={(e, newDifficulty) => newDifficulty && setDifficulty(newDifficulty)}
                        sx={{ mb: 2 }}
                        size="small"
                      >
                        <ToggleButton value="easy">Easy</ToggleButton>
                        <ToggleButton value="medium">Medium</ToggleButton>
                        <ToggleButton value="hard">Hard</ToggleButton>
                        <ToggleButton value="nuclear">Nuclear</ToggleButton>
                      </ToggleButtonGroup>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Move your mouse to control the left paddle. First to {winningScore} wins!
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<PlayArrow />}
                        onClick={startGame}
                        sx={{ 
                          background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
                          mt: 2
                        }}
                      >
                        Start Game
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {gameState === 'serving' && (
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
                        Ready to Serve
                      </Typography>
                      <Typography variant="body2" color="secondary" paragraph>
                        Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<SportsEsports />}
                        onClick={serveBall}
                        sx={{ 
                          background: 'linear-gradient(45deg, #4caf50, #81c784)',
                          mt: 2
                        }}
                      >
                        Serve Ball
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {gameState === 'paused' && (
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
                      <Typography variant="h5" gutterBottom color="warning">
                        Game Paused
                      </Typography>
                      <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                        <Button 
                          variant="contained" 
                          startIcon={<PlayArrow />}
                          onClick={pauseGame}
                          sx={{ 
                            background: 'linear-gradient(45deg, #4caf50, #81c784)'
                          }}
                        >
                          Resume
                        </Button>
                        <Button 
                          variant="outlined" 
                          startIcon={<RestartAlt />}
                          onClick={resetGame}
                        >
                          New Game
                        </Button>
                      </Stack>
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
                      <Typography variant="h5" gutterBottom color={playerScore >= winningScore ? "primary" : "error"}>
                        {playerScore >= winningScore ? 'You Win!' : 'AI Wins!'}
                      </Typography>
                      <Typography variant="body1" color="text.primary" gutterBottom>
                        Final Score: {playerScore} - {aiScore}
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

              {gameState === 'playing' && (
                <Box
                  position="absolute"
                  top={16}
                  right={16}
                  display="flex"
                  gap={1}
                  alignItems="center"
                >
                  <Chip 
                    label={`Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`}
                    size="small"
                    variant="outlined"
                  />
                  <Button 
                    variant="outlined"
                    size="small"
                    startIcon={<Pause />}
                    onClick={pauseGame}
                  >
                    Pause
                  </Button>
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
                  <ListItemIcon>🖁</ListItemIcon>
                  <ListItemText primary="Move your mouse to control the left paddle" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>⚽</ListItemIcon>
                  <ListItemText primary="Hit the ball back and forth with your opponent" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>⏸️</ListItemIcon>
                  <ListItemText primary="Press SPACE to serve ball or pause the game" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>🏆</ListItemIcon>
                  <ListItemText primary={`First to ${winningScore} points wins the match`} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Pong;
