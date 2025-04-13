export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  // Add other statuses as defined in your backend if needed
}

export interface User {
  id: string;
  name: string;
  username: string;
  token: string;
  status: string;
  creationDate: string | Date;
  birthday?: string | Date | null;
  password?: string;
  totalGamesWon: string;
  totalGamesLost: string;
  totalGamesPlayed: string;
}
