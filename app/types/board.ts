import { Pawn } from "./pawn";
import { Wall } from "./wall";

export interface Position {
  r: number;
  c: number;
}
export interface Board {
  id: string;
  sizeBoard: number;
  pawns: Pawn[];
  walls: Wall[];
}
