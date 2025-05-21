# Quoridor Client - SoPra FS25 Group 24

A modern web client for the classic board game Quoridor, built with Next.js, React, and TypeScript. This client delivers real-time multiplayer gameplay with an intuitive, cosmic-themed interface and responsive design.


## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [High-Level Components](#high-level-components)
- [Project Structure](#project-structure)
- [Launch & Deployment](#launch--deployment)
- [Main User Flows](#main-user-flows)
- [Roadmap](#roadmap)
- [Authors and Acknowledgment](#authors-and-acknowledgment)
- [License](#license)

## Overview

Quoridor is a strategic board game where players race to reach the opposite side of the board while strategically placing walls to block opponents. Our implementation offers:

- Sleek, intuitive cosmic-themed user interface
- Real-time multiplayer experience via WebSockets
- In-game chat with instant messaging
- AI-powered strategy assistance
- Visual game state with interactive board elements
- Comprehensive user profile and statistics tracking
- Integration with our [Quoridor Server](https://github.com/DS-sakshi/sopra-fs25-group-24-server)

## Features

### Core Gameplay
- **Interactive Game Board**: Click-based pawn movement and wall placement with visual guides
- **Real-time Updates**: WebSocket integration for instant game state synchronization
- **Wall Management**: Visual counters showing remaining walls for both players
- **Turn Indicators**: Clear visual signals and animations for active player turns
- **Path Validation**: Server-side validation ensures no player can be completely blocked
- **Win/Loss Detection**: Automatic game completion with victory animations

### User Experience
- **User Authentication**: Secure registration and login with token-based sessions
- **Game Lobbies**: Create and join games with real-time status updates
- **In-Game Chat**: Real-time messaging between players during gameplay
- **AI Move Assistant**: Get personalized move suggestions using OpenAI Assistants API
- **Strategy Chatbot**: Chat for game strategy advice and explanation powered by GROQ API
- **Leaderboard**: Global ranking system with visual podium for top players
- **User Profiles**: Detailed statistics with win/loss tracking and performance metrics

## Technologies

- **Framework**: [Next.js 13+](https://nextjs.org/) - For server-side rendering and routing
- **UI Library**: [React 18](https://reactjs.org/) - For building interactive user interfaces
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript development
- **Styling**: [CSS Modules](https://github.com/css-modules/css-modules) & [Ant Design](https://ant.design/) - For component styling
- **State Management**: React Context API - For global state management
- **Real-time Communication**: WebSockets - For live game updates
- **HTTP Client**: Custom API hooks - For server communication
- **Authentication**: Token-based authentication - For secure user sessions
- **AI Integration**:
    - [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview) – For move suggestions during gameplay
    - [GROQ API](https://groq.com/) – For interactive chatbot guidance and strategic explanations
- **Real-time Chat**: [Firebase Realtime Database](https://firebase.google.com/) - For in-game messaging
- **Deployment**: Vercel - For continuous deployment

## High-Level Components

### 1. [In-Game Chat](app/game-lobby/[id]/chatcomponent.tsx)
**Role**: Real-time player communication
- Uses Firebase Realtime Database for instant messaging
- Provides message notification system for unread messages
- Automatically initializes and cleans up chat data
- Maintains chat history during the game session
- Integrates seamlessly with the game interface

### 2. [Game Board Component](app/game-lobby/[id]/board.tsx)
**Role**: Core game visualization and interaction
- Renders the interactive Quoridor board with pawns and walls
- Implements click-based interactions for intuitive gameplay
- Displays visual indicators for valid moves and game state
- Supports wall placement with directional options (horizontal/vertical)
- Communicates with the server for move validation and processing

### 3. [Game Lobby System](app/game-lobby/page.tsx)
**Role**: Game discovery and management
- Provides interface for creating and joining games
- Displays real-time game status and participant information
- Ensures players can only be in one active game at a time
- Offers quick access to game rules and strategy tips
- Implements automatic polling for game list updates

### 4. [API Service Layer](app/api/apiService.ts)
**Role**: Handles all server communication
- Manages REST API calls to the backend
- Provides robust error handling and response processing
- Handles authentication headers and token management
- Implements WebSocket connection for real-time updates
- Supports various HTTP methods (GET, POST, PUT, DELETE)

### 5. [Authentication System](app/context/AuthContext.tsx)
**Role**: Manages user authentication and session state
- Handles user registration, login, and profile management
- Provides authentication context to secure routes
- Maintains user session with token-based authentication
- Integrates with the API service for server-side validation
- Implements automatic session expiration handling

### 6. [Strategy Chatbot](app/chatbot/page.tsx)
**Role**: Interactive rule explanation and gameplay guidance
- Powered by GROQ API for fast, low-latency conversational AI
- Provides real-time strategy education and game mechanics help

### 7. [Move Suggestion API](app/game-lobby/[id]/suggestion.tsx)
**Role**: Turn-specific move recommendations
- Uses OpenAI Assistants API to generate personalized, situation-aware strategy
- Supports different play styles: offensive, defensive, and safe

## Project Structure

```
app/
├── api/                       # API route handlers and service
│   ├── apiService.ts          # Core API service with error handling
│   ├── groq-chat/             # AI strategy assistant API
│   └── suggest/               # Move suggestion API
├── chatbot/                   # Strategy chatbot implementation
│   └── page.tsx               # Chatbot interface page
├── components/                # Reusable UI components
│   ├── PageLayout.tsx         # Common page layout with navigation
│   └── ProtectedRoute.tsx     # Authentication guard for secure routes
├── context/                   # React Context providers
│   └── AuthContext.tsx        # Authentication state management
├── game-lobby/                # Game lobby and gameplay
│   ├── [id]/                  # Dynamic game instance routes
│   │   ├── board.tsx          # Interactive game board component
│   │   ├── chatcomponent.tsx  # In-game chat functionality
│   │   ├── GameOverScreen.tsx # Game completion screen
│   │   ├── suggestion.tsx     # Move suggestions component
│   │   └── page.tsx           # Game instance container
│   └── page.tsx               # Game lobby listing page
├── game-rules/                # Game rules documentation
│   └── page.tsx               # Rules explanation with illustrations
├── hooks/                     # Custom React hooks
│   ├── useApi.ts              # API communication hook
│   ├── useLocalStorage.tsx    # Local storage management
│   └── useWindowSize.tsx      # Responsive design utilities
├── leaderboard/               # Global leaderboard feature
│   └── page.tsx               # Player rankings and statistics
├── login/                     # Authentication screens
│   └── page.tsx               # Login form with cosmic theme
├── register/                  # User registration
│   └── page.tsx               # Registration form
├── styles/                    # Global and component styles
│   ├── QuoridorBoard.module.css  # Board-specific styles
│   └── globals.css            # Application-wide styles
├── types/                     # TypeScript type definitions
│   ├── game.ts                # Game-related interfaces
│   ├── user.ts                # User-related interfaces
│   ├── move.ts                # Move and action interfaces
│   ├── wall.ts                # Wall placement interfaces
│   └── error.ts               # Error handling types
└── utils/                     # Utility functions
    ├── domain.ts              # API URL configuration
    └── uuid.ts                # UUID generation utilities
```

## Launch & Deployment

### Prerequisites

- Node.js 18.0.0 or higher
- Deno (optional, both runtimes are supported)
- Firebase account (for real-time chat functionality)
- GROQ API key (for AI strategy assistant)
- OpenAI API key (for in-game move suggestions via Assistant API)


### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DS-sakshi/sopra-fs25-group-24-client.git
   cd sopra-fs25-group-24-client
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Or using deno
   source setup.sh
   ```

3. **Configure environment**
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_PROD_API_URL=https://your-server-url.com
   GROQ_API_KEY=your-groq-api-key
   ```

4. **Configure Firebase**
   Update the Firebase configuration in `app/game-lobby/[id]/chatcomponent.tsx` with your Firebase project details.

### Development

Run the development server:
```bash
# Using npm
npm run dev

# Or using deno
deno task dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

Create an optimized build:
```bash
# Using npm
npm run build

# Or using deno
deno task build
```

### Run Production Build

Start the production server:
```bash
# Using npm
npm run start

# Or using deno
deno task start
```

### Code Quality

Format the codebase:
```bash
# Using npm
npm run fmt

# Or using deno
deno task fmt
```

Lint the codebase:
```bash
# Using npm
npm run lint

# Or using deno
deno task lint
```

## Main User Flows

### 1. User Registration and Login
Players begin their journey with our cosmic-themed authentication screens. After registration, they're automatically logged in and directed to the game lobby where they can see online players and available games.

//image

### 2. Game Rules
In the lobby, users can choose to see the game rules or use a chatbot to understand the game. 
//image
//image

### 3. Game Creation and Joining
From the lobby, users can create a new game or join an existing one. The lobby displays real-time game status, shows which games are waiting for players, and prevents users from joining multiple games simultaneously.

//image

### 4. Gameplay Experience
Once in a game, players take turns moving their pawns or placing walls. The interface provides clear visual feedback for whose turn it is, how many walls each player has remaining, and whether moves are valid. Players can communicate through the in-game chat system.

//image

### 5. Strategy Assistance
Players can access the strategy assistant to receive AI-powered move suggestions. The system offers three different strategy types (defensive, offensive, safe) to help players improve their gameplay.

//image

### 6. Game Completion
When a player reaches the opposite side of the board, the game ends with a celebration screen for the winner. Both players' statistics are updated, and they can choose to play again or return to the lobby.

//image

### 7. Leaderboard and Profile
Players can view their game statistics and ranking on the global leaderboard. The top three players are featured on a visual podium, with detailed statistics for all players.

//image

## Roadmap

### High-Priority Features for Contributors

#### 1. Advanced Game Settings
**Description**: Allow players to customize game parameters like board size, time limits, and wall counts.
- **Implementation**: Extend game creation form with configuration options
- **Complexity**: Medium
- **Files to modify**: `app/game-lobby/page.tsx`, game settings components, API integration
- **Benefits**: Provides variety and customization for different player preferences

#### 2. Four-Player Mode
**Description**: Extend the game to support four players on a larger board with modified rules.
- **Implementation**: Enhance board rendering, turn management, and wall placement logic
- **Complexity**: High
- **Files to modify**: `board.tsx`, `page.tsx` in game-lobby/[id], game state management
- **Benefits**: Dramatically expands gameplay possibilities and social interaction

#### 3. Game Replay System
**Description**: Allow players to save and replay past games for analysis.
- **Implementation**: Create a move recording system and playback interface
- **Complexity**: Medium
- **Files to modify**: Create new components for replay functionality
- **Benefits**: Enables learning from past games and sharing memorable matches

## Authors and Acknowledgment

**Group 24 - SoPra FS25**

- **Tobias Lippuner** (22-730-592) - GitHub: [@Tolipp](https://github.com/Tolipp)
  - Authentication system, game flow management, move validation

- **Moana Stadelmann** (19-607-357) - GitHub: [@MoanaStadelmann](https://github.com/MoanaStadelmann)
  - Game board visualization, UI/UX design, player interaction

- **Sakshi Chaudhari** (24-744-716) - GitHub: [@DS-sakshi](https://github.com/DS-sakshi)
  - API integration, WebSocket communication, deployment

- **Dora Silva** (20-934-402) - GitHub: [@DorSilva](https://github.com/DorSilva)
  - Strategy assistant, in-game chat, leaderboard implementation

**Supervisor**: Silvan Schlegel

**Special Thanks**:
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview) for powering move suggestion logic
- [GROQ API](https://groq.com/) for enabling the fast, conversational strategy chatbot
- [Firebase](https://firebase.google.com/) for real-time database functionality
- [Ant Design](https://ant.design/) for UI components
- [Next.js](https://nextjs.org/) team for the excellent framework

## License

MIT License

Copyright (c) [2025] [SoPra FS25 Group 24 - University of Zürich]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

For more information about the server-side implementation, see the [server repository](https://github.com/DS-sakshi/sopra-fs25-group-24-server).
