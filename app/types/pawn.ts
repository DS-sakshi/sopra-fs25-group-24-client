export interface Pawn {
    id: number;
    color: string;
    r: number;          // row position
    c: number;          // column position
    boardId: number;    // Foreign key reference
    userId: number;     // Foreign key reference
  }