// src/theme/gameTheme.js
import { createTheme } from '@mui/material/styles';

// Base theme configuration that all games can extend
export const createGameTheme = (primaryColor, secondaryColor, backgroundColors) => {
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: primaryColor.main,
        light: primaryColor.light,
        dark: primaryColor.dark,
      },
      secondary: {
        main: secondaryColor.main,
        light: secondaryColor.light,
        dark: secondaryColor.dark,
      },
      background: {
        default: backgroundColors.default,
        paper: backgroundColors.paper,
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
            backgroundColor: backgroundColors.paper,
            border: `1px solid ${primaryColor.main}33`,
            borderRadius: '16px',
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            fontWeight: 600,
            textTransform: 'none',
          },
          contained: {
            boxShadow: `0 4px 14px 0 ${primaryColor.main}40`,
            '&:hover': {
              boxShadow: `0 6px 20px 0 ${primaryColor.main}60`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: backgroundColors.paper,
            border: `1px solid ${primaryColor.main}33`,
            borderRadius: '16px',
            backgroundImage: 'none',
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
};

// Pre-defined theme configurations for different games
export const gameThemes = {
  snake: createGameTheme(
    { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
    { main: '#ff5722', light: '#ff8a65', dark: '#d84315' },
    { default: '#0f172a', paper: '#1e293b' }
  ),
  
  pong: createGameTheme(
    { main: '#2196f3', light: '#64b5f6', dark: '#1976d2' },
    { main: '#ff9800', light: '#ffb74d', dark: '#f57c00' },
    { default: '#0f172a', paper: '#1e293b' }
  ),
  
  tictactoe: createGameTheme(
    { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2' },
    { main: '#f44336', light: '#e57373', dark: '#d32f2f' },
    { default: '#0f172a', paper: '#1e293b' }
  ),
  
  tetris: createGameTheme(
    { main: '#ff5722', light: '#ff8a65', dark: '#d84315' },
    { main: '#4caf50', light: '#81c784', dark: '#388e3c' },
    { default: '#0f172a', paper: '#1e293b' }
  ),
  
  frogger: createGameTheme(
    { main: '#10b981', light: '#34d399', dark: '#059669' },
    { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    { default: '#0f172a', paper: '#1e293b' }
  ),
  
  galaga: createGameTheme(
    { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
    { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    { default: '#0c0c0c', paper: '#1a1a2e' }
  ),
};