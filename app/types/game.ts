export interface Game {
    id: string;
    name: string;
    status: string;
    players: string[];
    creatorId: string;
    createdAt: string;
  }

  export interface GameResponse {
    id: string;
  }