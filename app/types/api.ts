// Enums
export enum UserStatus {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE"
  }
  
  export enum GameStatus {
    WAITING_FOR_USER = "WAITING_FOR_USER",
    RUNNING = "RUNNING",
    ENDED = "ENDED"
  }
  
  export enum MoveType {
    MOVE_PAWN = "MOVE_PAWN",
    ADD_WALL = "ADD_WALL"
  }
  
  export enum WallOrientation {
    HORIZONTAL = "HORIZONTAL",
    VERTICAL = "VERTICAL"
  }
  
  // User related interfaces
  export interface User {
    id: number;
  status: UserStatus;
  creationDate: string;
  name: string;
  username: string;
  token: string;
  birthday?: string | Date | null; // Allow Date/null
  password?: string;
  totalGamesWon: number;
  totalGamesLost: number;
  totalGamesPlayed: number;
  }
  
  export interface UserCreateDTO {
    username: string;
    password: string;
    name: string;
  }
  
  export interface UserGetDTO {
    id: number;
    name: string;
    username: string;
    status: UserStatus;
    token: string;
    creationDate: string;
    birthday?: string;
  }
  
  // Game related interfaces
  export interface Game {
    id: string;
    creator: {
      id: string;
      username: string;
    };
    currentTurn?: {
      id: string;
      username: string;
    };
    gameStatus: GameStatus;
    sizeBoard: number;
    board: Board;
    currentUsers: Array<{
      id: string;
      username: string;
    }>;
  }
  
  export interface GameCreateDTO {
    creator: UserGetDTO;
    sizeBoard: number;
    timeLimit: number;
  }
  
  export interface GameGetDTO {
    id: number;
    numberUsers: number;
    sizeBoard: number;
    timeLimit: number;
    gameStatus: GameStatus;
    creator: User;
    currentUsers: User[];
  }
  
  // Board related interfaces
  export interface Board {
    pawns: Array<{
      id: number;
      userId: string;
      r: number;
      c: number;
    }>;
    walls: Array<{
      r: number;
      c: number;
      orientation: 'HORIZONTAL' | 'VERTICAL';
    }>;
  }
  
  // Pawn related interfaces
  export interface Pawn {
    id: number;
    r: number;
    c: number;
    color: string;
    boardId: string;
    userId: string;
  }
  
  // Wall related interfaces
  export interface Wall {
    id: number;
    r: number;
    c: number;
    color: string;
    orientation: WallOrientation;
    boardId: number;
    userId: number;
    
    
  }
  
  // Move related interfaces
  export interface MovePostDTO {
    startPosition: number[];
    endPosition: number[];
    user: UserGetDTO;
    type: MoveType;
    wallPosition?: number[];
    wallOrientation?: WallOrientation;
  }
  
  // Error interface
  export interface ApplicationError extends Error {
    info?: string;
    status?: number;
  }
  
  // Response interfaces
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
  }