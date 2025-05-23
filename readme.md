# The Bastion - TTRPG Management System

<div align="center">

![The Bastion Logo](assets/images/logo.png)

**Ultimate base management system for celestial fortress TTRPG campaigns**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue)](https://yourusername.github.io/the-bastion/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

## 🏛️ Overview

The Bastion is a comprehensive web-based management system for TTRPG campaigns centered around managing a celestial fortress. Features include resource management, NPC tracking, mission creation, section upgrades, and dual GM/Player interfaces.

## ✨ Features

### 🎮 Core Gameplay
- **Dual Interface**: Separate GM and Player dashboards with role-based permissions
- **Resource Management**: Track Celestial Power, Silver, Runic Shards, Divine Essence, and Tech Expertise
- **Section System**: Six fortress sections with damage states and upgrade trees
- **Mission System**: Create, assign, and resolve missions with automatic rewards
- **NPC Management**: Full character sheets with stats, equipment, and deployment tracking

### 🔧 Technical Features
- **Real-time Updates**: 30-second timer updates and live state synchronization
- **Persistent Storage**: Auto-save with localStorage backup and JSON export/import
- **Responsive Design**: Mobile-friendly with progressive enhancement
- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Modern web browser with ES6 module support
- Node.js 16+ (for development)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/the-bastion.git
cd the-bastion

# Install dependencies (for development)
npm install

# Start development server
npm run dev
```

### Production Deployment

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
📁 the-bastion/
├── 📄 index.html                    # Main entry point
├── 📁 css/                          # Stylesheets
│   ├── 📄 variables.css             # CSS custom properties
│   ├── 📄 main.css                  # Base styles
│   ├── 📄 components.css            # Component styles
│   ├── 📄 dashboard.css             # Dashboard layouts
│   ├── 📄 sections.css              # Section upgrade trees
│   └── 📄 responsive.css            # Media queries
├── 📁 js/                           # JavaScript modules
│   ├── 📄 main.js                   # App initialization
│   ├── 📄 auth.js                   # Authentication
│   ├── 📄 gameState.js              # State management
│   ├── 📄 resources.js              # Resource handling
│   ├── 📄 missions.js               # Mission system
│   ├── 📄 npcs.js                   # NPC management
│   ├── 📄 sections.js               # Section upgrades
│   └── 📄 ui.js                     # UI utilities
├── 📁 data/                         # Game configuration
│   ├── 📄 sections.json             # Section definitions
│   ├── 📄 missions.json             # Default missions
│   └── 📄 config.json               # Game settings
└── 📁 components/                   # HTML templates
    ├── 📄 login.html                # Login form
    ├── 📄 gm-dashboard.html         # GM interface
    └── 📄 player-dashboard.html     # Player interface
```

## 🎯 Benefits of Modular Architecture

### 🔧 Development Benefits
- **Easier Debugging**: Isolated modules make finding issues simpler
- **Better Organization**: Clear separation of concerns
- **Code Reusability**: Modular components can be reused and extended
- **Team Collaboration**: Multiple developers can work on different modules
- **Version Control**: Smaller files make diffs and merges cleaner

### ⚡ Performance Benefits
- **Faster Loading**: Only load what's needed when needed
- **Better Caching**: Individual modules can be cached separately
- **Tree Shaking**: Unused code can be eliminated in builds
- **Code Splitting**: Modules can be loaded on demand

### 🚀 Maintainability Benefits
- **Easier Updates**: Changes to one module don't affect others
- **Testing**: Individual modules can be unit tested
- **Documentation**: Each module can have focused documentation
- **Refactoring**: Modules can be refactored independently

## 🎮 Usage

### Authentication
```javascript
// Default credentials
Player: username "jon" / code "bastion2024"
GM: username "gm" / code "gmbastion2024"
```

### GM Dashboard
- **Resource Management**: Update global resources and track capacity
- **NPC Management**: Create, edit, and deploy NPCs with full stat tracking
- **Mission Creation**: Advanced mission builder with custom rewards
- **Section Control**: Manage cleaning, repairs, and damage events
- **System Administration**: Save/load game states, export data

### Player Dashboard
- **Resource Tracking**: View current resources and capacity
- **Mission Assignment**: Take missions solo or assign to NPCs
- **Section Cleaning**: Initiate cleaning operations with timer tracking
- **NPC Overview**: View available team members and their stats

### Upgrade System
- **Six Sections**: Luminarium, Sanctum, Wards, Throne Room, Gateway, Fountain
- **Three Paths**: Research, Offensive, Defensive upgrades per section
- **Resource Costs**: Celestial Power, Silver, Runic Shards, Divine Essence, Tech Expertise
- **Prerequisites**: Sections must be cleaned and repaired before upgrades

## 🔧 Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run tests
npm run deploy       # Deploy to GitHub Pages
```

### Environment Setup
1. Install Node.js 16+
2. Clone repository
3. Run `npm install`
4. Start development with `npm run dev`
5. Open `http://localhost:3000`

### Code Style
- ES6+ modules with clean imports/exports
- Async/await for promises
- CSS custom properties for theming
- Semantic HTML with ARIA labels
- Mobile-first responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add JSDoc comments for new functions
- Test across different browsers and screen sizes
- Update documentation for new features
- Keep modules focused and single-purpose

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- The TTRPG community for inspiration
- Contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/the-bastion/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/the-bastion/discussions)
- **Email**: your.email@example.com

---

<div align="center">
Made with ⚡ for epic celestial fortress campaigns
</div>
