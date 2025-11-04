# Cube Jump! 🎮

A challenging 2D platformer game built with vanilla JavaScript and HTML5 Canvas. Guide a pink cube through increasingly difficult levels filled with various obstacles, platforms, and hazards.

![Game Preview](https://img.shields.io/badge/status-playable-brightgreen)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

### Game Modes
- **Story Mode**: 21 handcrafted levels across 3 unique worlds
- **Speedrun Mode**: Time attack challenges for World 1 and World 2
- **Ironman Mode**: Complete 18 levels without dying once
- **Level Editor**: Create and test your own custom levels

### Gameplay Mechanics
- **Precise Physics**: Custom gravity and collision system for tight controls
- **Double Jump**: Classic platformer mechanic for advanced movement
- **Star Ratings**: Earn 1-3 stars based on completion time
- **Multiple Platform Types**:
  - Standard platforms
  - Crumbling platforms (break after 2 touches)
  - Glue platforms (stick from any direction, disable double jump)
  - Blinking platforms (toggle visibility with warning flash)

### Hazards & Obstacles
- **Static Spikes**: Instant death on contact
- **Moving Spike Balls**: Rotating circular hazards
- **Turrets**: Directional shooting enemies with charging animation
- **Black Holes**: Gravitational pull with point-of-no-return physics

### Visual Effects
- Particle systems for death, victory, and movement
- Player squash/stretch animations
- Pixel-art aesthetic with crisp rendering
- World-specific color themes (Pink, Blue, Yellow)

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6 module support (Chrome, Firefox, Safari, Edge)
- Local web server for development (due to CORS restrictions)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jump!
```

2. Serve the project locally using any static file server:

**Option 1: Python**
```bash
python -m http.server 8000
```

**Option 2: Node.js (http-server)**
```bash
npx http-server -p 8000
```

**Option 3: VS Code Live Server**
- Install Live Server extension
- Right-click `index.html` > "Open with Live Server"

3. Open your browser and navigate to:
```
http://localhost:8000
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `←` / `A` | Move Left |
| `→` / `D` | Move Right |
| `Space` | Jump (press twice for double jump) |
| `ESC` | Return to menu (in-game) |

## 🏗️ Project Structure

```
jump!/
├── index.html              # Entry point
├── main.js                 # Bootstrap
├── styles/
│   └── main.css           # All styles
├── src/
│   ├── main.js            # Game initialization
│   ├── engine/            # Core game systems
│   │   ├── Game.js        # Game loop & state management
│   │   ├── Physics.js     # Collision detection
│   │   └── Renderer.js    # Canvas rendering
│   ├── entities/          # Game objects
│   │   ├── Player.js
│   │   ├── Platform.js
│   │   ├── CrumblingPlatform.js
│   │   ├── GluePlatform.js
│   │   ├── BlinkingPlatform.js
│   │   └── Turret.js
│   ├── levels/            # Level definitions
│   │   ├── Level1-9.js
│   │   ├── World2Level1-9.js
│   │   └── World3Level1-3.js
│   ├── effects/           # Visual effects
│   │   ├── ParticleSystem.js
│   │   └── GrassSystem.js
│   ├── ui/                # User interface
│   │   ├── VictoryScreen.js
│   │   ├── LevelSelect.js
│   │   └── ChallengesMenu.js
│   ├── editor/            # Level creation
│   │   └── LevelEditor.js
│   └── speedrun/          # Leaderboards
│       └── SpeedrunManager.js
└── firebase.json          # Firebase configuration
```

## 🎨 Technical Details

### Architecture
- **Pattern**: Entity-Component pattern with state machine
- **Rendering**: HTML5 Canvas 2D API with pixel-perfect collision detection
- **Physics**: Custom AABB collision with fixed timestep game loop
- **State Management**: Finite state machine (menu, playing, dead, won, editor)

### Technologies
- Vanilla JavaScript (ES6+ modules)
- HTML5 Canvas
- CSS3
- Firebase Realtime Database (leaderboards)
- LocalStorage (save data)

### Performance Considerations
- Fixed timestep game loop (60 FPS target)
- Delta time for smooth animations
- Efficient AABB collision detection
- Particle system with lifecycle management

## 🏆 Game Progression

### Worlds
1. **World 1**: 9 levels - Introduction to core mechanics (Pink theme)
2. **World 2**: 9 levels - Advanced challenges (Blue theme)
3. **World 3**: 3 levels - Expert difficulty (Yellow theme)

### Star System
- ⭐ Bronze: Complete the level
- ⭐⭐ Silver: Complete under time threshold
- ⭐⭐⭐ Gold: Master time completion

Stars are saved locally and persist between sessions.

## 🎯 Development Roadmap

### In Progress
- [ ] Refactor Game.js into smaller modules
- [ ] Extract magic numbers to Constants.js
- [ ] Add automated tests
- [ ] Set up build pipeline
- [ ] Implement proper error handling UI

### Planned Features
- [ ] Sound effects and background music
- [ ] Pause functionality
- [ ] Settings menu (volume, controls)
- [ ] Tutorial/onboarding
- [ ] Mobile touch controls
- [ ] Accessibility improvements

## 🔧 Level Editor

Access the level editor from the main menu to create custom levels:

1. **Tools**: Select platform types, hazards, spawn point, and goal
2. **Properties**: Adjust width, height, speed, direction
3. **Testing**: Test your level in real-time
4. **Save/Load**: Store levels in localStorage

## 🌐 Firebase Integration

The game uses Firebase Realtime Database for speedrun leaderboards:

- **World 1 Speedrun**: Top 10 times for 9-level run
- **World 2 Speedrun**: Top 10 times for 9-level run
- **Ironman Mode**: Top 10 times for 18-level deathless run

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for deployment instructions.

## 🐛 Known Issues

- No pause functionality during gameplay
- Firebase API key exposed (public key, read/write open)
- Large Game.js file needs refactoring
- No mobile/touch support
- No sound effects

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow existing code style
- Write unit tests for new features
- Update documentation as needed
- Test across multiple browsers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Created as a passion project to explore game development with vanilla JavaScript.

## 🙏 Acknowledgments

- Press Start 2P font by CodeMan38
- Firebase for backend infrastructure
- HTML5 Canvas community for resources and inspiration

---

**Enjoy the game! Can you conquer all 21 levels?** 🎮
