import { User } from './user'; // Adjust the path as needed
export enum MoveType {
    NORMAL = "NORMAL",
    JUMP = "JUMP",
    // Add other move types that exist in your backend MoveType enum
  }
  

  export interface Move {
    startPosition: number[];
    endPosition: number[];
    user: User;
    type: MoveType;
  }