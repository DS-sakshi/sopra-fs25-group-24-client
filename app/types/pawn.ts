export interface Pawn {
  id: string;
  color: string;
  r: number; // row position
  c: number; // column position
  boardId: string; // Foreign key reference
  userId: string; // Foreign key reference
}
