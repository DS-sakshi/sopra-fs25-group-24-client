import { User } from "./user";
import { WallOrientation } from "./wall";

export enum MoveType {
  MOVE_PAWN = "MOVE_PAWN",
  ADD_WALL = "ADD_WALL",
  // Add other move types as defined in your backend if needed
}

export interface Move {
  startPosition: number[];
  endPosition: number[];
  wallPosition: number[];
  wallOrientation: WallOrientation;
  type: MoveType;
  user: User;
}
