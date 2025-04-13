export interface Pawn {
  id: string;
  color: string;
  r: string; // row position
  c: string; // column position
  boardId: string; // Foreign key reference
  userId: string; // Foreign key reference
}
