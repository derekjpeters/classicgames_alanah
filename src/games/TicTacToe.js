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

  return (
    <div className="tictactoe-container">
      <div className="game-header">
        <h2>Tic Tac Toe - Best of 5</h2>
        <div className="match-info">
          <p>First to win 3 games wins the match!</p>
        </div>
        <div className="scoreboard">
          <div className="score-item">
            <span className="score-label">{playerNames.X}</span>
            <span className="score-value x">{scores.X}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Draws</span>
            <span className="score-value draw">{scores.draws}</span>
          </div>
          <div className="score-item">
            <span className="score-label">{playerNames.O}</span>
            <span className="score-value o">{scores.O}</span>
          </div>
        </div>
        {showNameInput && (
          <div className="name-input-container">
            <div className="name-input-group">
              <label>Player X Name:</label>
              <input
                type="text"
                value={playerNames.X === 'Player X' ? '' : playerNames.X}
                onChange={(e) => handleNameChange('X', e.target.value)}
                placeholder="Enter name for X"
                maxLength="15"
              />
            </div>
            <div className="name-input-group">
              <label>Player O Name:</label>
              <input
                type="text"
                value={playerNames.O === 'Player O' ? '' : playerNames.O}
                onChange={(e) => handleNameChange('O', e.target.value)}
                placeholder="Enter name for O"
                maxLength="15"
              />
            </div>
          </div>
        )}
      </div>

      <div className="status-container">
        <div className={`status ${gameState}`}>
          {getStatusMessage()}
        </div>
        {gameState === 'playing' && !matchWinner && (
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
              disabled={gameState !== 'playing' || matchWinner}
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
        <button className="game-btn name-btn" onClick={toggleNameInput}>
          {showNameInput ? 'Hide Names' : 'Set Player Names'}
        </button>
        {matchWinner ? (
          <button className="game-btn new-match-btn" onClick={resetMatch}>
            New Match
          </button>
        ) : (
          <>
            <button className="game-btn new-round-btn" onClick={resetGame}>
              {gameState === 'playing' ? 'Reset Game' : 'Next Game'}
            </button>
            <button className="game-btn reset-match-btn" onClick={resetMatch}>
              Reset Match
            </button>
          </>
        )}
      </div>
    </div>
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
