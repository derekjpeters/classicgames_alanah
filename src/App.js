import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import './App.css';
import Home from "./components/Home";
import TicTacToe from "./games/TicTacToe";
import Snake from "./games/Snake";
import Pong from "./games/Pong";

function Navigation() {
	const location = useLocation();
	const isHome = location.pathname === '/';

	if (isHome) return null;

	return (
		<nav className="game-nav">
			<Link to="/" className="nav-home">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
				</svg>
				Home
			</Link>
			<div className="nav-games">
				<Link 
					to="/snake" 
					className={`nav-link ${location.pathname === '/snake' ? 'active' : ''}`}
				>
					🐍 Snake
				</Link>
				<Link 
					to="/tictactoe" 
					className={`nav-link ${location.pathname === '/tictactoe' ? 'active' : ''}`}
				>
					⭕ Tic Tac Toe
				</Link>
				<Link 
					to="/pong" 
					className={`nav-link ${location.pathname === '/pong' ? 'active' : ''}`}
				>
					🏓 Pong
				</Link>
			</div>
		</nav>
	);
}

function App() {
	return (
		<Router>
			<div className="App">
				<Navigation />
				<main className="main-content">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/tictactoe" element={<TicTacToe />} />
						<Route path="/snake" element={<Snake />} />
						<Route path="/pong" element={<Pong />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
