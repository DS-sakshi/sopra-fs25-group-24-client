import { User } from "./user";
import { Board } from "./board";

export enum GameStatus {
  WAITING = "WAITING",
  ONGOING = "ONGOING",
  FINISHED = "FINISHED",
}

export interface Game {
  id: string;
  numberUsers: string;
  sizeBoard: string;
  timeLimit: string;
  creator: User;
  currentUsers: User[];
  currentTurn: User;
  board: Board;
  gameStatus: GameStatus;
}
