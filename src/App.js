import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Menu as MenuIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState } from 'react';
import './App.css';
import Home from "./components/Home";
import TicTacToe from "./games/TicTacToe";
import Snake from "./games/Snake";
import Pong from "./games/Pong";
import Tetris from "./games/Tetris";
import Frogger from "./games/Frogger";
import CrossyRoad3D from "./games/CrossyRoad3D";
import Joust from "./games/Joust";
import SpaceDefender from "./games/SpaceDefender";

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
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
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
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function Navigation() {
	const location = useLocation();
	const isHome = location.pathname === '/';
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [anchorEl, setAnchorEl] = useState(null);

	const games = [
		{ path: '/snake', name: 'Snake', icon: '🐍' },
		{ path: '/tictactoe', name: 'Tic Tac Toe', icon: '⭕' },
		{ path: '/pong', name: 'Pong', icon: '🏓' },
		{ path: '/tetris', name: 'Tetris', icon: '🧩' },
		{ path: '/frogger', name: 'Frogger', icon: '🐸' },
		{ path: '/crossyroad3d', name: 'Crossy Road 3D', icon: '🎮' },
		{ path: '/joust', name: 'Joust', icon: '🦅' },
		{ path: '/spacedefender', name: 'Space Defender', icon: '🚀' },
	];

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	if (isHome) return null;

	return (
		<AppBar position="static" elevation={0}>
			<Toolbar>
				<Button
					component={Link}
					to="/"
					startIcon={<HomeIcon />}
					sx={{ 
						color: 'text.primary',
						'&:hover': {
							backgroundColor: 'rgba(99, 102, 241, 0.1)',
						}
					}}
				>
					Home
				</Button>
				
				<Box sx={{ flexGrow: 1 }} />
				
				<Typography
					variant="h6"
					sx={{
						display: { xs: 'none', sm: 'block' },
						fontWeight: 700,
						background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f59e0b)',
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
					}}
				>
					Classic Games
				</Typography>
				
				<Box sx={{ flexGrow: 1 }} />

				{isMobile ? (
					<>
						<IconButton
							color="inherit"
							onClick={handleMenuOpen}
							sx={{ color: 'primary.main' }}
						>
							<MenuIcon />
						</IconButton>
						<Menu
							anchorEl={anchorEl}
							open={Boolean(anchorEl)}
							onClose={handleMenuClose}
						>
							{games.map((game) => (
								<MenuItem
									key={game.path}
									component={Link}
									to={game.path}
									onClick={handleMenuClose}
									selected={location.pathname === game.path}
									sx={{
										color: location.pathname === game.path ? 'primary.main' : 'text.primary',
										'&:hover': {
											backgroundColor: 'rgba(99, 102, 241, 0.1)',
										},
										'&.Mui-selected': {
											backgroundColor: 'rgba(99, 102, 241, 0.15)',
										}
									}}
								>
									{game.icon} {game.name}
								</MenuItem>
							))}
						</Menu>
					</>
				) : (
					<Box sx={{ display: 'flex', gap: 1 }}>
						{games.map((game) => (
							<Button
								key={game.path}
								component={Link}
								to={game.path}
								variant={location.pathname === game.path ? "contained" : "text"}
								size="small"
								sx={{
									color: location.pathname === game.path ? 'white' : 'text.secondary',
									backgroundColor: location.pathname === game.path ? 'primary.main' : 'transparent',
									'&:hover': {
										backgroundColor: location.pathname === game.path 
											? 'primary.dark' 
											: 'rgba(99, 102, 241, 0.1)',
										color: location.pathname === game.path ? 'white' : 'primary.main',
									},
									minWidth: 'auto',
									px: 2,
									py: 1,
									fontSize: '1.2rem',
								}}
							>
								{game.icon}
							</Button>
						))}
					</Box>
				)}
			</Toolbar>
		</AppBar>
	);
}

function App() {
	return (
		<ThemeProvider theme={theme}>
			<Router>
				<div className="App">
					<Navigation />
					<main className="main-content">
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/tictactoe" element={<TicTacToe />} />
							<Route path="/snake" element={<Snake />} />
							<Route path="/pong" element={<Pong />} />
							<Route path="/tetris" element={<Tetris />} />
							<Route path="/frogger" element={<Frogger />} />
							<Route path="/crossyroad3d" element={<CrossyRoad3D />} />
							<Route path="/joust" element={<Joust />} />
							<Route path="/spacedefender" element={<SpaceDefender />} />
						</Routes>
					</main>
				</div>
			</Router>
		</ThemeProvider>
	);
}

export default App;
