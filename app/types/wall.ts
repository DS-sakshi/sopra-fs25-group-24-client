export enum WallOrientation {
  HORIZONTAL = "HORIZONTAL",
  VERTICAL = "VERTICAL",
}

export interface Wall {
  id: string;
  color: string;
  r: string; // row position
  c: string; // column position
  orientation: WallOrientation;
  boardId: string; // Foreign key reference
  userId: string; // Foreign key reference
}
