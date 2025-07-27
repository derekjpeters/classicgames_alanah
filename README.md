# 🎮 Classic Games Collection

A modern recreation of timeless arcade classics built with React. Experience the nostalgia of Snake, Pong, and Tic Tac Toe with contemporary design and smooth gameplay.

## 🌟 Features

### 🎯 **Modern Game Library**
- **Snake** - Guide the snake to eat food and grow longer while avoiding walls
- **Pong** - Classic paddle game with 4 difficulty levels, serve button, and AI opponent
- **Tic Tac Toe** - Strategic tournament-style gameplay with custom player names and best-of-5 format

### ✨ **Contemporary Design**
- **Glassmorphism UI** with backdrop blur effects
- **Responsive design** that works on all devices
- **Smooth animations** and hover effects
- **Modern color palette** with gradient accents
- **Accessibility support** for reduced motion preferences

### 🎮 **Enhanced Gameplay**
- **Score tracking** across games and sessions
- **Game state management** (start, pause, reset functionality)
- **Visual feedback** with winning animations
- **Intuitive controls** optimized for both desktop and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/derekjpeters/classicgames_alanah.git
   cd classicgames_alanah
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

### Building for Production
```bash
npm run build
```

## 🎮 How to Play

### 🐍 Snake
1. Click "Start Game" to begin
2. Use arrow keys to control the snake
3. Eat the red food to grow and increase your score
4. Avoid hitting the walls or yourself
5. Click "Reset Game" to start over

### 🏓 Pong
1. Choose your difficulty level (Easy, Medium, Hard, or Nuclear)
2. Click "Start Game" to begin
3. Move your mouse to control the left paddle
4. Click "Serve Ball" to start each point
5. Try to score points by getting the ball past the AI
6. First player to 5 points wins
7. Press spacebar to pause, or use the pause button

### ⭕ Tic Tac Toe
1. Set custom player names (optional)
2. Player X starts first
3. Click on any empty square to place your mark
4. Get three in a row (horizontally, vertically, or diagonally) to win
5. First player to win 3 games wins the match
6. Use "Next Game" for a fresh game or "Reset Match" to start over

## 🛠️ Built With

- **React** - Frontend framework
- **React Router** - Navigation and routing
- **CSS3** - Modern styling with custom properties
- **HTML5 Canvas** - Game rendering for Snake and Pong
- **JavaScript ES6+** - Modern JavaScript features

## 🎯 Game Features

### 🐍 Snake
- **Classic Gameplay** - Eat food to grow, avoid walls and yourself
- **Modern Graphics** - Rounded snake with gradient colors and animated eyes
- **Score System** - Track your high scores
- **Responsive Controls** - Arrow keys for smooth movement
- **Game States** - Start screen, pause functionality, and game over

### 🏓 Pong
- **Four Difficulty Levels** - Easy, Medium, Hard, and Nuclear modes
- **Serve Button** - Manual control over when each point begins
- **AI Opponent** - Challenging computer player with difficulty-based behavior
- **Score Tracking** - First to 5 points wins
- **Mouse Controls** - Move your paddle with mouse movement
- **Pause Feature** - Press spacebar to pause/resume
- **Modern Graphics** - Gradient paddles and glowing ball effects

### ⭕ Tic Tac Toe
- **Custom Player Names** - Personalize your gaming experience
- **Best of 5 Tournament** - First to win 3 games wins the match
- **Two Player Mode** - Take turns placing X's and O's
- **Win Detection** - Automatic winner detection with animations
- **Match Tracking** - Track game wins in tournament format
- **Visual Feedback** - Winning line highlighting and celebrations
- **Responsive Grid** - Works perfectly on mobile devices

## 📱 Mobile Support

The application is fully responsive and optimized for:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)  
- **Mobile** (320px - 767px)

### Mobile Features
- Touch-friendly controls
- Optimized game sizes
- Responsive navigation
- Reduced motion support

## 🎨 Design System

### Color Palette
- **Primary**: Linear gradient from #667eea to #764ba2
- **Accent**: #00f5ff (Cyan)
- **Secondary**: #ff6b6b (Coral)
- **Success**: #4ecdc4 (Teal)
- **Warning**: #ffc107 (Amber)

### Typography
- **Primary Font**: Inter, system fonts
- **Weight Range**: 300 (Light) to 800 (Extra Bold)
- **Responsive Sizing**: clamp() functions for fluid typography

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── Home.js          # Landing page component
│   └── Home.css         # Landing page styles
├── games/
│   ├── Snake.js         # Snake game logic
│   ├── Snake.css        # Snake game styles
│   ├── Pong.js          # Pong game logic
│   ├── Pong.css         # Pong game styles
│   ├── TicTacToe.js     # Tic Tac Toe logic
│   └── TicTacToe.css    # Tic Tac Toe styles
├── App.js               # Main app component
├── App.css              # Global styles and navigation
└── index.js             # App entry point
```

### Key Technologies
- **React Hooks** - useState, useEffect, useCallback, useRef
- **React Router** - Browser routing with useLocation
- **CSS Custom Properties** - Consistent theming
- **Canvas API** - Game rendering and animations
- **CSS Grid & Flexbox** - Modern layout techniques

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Follow the existing code style and structure
2. Add comments for complex game logic
3. Test on multiple screen sizes
4. Ensure accessibility compliance
5. Update documentation as needed

## 👨‍💻 Author

**Derek Peters**
- GitHub: [@derekjpeters](https://github.com/derekjpeters)

## 📄 License

This project is licensed under the MIT License.

## 📈 Roadmap

Future enhancements planned:
- [ ] High score persistence with localStorage
- [ ] Sound effects and background music
- [ ] Additional games (Tetris, Pac-Man style)
- [ ] Multiplayer support
- [ ] Progressive Web App features
- [ ] Leaderboards and achievements

---

<p align="center">
  Made with ❤️ and React
</p>
