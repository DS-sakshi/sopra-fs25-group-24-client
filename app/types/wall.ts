export enum WallOrientation {
  HORIZONTAL = "HORIZONTAL",
  VERTICAL = "VERTICAL",
}

export interface Wall {
  id: number;
  color: string;
  r: number; // row position
  c: number; // column position
  orientation: WallOrientation;
  boardId: number; // Foreign key reference
  userId: number; // Foreign key reference
}

// For creating new walls
export interface WallCreateDTO {
  color: string;
  r: number;
  c: number;
  orientation: WallOrientation;
  boardId: number;
  userId: number;
}

// For API responses that might include related entities
export interface WallWithRelations extends Wall {
  board?: {
    id: number;
    sizeBoard: number;
  };
  user?: {
    id: number;
    username: string;
  };
}
