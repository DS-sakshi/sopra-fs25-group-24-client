// This file defines the Wall interface, which represents a wall in the game.
// Simple type for orientation without enum constraint
export enum WallOrientation {
  HORIZONTAL = "HORIZONTAL",
  VERTICAL = "VERTICAL",
}

export interface Wall {
  id: string;
  color: string;
  r: number; // row position
  c: number; // column position
  orientation: WallOrientation;
  boardId: string; // Foreign key reference
  userId: string; // Foreign key reference
}
