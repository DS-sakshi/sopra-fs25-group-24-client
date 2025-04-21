import { Board } from "./board";
import { Pawn } from "./pawn";
import { Wall, WallOrientation } from "./wall";
import { Position } from "./board";

export enum GameStatus {
  WAITING_FOR_USER = "WAITING_FOR_USER",
  RUNNING = "RUNNING",
  ENDED = "ENDED",
}

export interface Game {
  id: string; // More flexible than number
  numberUsers: string; // Keep as number for calculations
  sizeBoard: number; // Keep as number for board rendering
  timeLimit?: number; // Optional
  creator: { // Minimal user info needed
    id: string;
    username: string;
  };
  currentUsers: Array<{ // Array instead of Set for easier handling
    id: string;
    username: string;
  }>;
  currentTurn: { // Minimal user info for turn display
    id: string;
    username: string;
  } | null; // Nullable for initial state
  //board: Board;
  gameStatus: GameStatus;
}
