import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  SportsEsports,
  AutoAwesome,
  PhoneAndroid,
  Speed
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './Home.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Modern indigo
      light: '#818cf8',
      dark: '#4f46e5',
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
    success: {
      main: '#10b981', // Emerald
    },
    error: {
      main: '#ef4444', // Red
    },
    warning: {
      main: '#f59e0b', // Amber
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
            borderColor: '#6366f1',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.35)',
          },
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
    },
  },
});

const Home = () => {
  const games = [
    {
      id: 'snake',
      title: 'Snake',
      description: 'Guide the snake to eat food and grow longer. Avoid hitting walls or yourself!',
      features: ['Classic gameplay', 'Score tracking', 'Smooth controls'],
      difficulty: 'Medium',
      players: '1 Player',
      icon: '🐍',
      color: 'from-cyan-400 to-teal-500'
    },
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe',
      description: 'The classic strategy game. Get three in a row to win!',
      features: ['Two player mode', 'Win detection', 'Classic rules'],
      difficulty: 'Easy',
      players: '2 Players',
      icon: '⭕',
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: 'pong',
      title: 'Pong',
      description: 'The original arcade game. Keep the ball in play with your paddle!',
      features: ['Retro graphics', 'Paddle controls', 'Classic physics'],
      difficulty: 'Easy',
      players: '1 Player',
      icon: '🏓',
      color: 'from-pink-400 to-red-500'
    },
    {
      id: 'tetris',
      title: 'Tetris',
      description: 'The iconic block-stacking puzzle game. Clear lines by filling rows!',
      features: ['Falling blocks', 'Line clearing', 'Increasing speed'],
      difficulty: 'Hard',
      players: '1 Player',
      icon: '🧩',
      color: 'from-green-400 to-blue-500'
    },
    {
      id: 'frogger',
      title: 'Frogger',
      description: 'Cross roads and rivers while avoiding obstacles. Reach the top to win!',
      features: ['Road crossing', 'River obstacles', 'Level progression'],
      difficulty: 'Medium',
      players: '1 Player',
      icon: '🐸',
      color: 'from-emerald-400 to-green-600'
    },
    {
      id: 'crossyroad3d',
      title: 'Crossy Road 3D',
      description: 'Navigate through a 3D world of roads and rivers. Experience the classic in stunning 3D!',
      features: ['3D graphics', 'Immersive gameplay', 'Realistic physics'],
      difficulty: 'Medium',
      players: '1 Player',
      icon: '🎮',
      color: 'from-purple-400 to-indigo-600'
    },
    {
      id: 'joust',
      title: 'Joust',
      description: 'Fly your ostrich and defeat enemies by landing on them from above!',
      features: ['Flying mechanics', 'Platform combat', 'Enemy AI'],
      difficulty: 'Medium',
      players: '1 Player',
      icon: '🦅',
      color: 'from-amber-400 to-orange-600'
    },
    {
      id: 'spacedefender',
      title: 'Space Defender',
      description: 'Defend Earth from waves of alien invaders in this action-packed space shooter!',
      features: ['Wave-based enemies', 'Power-ups', 'Particle effects'],
      difficulty: 'Medium',
      players: '1 Player',
      icon: '🚀',
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'primary';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          py: 4
        }}
      >
        <Container maxWidth="xl">
          {/* Header Section */}
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f59e0b)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Classic Games Collection
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto', 
                mb: 4,
                lineHeight: 1.6,
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Relive the golden age of gaming with these timeless classics, 
              reimagined with modern design and smooth gameplay.
            </Typography>
          </Box>

          {/* Games Grid */}
          <Box mb={10}>
            <Typography 
              variant="h4" 
              textAlign="center" 
              mb={6} 
              color="text.primary"
              sx={{ fontWeight: 700 }}
            >
              Choose Your Game
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {games.map((game) => (
                <Grid item xs={12} sm={6} md={4} key={game.id} sx={{ display: 'flex' }}>
                  <Card 
                    component={Link} 
                    to={`/${game.id}`}
                    sx={{ 
                      width: '100%',
                      maxWidth: 350,
                      display: 'flex',
                      flexDirection: 'column',
                      textDecoration: 'none',
                      color: 'inherit',
                      mx: 'auto'
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Header with Icon and Title */}
                      <Box display="flex" alignItems="center" mb={3}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.8rem',
                            mr: 2,
                            boxShadow: '0 6px 12px rgba(99, 102, 241, 0.2)'
                          }}
                        >
                          {game.icon}
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color="text.primary"
                            sx={{ fontSize: '1.25rem' }}
                          >
                            {game.title}
                          </Typography>
                          {game.wip && (
                            <Chip 
                              label="WIP" 
                              size="small"
                              sx={{ 
                                bgcolor: 'warning.main', 
                                color: 'warning.contrastText',
                                fontSize: '0.65rem',
                                height: '20px',
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        mb={3}
                        sx={{ 
                          lineHeight: 1.6,
                          minHeight: '48px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {game.description}
                      </Typography>
                      
                      {/* Metadata Chips */}
                      <Box display="flex" gap={1} mb={3} justifyContent="flex-start">
                        <Chip 
                          label={game.difficulty}
                          color={getDifficultyColor(game.difficulty)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip 
                          label={game.players}
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                      
                      {/* Feature Tags */}
                      <Box 
                        display="flex" 
                        gap={0.5} 
                        flexWrap="wrap"
                        sx={{ minHeight: '60px' }}
                      >
                        {game.features.map((feature, index) => (
                          <Chip 
                            key={index}
                            label={feature}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              opacity: 0.8,
                              height: '24px'
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                    
                    {/* Action Button */}
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        startIcon={<PlayArrow />}
                        sx={{ 
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600
                        }}
                      >
                        Play Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Features Section */}
          <Box>
            <Typography 
              variant="h4" 
              textAlign="center" 
              mb={6} 
              color="text.primary"
              sx={{ fontWeight: 700 }}
            >
              Why Play Our Games?
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  icon: <SportsEsports sx={{ fontSize: 40 }} />,
                  title: 'Classic Gameplay',
                  description: 'Authentic game mechanics that stay true to the originals'
                },
                {
                  icon: <AutoAwesome sx={{ fontSize: 40 }} />,
                  title: 'Modern Design',
                  description: 'Beautiful graphics and smooth animations for the best experience'
                },
                {
                  icon: <PhoneAndroid sx={{ fontSize: 40 }} />,
                  title: 'Responsive',
                  description: 'Play on any device - desktop, tablet, or mobile'
                },
                {
                  icon: <Speed sx={{ fontSize: 40 }} />,
                  title: 'Fast Loading',
                  description: 'Optimized for quick loading and smooth performance'
                }
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper 
                    elevation={2}
                    sx={{ 
                      p: 4, 
                      textAlign: 'center', 
                      height: '100%',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                  >
                    <Box 
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        color: 'white'
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      mb={2} 
                      fontWeight="bold"
                      color="text.primary"
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Home;