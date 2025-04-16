import { User } from "./user";

export type MoveType = "MOVE_PAWN" | "ADD_WALL";
export type WallOrientation = "HORIZONTAL" | "VERTICAL";
// Enum to match backend MoveType
//needs to be updated to ADD_WALL and ADD_PAWN ???

export interface MovePostDTO {
  startPosition?: number[];
  endPosition?: number[];
  wallPosition?: number[];
  wallOrientation?: WallOrientation;
  user: {
    id: number;
    username: string;
  };
  type: MoveType;
}
