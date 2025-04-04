import { Pawn } from './pawn';

export interface Board {
  id: number;
  sizeBoard: number;
  pawns: Pawn[];
}