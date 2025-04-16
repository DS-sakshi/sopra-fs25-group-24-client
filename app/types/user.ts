// This file defines the User interface for TypeScript.
export interface User {
  id: string;
  name: string;
  username: string;
  token: string;
  status: string;
  creationDate: string | Date;
  birthday?: string | Date | null;
  password?: string;
  totalGamesWon: number; //mathematical operations being performed at backend
  totalGamesLost: number;
  totalGamesPlayed: number;
}
