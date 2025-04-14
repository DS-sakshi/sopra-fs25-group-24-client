"use client";
import React, { useState, useEffect } from 'react';
import { Alert, Button, message, Tag } from 'antd';
import {
  BorderHorizontalOutlined,
  BorderVerticleOutlined,
} from '@ant-design/icons';
import {
  Game,
  User,
  Pawn,
  Wall,
  MoveType,
  WallOrientation,
  MovePostDTO,
  GameStatus,
  UserStatus
} from '@/types/api';

/**
 * API service signature
 */
interface ApiService {
  post: (url: string, data: any) => Promise<any>;
  get: (url: string) => Promise<any>;
}

interface QuoridorBoardProps {
  game: Game;             // Entire game data from the backend
  currentUser: User;      // The currently logged-in user
  gameId: string;         // ID of the game
  apiService: ApiService; // Service for calling your backend
  onUpdateGame: (game: Game) => void; // Callback to refresh parent component
}

const QuoridorBoard: React.FC<QuoridorBoardProps> = ({
  game,
  currentUser,
  gameId,
  apiService,
  onUpdateGame
}) => {
  // Changed state key type from number to string for consistency
  const [remainingWalls, setRemainingWalls] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [selectedPawn, setSelectedPawn] = useState<Pawn | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<number[][]>([]);
  const [wallPlacementMode, setWallPlacementMode] = useState(false);
  const [wallOrientation, setWallOrientation] =
    useState<WallOrientation>(WallOrientation.HORIZONTAL);

  const cellSize = 40;
  const wallThickness = 4;
  const boardSize = game?.sizeBoard || 9;

  // Update remaining walls and recalc moves when game data changes
  useEffect(() => {
    

    if (isCurrentUserTurn()) {
      calculatePossibleMoves();
    } else {
      setPossibleMoves([]);
      setSelectedPawn(null);
      setWallPlacementMode(false);
    }
  }, [game]);

  // Check if it's the current user's turn.
  const isCurrentUserTurn = (): boolean => {
    return (
      !!currentUser &&
      game.gameStatus === GameStatus.RUNNING &&
      game.currentTurn?.id === currentUser.id.toString()
    );
  };

  /**
   * Calculate possible moves following basic Quoridor rules.
   */
  const calculatePossibleMoves = () => {
    if (!currentUser || !game?.board?.pawns) return;

    // Find the current user's pawn
    const pawn = game.board.pawns.find(
      (p) => p.userId === currentUser.id.toString()
    );
    if (!pawn) return;

    const directions = [
      [-1, 0], // up
      [0, 1],  // right
      [1, 0],  // down
      [0, -1]  // left
    ];
    const validPositions: number[][] = [];

    // Helper to check if a pawn occupies a given cell
    const occupant = (r: number, c: number) =>
      game.board.pawns.find((pp) => pp.r === r && pp.c === c);

    // Check each direction
    for (const [dr, dc] of directions) {
      const newR = pawn.r + dr;
      const newC = pawn.c + dc;

      // Check board bounds
      if (newR >= 0 && newR < boardSize && newC >= 0 && newC < boardSize) {
        // Ensure no wall blocking the move
        if (!isWallBlocking(pawn.r, pawn.c, newR, newC)) {
          const occupantPawn = occupant(newR, newC);

          if (!occupantPawn) {
            // The cell is free
            validPositions.push([newR, newC]);
          } else {
            // There's a pawn adjacent; attempt a jump move
            const jumpR = newR + dr;
            const jumpC = newC + dc;

            if (
              jumpR >= 0 &&
              jumpR < boardSize &&
              jumpC >= 0 &&
              jumpC < boardSize &&
              !isWallBlocking(newR, newC, jumpR, jumpC) &&
              !occupant(jumpR, jumpC)
            ) {
              validPositions.push([jumpR, jumpC]);
            } else {
              // Try diagonal jumps when direct jump is blocked
              const diagMoves = getDiagonalJumps(pawn.r, pawn.c, newR, newC);
              diagMoves.forEach((dm) => {
                validPositions.push(dm);
              });
            }
          }
        }
      }
    }

    setPossibleMoves(validPositions);
  };

  /**
   * Compute diagonal jump positions if a straight jump is blocked.
   */
  const getDiagonalJumps = (
    oldR: number,
    oldC: number,
    occupantR: number,
    occupantC: number
  ): number[][] => {
    const possibleDiags: number[][] = [];
    const rowDelta = occupantR - oldR;
    const colDelta = occupantC - oldC;

    if (colDelta === 0) {
      for (const side of [-1, 1]) {
        const diagR = occupantR;
        const diagC = occupantC + side;

        if (
          diagR >= 0 &&
          diagR < boardSize &&
          diagC >= 0 &&
          diagC < boardSize &&
          !isWallBlocking(occupantR, occupantC, diagR, diagC) &&
          !game.board.pawns.find((p) => p.r === diagR && p.c === diagC)
        ) {
          possibleDiags.push([diagR, diagC]);
        }
      }
    }

    if (rowDelta === 0) {
      for (const side of [-1, 1]) {
        const diagR = occupantR + side;
        const diagC = occupantC;

        if (
          diagR >= 0 &&
          diagR < boardSize &&
          diagC >= 0 &&
          diagC < boardSize &&
          !isWallBlocking(occupantR, occupantC, diagR, diagC) &&
          !game.board.pawns.find((p) => p.r === diagR && p.c === diagC)
        ) {
          possibleDiags.push([diagR, diagC]);
        }
      }
    }

    return possibleDiags;
  };

  /**
   * Check if a wall blocks movement between two cells.
   */
  const isWallBlocking = (
    r1: number,
    c1: number,
    r2: number,
    c2: number
  ): boolean => {
    const walls = game.board?.walls || [];
    const isHorizontalMove = r1 === r2;

    if (isHorizontalMove) {
      const minC = Math.min(c1, c2);
      return walls.some(
        (wall) =>
          wall.orientation === WallOrientation.VERTICAL &&
          wall.r <= r1 &&
          r1 < wall.r + 2 && // wall covers two rows
          wall.c === minC
      );
    } else {
      const minR = Math.min(r1, r2);
      return walls.some(
        (wall) =>
          wall.orientation === WallOrientation.HORIZONTAL &&
          wall.c <= c1 &&
          c1 < wall.c + 2 &&
          wall.r === minR
      );
    }
  };

  // Pawn selection logic
  const handlePawnSelection = (pawn: {
    id: number;
    userId: string;
    r: number;
    c: number;
  }): void => {
    if (!isCurrentUserTurn()) return;

    // Only allow selecting your own pawn
    if (pawn.userId !== currentUser.id.toString()) {
      message.error("You can only select your own pawn");
      return;
    }

    if (wallPlacementMode) {
      setWallPlacementMode(false);
      message.info("Wall placement canceled");
      return;
    }
    const completePawn: Pawn = {
        id: pawn.id,
        userId: pawn.userId,
        r: pawn.r,
        c: pawn.c,
        color: pawn.userId === game.creator.id ? 'blue' : 'red',
        boardId: game.id
      };

    setSelectedPawn(pawn as Pawn);
    calculatePossibleMoves();
  };

  // Handle clicking on a cell to move the pawn
  const handleCellClick = async (row: number, col: number) => {
    if (!isCurrentUserTurn() || wallPlacementMode) return;

    const myPawn = game.board?.pawns.find((p) => p.userId === currentUser.id.toString());
    if (!myPawn) return;

    const isValidMove = possibleMoves.some(
      ([rr, cc]) => rr === row && cc === col
    );
    if (!isValidMove) {
      message.error("Invalid move");
      return;
    }

    try {
      setLoading(true);

      const moveDTO: MovePostDTO = {
        startPosition: [myPawn.r, myPawn.c],
        endPosition: [row, col],
        user: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          status: currentUser.status,
          token: currentUser.token,
          creationDate: String(currentUser.creationDate)
        },
        type: MoveType.MOVE_PAWN
      };

      await apiService.post(`/game-lobby/${gameId}/move`, moveDTO);
      const updatedGame = await apiService.get(`/game-lobby/${gameId}`);
      onUpdateGame(updatedGame);

      setSelectedPawn(null);
      setPossibleMoves([]);
      message.success("Move completed");
    } catch (err) {
      console.error(err);
      message.error("Failed to make move");
    } finally {
      setLoading(false);
    }
  };

  // Toggle wall placement mode
  const toggleWallPlacement = () => {
    if (!isCurrentUserTurn()) {
      message.error("Not your turn");
      return;
    }

    setWallPlacementMode(!wallPlacementMode);
    setSelectedPawn(null);
    setPossibleMoves([]);

    if (!wallPlacementMode) {
      message.info(
        `Wall placement mode: ${wallOrientation}. Click between cells to place a wall.`
      );
    } else {
      message.info("Wall placement canceled");
    }
  };

  // Toggle between horizontal and vertical wall orientation
  const toggleWallOrientation = () => {
    const newOrientation =
      wallOrientation === WallOrientation.HORIZONTAL
        ? WallOrientation.VERTICAL
        : WallOrientation.HORIZONTAL;
    setWallOrientation(newOrientation);
    message.info(`Wall orientation set to ${newOrientation}`);
  };

  // Place a wall after validating its placement
  const handleWallPlacement = async (
    row: number,
    col: number,
    orientation: WallOrientation
  ) => {
    if (!isCurrentUserTurn() || !wallPlacementMode) return;

    if (!isWallPlacementValid(row, col, orientation)) {
      message.error("Invalid wall placement");
      return;
    }

    try {
      setLoading(true);

      const wallDTO: MovePostDTO = {
        startPosition: [0, 0],
        endPosition: [0, 0],
        user: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          status: currentUser.status,
          token: currentUser.token,
          creationDate: String(currentUser.creationDate)
        },
        type: MoveType.ADD_WALL,
        wallPosition: [row, col],
        wallOrientation: orientation
      };

      await apiService.post(`/game-lobby/${gameId}/move`, wallDTO);
      const updatedGame = await apiService.get(`/game-lobby/${gameId}`);
      onUpdateGame(updatedGame);

      setWallPlacementMode(false);
      message.success("Wall placed successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to place wall");
    } finally {
      setLoading(false);
    }
  };

  // Validate wall placement to avoid overlap and out-of-bound placements.
  const isWallPlacementValid = (
    row: number,
    col: number,
    orientation: WallOrientation
  ): boolean => {
    const maxIndex = boardSize - 1; // For a 9x9 board, wall grid is 8x8
    if (row < 0 || row >= maxIndex || col < 0 || col >= maxIndex) return false;

    const exists = game.board?.walls.some(
      (w) => w.r === row && w.c === col && w.orientation === orientation
    );
    if (exists) return false;

    // Optional: Add further checks (e.g. overlapping or blocking all wins)
    const hasIntersectingWall = game.board?.walls.some(wall => {
      if (orientation === WallOrientation.HORIZONTAL) {
        return (
          wall.orientation === WallOrientation.VERTICAL &&
          wall.r === row &&
          (wall.c === col || wall.c === col + 1)
        );
      } else {
        return (
          wall.orientation === WallOrientation.HORIZONTAL &&
          wall.c === col &&
          (wall.r === row || wall.r === row + 1)
        );
      }
    });
  
    return !hasIntersectingWall;
  };

  // Render game status messages based on current state
  const renderGameStatus = () => {
    if (game.gameStatus === GameStatus.WAITING_FOR_USER) {
      return (
        <Alert
          message="Waiting for another player to join"
          description="Share this game link or ID with a friend!"
          type="info"
          showIcon
        />
      );
    }
    if (game.gameStatus === GameStatus.ENDED) {
      // Use a cast in case winner is provided by the backend even though it's not defined in /types/api.ts.
      const winner = (game as any).winner || "Someone";
      return (
        <Alert
          message={`Game Over: ${winner} wins!`}
          type="success"
          showIcon
        />
      );
    }
    if (game.gameStatus === GameStatus.RUNNING) {
      return (
        <Alert
          message={`Current Turn: ${game.currentTurn?.username || 'Unknown'}`}
          description={
            isCurrentUserTurn()
              ? "It's your turn! Move your pawn or place a wall."
              : 'Waiting for opponent...'
          }
          type={isCurrentUserTurn() ? 'success' : 'info'}
          showIcon
        />
      );
    }
    return null;
  };

  return (
    <div>
      {/* Game Status Message */}
      <div style={{ marginBottom: '1rem' }}>{renderGameStatus()}</div>
      
      {/* Players' Remaining Walls */}
      {game.currentUsers && (
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          {game.currentUsers.map((userObj) => (
            <Tag
              key={userObj.id}
              color={userObj.id === game.creator.id ? 'blue' : 'red'}
              style={{ marginRight: 8, fontSize: '16px', padding: '4px 8px' }}
            >
              {userObj.username}
            </Tag>
          ))}
        </div>
      )}

      {/* Board Wrapper */}
      <div
        style={{
          position: 'relative',
          margin: '0 auto',
          width: `${boardSize * cellSize + (boardSize - 1) * 2}px`
        }}
      >
        {/* Board Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
            gap: '2px',
            position: 'relative',
            background: '#8B4513'
          }}
        >
          {Array.from({ length: boardSize }).map((_, rowIndex) =>
            Array.from({ length: boardSize }).map((_, colIndex) => {
              const isMoveOption = possibleMoves.some(
                ([r, c]) => r === rowIndex && c === colIndex
              );
              const pawnsHere = game.board?.pawns.filter(
                (p) => p.r === rowIndex && p.c === colIndex
              ) || [];

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    backgroundColor: isMoveOption ? '#90ee9060' : '#FFDEAD',
                    border: isMoveOption
                      ? '2px dashed green'
                      : '1px solid #8B4513',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: isMoveOption ? 'pointer' : 'default'
                  }}
                >
                  {pawnsHere.map((pawn) => {
                    const isSelected = selectedPawn?.id === pawn.id;
                    const isOwner = pawn.userId === currentUser.id.toString();
                    const color = pawn.userId === game.creator.id ? 'blue' : 'red';
                    return (
                      <div
                        key={`pawn-${pawn.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePawnSelection(pawn);
                        }}
                        style={{
                          width: '80%',
                          height: '80%',
                          borderRadius: '50%',
                          backgroundColor: color,
                          boxShadow: '0 3px 5px rgba(0,0,0,0.3)',
                          cursor: isOwner && isCurrentUserTurn() ? 'pointer' : 'default',
                          border: isSelected ? '2px solid yellow' : 'none'
                        }}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Render Existing Walls */}
        {game.board?.walls.map((wall, idx) => {
          const isHorizontal = wall.orientation === WallOrientation.HORIZONTAL;
          return (
            <div
              key={`wall-${idx}`}
              style={{
                position: 'absolute',
                left: isHorizontal
                  ? `${wall.c * (cellSize + 2)}px`
                  : `${(wall.c + 1) * (cellSize + 2) - 2}px`,
                top: isHorizontal
                  ? `${(wall.r + 1) * (cellSize + 2) - 2}px`
                  : `${wall.r * (cellSize + 2)}px`,
                width: isHorizontal ? `${cellSize * 2 + 2}px` : '4px',
                height: isHorizontal ? '4px' : `${cellSize * 2 + 2}px`,
                backgroundColor: '#4a5568',
                borderRadius: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          );
        })}

        {/* Wall Placement Hover Grid */}
        {wallPlacementMode &&
          (wallOrientation === WallOrientation.HORIZONTAL ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${boardSize * cellSize}px`,
                height: `${boardSize * cellSize}px`,
                pointerEvents: 'none'
              }}
            >
              {Array.from({ length: boardSize - 1 }).map((_, rowIndex) =>
                Array.from({ length: boardSize - 1 }).map((_, colIndex) => (
                  <div
                    key={`h-wall-${rowIndex}-${colIndex}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWallPlacement(
                        rowIndex,
                        colIndex,
                        WallOrientation.HORIZONTAL
                      );
                    }}
                    style={{
                      position: 'absolute',
                      left: `${colIndex * cellSize}px`,
                      top: `${(rowIndex + 1) * cellSize - wallThickness / 2}px`,
                      width: `${cellSize * 2}px`,
                      height: `${wallThickness}px`,
                      backgroundColor: '#9333ea',
                      opacity: 0.7,
                      cursor: 'pointer',
                      pointerEvents: 'auto'
                    }}
                  />
                ))
              )}
            </div>
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${boardSize * cellSize}px`,
                height: `${boardSize * cellSize}px`,
                pointerEvents: 'none'
              }}
            >
              {Array.from({ length: boardSize - 1 }).map((_, rowIndex) =>
                Array.from({ length: boardSize - 1 }).map((_, colIndex) => (
                  <div
                    key={`v-wall-${rowIndex}-${colIndex}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWallPlacement(
                        rowIndex,
                        colIndex,
                        WallOrientation.VERTICAL
                      );
                    }}
                    style={{
                      position: 'absolute',
                      left: `${(colIndex + 1) * cellSize - wallThickness / 2}px`,
                      top: `${rowIndex * cellSize}px`,
                      width: `${wallThickness}px`,
                      height: `${cellSize * 2}px`,
                      backgroundColor: '#9333ea',
                      opacity: 0.7,
                      cursor: 'pointer',
                      pointerEvents: 'auto'
                    }}
                  />
                ))
              )}
            </div>
          ))}
      </div>

      {/* Bottom Controls */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '12px' }}>
        {isCurrentUserTurn() && (
          <>
            <Button
              onClick={toggleWallPlacement}
              type={wallPlacementMode ? 'primary' : 'default'}
              danger={wallPlacementMode}
              icon={
                wallOrientation === WallOrientation.HORIZONTAL ? (
                  <BorderHorizontalOutlined />
                ) : (
                  <BorderVerticleOutlined />
                )
              }
            >
              {wallPlacementMode ? 'Cancel Wall' : 'Place Wall'}
            </Button>

            {wallPlacementMode && (
              <Button onClick={toggleWallOrientation} type="default">
                {wallOrientation}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuoridorBoard;




