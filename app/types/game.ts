export interface User {
  id: string;
  username: string;
  name: string;
  status: string;
  token: string;
}

export interface Pawn {
  id: number;
  userId: number;
  r: number;
  c: number;
  color?: string;
}

export interface Wall {
  r: number;
  c: number;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  userId?: number;
}

export interface Board {
  pawns: Pawn[];
  walls?: Wall[];
}

export interface Game {
  id: string;
  creator: User;
  currentTurn?: User;
  gameStatus: "WAITING_FOR_USER" | "RUNNING" | "ENDED";
  sizeBoard: number;
  board: Board;
  currentUsers: User[];
  winner?: string;
}

export interface GameData {
  id: string;
  creator: {
    id: string;
    username: string;
  };
  currentTurn?: {
    id: string;
    username: string;
  };
  gameStatus: "WAITING_FOR_USER" | "RUNNING" | "ENDED";
  sizeBoard: number;
  board: Board;
  currentUsers: Array<{
    id: string;
    username: string;
  }>;
  winner?: string;
}