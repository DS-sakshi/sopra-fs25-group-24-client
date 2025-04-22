import { User } from "./user";

//export type MoveType = "MOVE_PAWN" | "ADD_WALL";
export type WallOrientation = "HORIZONTAL" | "VERTICAL";
// Enum to match backend MoveType
export enum MoveType {
  MOVE_PAWN = "MOVE_PAWN",
  ADD_WALL = "ADD_WALL"
}


export interface MovePostDTO {
  startPosition?: number[];
  endPosition?: [number, number];
  wallPosition?: [number, number];
  wallOrientation?: WallOrientation | null;
  user: {
    id: number;
    //username: string;
  };
  type: MoveType;
}
