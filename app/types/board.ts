import { Pawn } from "./pawn";
import { Wall } from "./wall";

export interface Board {
  id: string;
  sizeBoard: string;
  pawns: Pawn[];
  walls: Wall[];
}
