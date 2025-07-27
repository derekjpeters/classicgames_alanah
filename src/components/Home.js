import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

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
    }
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Classic Games Collection</h1>
        <p className="home-subtitle">
          Relive the golden age of gaming with these timeless classics, 
          reimagined with modern design and smooth gameplay.
        </p>
      </header>

      <section className="games-showcase">
        <h2 className="section-title">Choose Your Game</h2>
        <div className="games-grid">
          {games.map((game) => (
            <Link to={`/${game.id}`} key={game.id} className="game-card-link">
              <div className={`game-card ${game.id}-card`}>
                <div className="game-icon">
                  <span className="icon-emoji">{game.icon}</span>
                </div>
                
                <div className="game-info">
                  <h3 className="game-title">{game.title}</h3>
                  <p className="game-description">{game.description}</p>
                  
                  <div className="game-meta">
                    <span className="meta-item">
                      <span className="meta-label">Difficulty:</span>
                      <span className={`difficulty ${game.difficulty.toLowerCase()}`}>
                        {game.difficulty}
                      </span>
                    </span>
                    <span className="meta-item">
                      <span className="meta-label">Players:</span>
                      <span className="players">{game.players}</span>
                    </span>
                  </div>
                  
                  <div className="game-features">
                    {game.features.map((feature, index) => (
                      <span key={index} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="play-button">
                  <span>Play Now</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Play Our Games?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🎮</div>
            <h3>Classic Gameplay</h3>
            <p>Authentic game mechanics that stay true to the originals</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✨</div>
            <h3>Modern Design</h3>
            <p>Beautiful graphics and smooth animations for the best experience</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <h3>Responsive</h3>
            <p>Play on any device - desktop, tablet, or mobile</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <h3>Fast Loading</h3>
            <p>Optimized for quick loading and smooth performance</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;