// src/games/TicTacToe.js
import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

const TicTacToe = () => {
  const initialBoard = Array(9).fill(null);
  const [board, setBoard] = useState(initialBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'draw'
  const [winningLine, setWinningLine] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  useEffect(() => {
    if (winner) {
      setGameState('won');
      setScores(prev => ({
        ...prev,
        [winner.winner]: prev[winner.winner] + 1
      }));
      setWinningLine(winner.line);
    } else if (isDraw) {
      setGameState('draw');
      setScores(prev => ({
        ...prev,
        draws: prev.draws + 1
      }));
    }
  }, [winner, isDraw]);

  function handleClick(index) {
    if (board[index] || gameState !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    setBoard(initialBoard);
    setXIsNext(true);
    setGameState('playing');
    setWinningLine(null);
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
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
    if (winner) {
      return `🎉 Player ${winner.winner} Wins!`;
    }
    if (isDraw) {
      return "🤝 It's a Draw!";
    }
    return `Next: Player ${xIsNext ? 'X' : 'O'}`;
  };

  return (
    <div className="tictactoe-container">
      <div className="game-header">
        <h2>Tic Tac Toe</h2>
        <div className="scoreboard">
          <div className="score-item">
            <span className="score-label">Player X</span>
            <span className="score-value x">{scores.X}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Draws</span>
            <span className="score-value draw">{scores.draws}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Player O</span>
            <span className="score-value o">{scores.O}</span>
          </div>
        </div>
      </div>

      <div className="status-container">
        <div className={`status ${gameState}`}>
          {getStatusMessage()}
        </div>
        {gameState === 'playing' && (
          <div className="current-player">
            <span className={`player-indicator ${xIsNext ? 'x' : 'o'}`}>
              {xIsNext ? 'X' : 'O'}
            </span>
          </div>
        )}
      </div>

      <div className="board-container">
        <div className="board">
          {board.map((square, i) => (
            <button 
              key={i} 
              className={getSquareClass(i)} 
              onClick={() => handleClick(i)}
              disabled={gameState !== 'playing'}
            >
              {square && (
                <span className="square-content">
                  {square}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="game-controls">
        <button className="game-btn new-round-btn" onClick={resetGame}>
          New Round
        </button>
        <button className="game-btn reset-scores-btn" onClick={resetScores}>
          Reset Scores
        </button>
      </div>
    </div>
  );
};

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
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
