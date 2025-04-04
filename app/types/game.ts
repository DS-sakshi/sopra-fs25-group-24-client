export interface Game {
  id: string;
  numberUsers: string;
  sizeBoard: string;
  timeLimit: number;
  gameStatus: string;
  creator: User;
  currentUsers: User[];
}

export interface User {
  id: string;
  username: string;
}

/* export enum GameStatus {
  RUNNING = "RUNNING",
  WAITING_FOR_USER = "WAITING_FOR_USER",
  ENDED = "ENDED",
}

export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}  */ 

