// src/games/TicTacToe.js
import React, { useState, useEffect } from 'react';
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
  TextField,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  RestartAlt,
  Edit,
  Close,
  EmojiEvents
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { gameThemes } from '../theme/gameTheme';
import './TicTacToe.css';

const TicTacToe = () => {
  const initialBoard = Array(9).fill(null);
  const [board, setBoard] = useState(initialBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'draw'
  const [winningLine, setWinningLine] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [matchWinner, setMatchWinner] = useState(null);
  const [gameNumber, setGameNumber] = useState(1);
  const [playerNames, setPlayerNames] = useState({ X: 'Player X', O: 'Player O' });
  const [showNameInput, setShowNameInput] = useState(false);

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  useEffect(() => {
    if (winner && gameState === 'playing') {
      setGameState('won');
      setWinningLine(winner.line);

      setScores(prev => {
        const updatedScores = {
          ...prev,
          [winner.winner]: prev[winner.winner] + 1
        };

        if (updatedScores[winner.winner] >= 3) {
          setMatchWinner(winner.winner);
        }

        return updatedScores;
      });
    } else if (isDraw && gameState === 'playing') {
      setGameState('draw');
      setScores(prev => ({
        ...prev,
        draws: prev.draws + 1
      }));
    }
  }, [winner, isDraw, gameState]);

  function handleClick(index) {
    if (board[index] || gameState !== 'playing' || matchWinner) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    if (matchWinner) {
      setScores({ X: 0, O: 0, draws: 0 });
      setMatchWinner(null);
      setGameNumber(1);
    } else {
      setGameNumber(prev => prev + 1);
    }
    setBoard(initialBoard);
    setXIsNext(true);
    setGameState('playing');
    setWinningLine(null);
  }

  function resetMatch() {
    setScores({ X: 0, O: 0, draws: 0 });
    setMatchWinner(null);
    setGameNumber(1);
    setBoard(initialBoard);
    setXIsNext(true);
    setGameState('playing');
    setWinningLine(null);
  }

  function handleNameChange(player, name) {
    setPlayerNames(prev => ({
      ...prev,
      [player]: name || `Player ${player}`
    }));
  }

  function toggleNameInput() {
    setShowNameInput(!showNameInput);
  }

  const getSquareClass = (index) => {
    let className = 'square';
    if (board[index]) {
      className += ` filled ${board[index].toLowerCase()}`;
    }
    if (winningLine && winningLine.includes(index)) {
      className += ' winning';
    }
    return className;
  };

  const getStatusMessage = () => {
    if (matchWinner) {
      return `🏆 ${playerNames[matchWinner]} Wins the Match!`;
    }
    if (winner) {
      return `🎉 ${playerNames[winner.winner]} Wins Game ${gameNumber}!`;
    }
    if (isDraw) {
      return `🤝 Game ${gameNumber} is a Draw!`;
    }
    return `Game ${gameNumber} - Next: ${playerNames[xIsNext ? 'X' : 'O']}`;
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={gameThemes.tictactoe}>
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
                background: 'linear-gradient(135deg, #9c27b0, #ba68c8, #ce93d8)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              ⭕ Tic Tac Toe
            </Typography>
            
            <Typography variant="h6" color="text.secondary" mb={2}>
              Best of 5 - First to win 3 games wins the match!
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 1, sm: 2 }} 
              justifyContent="center"
              flexWrap="wrap"
              gap={1}
            >
              <Chip 
                label={`${playerNames.X}: ${scores.X}`} 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                size={isMobile ? "small" : "medium"}
              />
              <Chip 
                label={`Draws: ${scores.draws}`} 
                variant="outlined"
                sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                size={isMobile ? "small" : "medium"}
              />
              <Chip 
                label={`${playerNames.O}: ${scores.O}`} 
                color="secondary" 
                variant="outlined"
                sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                size={isMobile ? "small" : "medium"}
              />
            </Stack>
          </Box>

          {/* Player Name Input */}
          {showNameInput && (
            <Card sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" textAlign="center">
                  Player Names
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Player X Name"
                    value={playerNames.X === 'Player X' ? '' : playerNames.X}
                    onChange={(e) => handleNameChange('X', e.target.value)}
                    placeholder="Enter name for X"
                    inputProps={{ maxLength: 15 }}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Player O Name"
                    value={playerNames.O === 'Player O' ? '' : playerNames.O}
                    onChange={(e) => handleNameChange('O', e.target.value)}
                    placeholder="Enter name for O"
                    inputProps={{ maxLength: 15 }}
                    size="small"
                    fullWidth
                  />
                </Stack>
                <Box textAlign="center" mt={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<Close />}
                    onClick={toggleNameInput}
                    size="small"
                  >
                    Done
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Game Status */}
          <Card sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                color={matchWinner ? "success" : winner ? (winner.winner === 'X' ? "primary" : "secondary") : "text.primary"}
              >
                {getStatusMessage()}
              </Typography>
              {gameState === 'playing' && !matchWinner && (
                <Chip 
                  label={`${playerNames[xIsNext ? 'X' : 'O']}'s Turn`}
                  color={xIsNext ? "primary" : "secondary"}
                  variant="filled"
                  sx={{ fontSize: '1rem', py: 2, px: 3 }}
                />
              )}
            </CardContent>
          </Card>

          {/* Game Board */}
          <Box display="flex" justifyContent="center" mb={3}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 2,
                borderRadius: 3,
                background: 'rgba(0, 0, 0, 0.8)',
              }}
            >
              <Grid container spacing={1} sx={{ width: isMobile ? 300 : 360 }}>
                {board.map((square, i) => (
                  <Grid item xs={4} key={i}>
                    <Paper
                      component="button"
                      onClick={() => handleClick(i)}
                      disabled={gameState !== 'playing' || matchWinner || square}
                      sx={{
                        width: '100%',
                        height: isMobile ? 90 : 110,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: '2rem', md: '3rem' },
                        fontWeight: 'bold',
                        cursor: (gameState === 'playing' && !matchWinner && !square) ? 'pointer' : 'default',
                        backgroundColor: winningLine && winningLine.includes(i) 
                          ? 'rgba(156, 39, 176, 0.3)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(156, 39, 176, 0.3)',
                        borderRadius: 2,
                        color: square === 'X' ? 'primary.main' : square === 'O' ? 'secondary.main' : 'transparent',
                        '&:hover': {
                          backgroundColor: (gameState === 'playing' && !matchWinner && !square) 
                            ? 'rgba(156, 39, 176, 0.1)' 
                            : undefined
                        },
                        '&:disabled': {
                          backgroundColor: winningLine && winningLine.includes(i) 
                            ? 'rgba(156, 39, 176, 0.3)' 
                            : 'rgba(255, 255, 255, 0.05)',
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {square}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>

          {/* Game Controls */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            alignItems="center"
          >
            <Button 
              variant="outlined" 
              startIcon={<Edit />}
              onClick={toggleNameInput}
              size={isMobile ? "small" : "medium"}
            >
              {showNameInput ? 'Hide Names' : 'Set Player Names'}
            </Button>
            
            {matchWinner ? (
              <Button 
                variant="contained" 
                startIcon={<EmojiEvents />}
                onClick={resetMatch}
                sx={{ 
                  background: 'linear-gradient(45deg, #4caf50, #81c784)'
                }}
                size={isMobile ? "small" : "medium"}
              >
                New Match
              </Button>
            ) : (
              <>
                <Button 
                  variant="contained" 
                  startIcon={<RestartAlt />}
                  onClick={resetGame}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                >
                  {gameState === 'playing' ? 'Reset Game' : 'Next Game'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={resetMatch}
                  size={isMobile ? "small" : "medium"}
                >
                  Reset Match
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return null;
}

export default TicTacToe;
