import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";
import { User } from "@/types/user";
import { Pawn } from "@/types/pawn";
import { Wall, WallOrientation } from "@/types/wall";
import "@ant-design/v5-patch-for-react-19";
import { GameStatus } from "@/types/api";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface WallIntersectionProps {
  row: number;
  col: number;
  gapSize: number;
  sendPosition: (
    row: number,
    col: number,
    orientation: WallOrientation
  ) => void;
}

interface QuoridorBoardProps {
  gameId: string;
  onMoveComplete?: (updatedGame: Game) => void;
}

const WallIntersection: React.FC<WallIntersectionProps> = ({
  row,
  col,
  gapSize,
  sendPosition,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  return (
    <div
      style={{
        width: gapSize,
        height: gapSize,
        background: "#1a365d",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => setShowOptions(!showOptions)}
    >
      {showOptions && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            zIndex: 10,
          }}
        >
          <button
            style={{ fontSize: "8px", padding: "2px" }}
            onClick={(e) => {
              e.stopPropagation();
              sendPosition(row, col, WallOrientation.VERTICAL);
              setShowOptions(false);
            }}
          >
            Vertical
          </button>
          <button
            style={{ fontSize: "8px", padding: "2px" }}
            onClick={(e) => {
              e.stopPropagation();
              sendPosition(row, col, WallOrientation.HORIZONTAL);
              setShowOptions(false);
            }}
          >
            Horizontal
          </button>
        </div>
      )}
    </div>
  );
};

const QuoridorBoard: React.FC<QuoridorBoardProps> = ({ gameId, onMoveComplete }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [pawns, setPawns] = useState<Pawn[]>([]);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiService = useApi();
  const { getUser } = useAuth();

  useEffect(() => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);

    Promise.all([
      apiService.get<Game>(`/game-lobby/${gameId}`),
      apiService.get<Pawn[]>(`/game-lobby/${gameId}/pawns`),
      apiService.get<Wall[]>(`/game-lobby/${gameId}/walls`),
    ])
      .then(([gameData, pawnsData, wallsData]) => {
        console.log("Game data:", gameData);
        console.log("Pawns data:", pawnsData);
        console.log("Walls data:", wallsData);
        setGame(gameData);
        setPawns(pawnsData);
        setWalls(wallsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching game data:", err);
        setError("Failed to fetch game data.");
        setLoading(false);
      });
  }, [gameId, apiService]);

  const sendPosition = async (
    row: number,
    col: number,
    orientation?: WallOrientation
  ) => {
    if (!game) return;

    const currentUser = getUser();
    if (!currentUser) {
      setError("No user logged in.");
      return;
    }

    // Find current pawn position for this user
    const userPawn = pawns.find(p => p.userId === currentUser.id);
    if (!userPawn && !orientation) {
      setError("Could not find your pawn on the board");
      return;
    }

    // The backend expects correct coordinates in the 17x17 grid where:
    // - Even indices (0,2,4...) are for pawns
    // - Odd indices (1,3,5...) are for walls/gaps
    let payload;
    
    if (orientation) {
      // For wall placement
      payload = {
        wallPosition: [row, col],
        wallOrientation: orientation,
        user: {
          id: currentUser.id,
          username: currentUser.username,
        },
        type: "ADD_WALL",
      };
    } else {
      // For pawn movement
      payload = {
        startPosition: [userPawn!.r, userPawn!.c],
        endPosition: [row, col],
        user: {
          id: currentUser.id,
          username: currentUser.username,
        },
        type: "MOVE_PAWN",
      };
    }

    try {
      // Log the payload for debugging
      console.log("Sending move payload:", JSON.stringify(payload, null, 2));
      
      const response = await apiService.post<Game>(
        `/game-lobby/${game.id}/move`,
        payload
      );
      
      if (response) {
        setGame(response);
        
        // Refresh pawns and walls after move
        const [newPawns, newWalls] = await Promise.all([
          apiService.get<Pawn[]>(`/game-lobby/${gameId}/pawns`),
          apiService.get<Wall[]>(`/game-lobby/${gameId}/walls`),
        ]);
        
        setPawns(newPawns);
        setWalls(newWalls);
        setError(null); // Clear any previous errors
        
        // Notify parent component if callback provided
        if (onMoveComplete) {
          onMoveComplete(response);
        }
      }
    } catch (error: any) {
      console.error("Error sending move:", error);
      // Extract the detailed error message if available
      const errorMessage = error.message || "Failed to make move";
      // Check for specific error messages from the API
      if (errorMessage.includes("Not users turn")) {
        setError("It's not your turn!");
      } else if (errorMessage.includes("Invalid pawn move")) {
        setError("Invalid move: You can only move to adjacent cells or jump over another pawn");
      } else {
        setError(`Move failed: ${errorMessage}`);
      }
    }
  };

  const refreshGameData = async () => {
    try {
      setLoading(true);
      const [gameData, pawnsData, wallsData] = await Promise.all([
        apiService.get<Game>(`/game-lobby/${gameId}`),
        apiService.get<Pawn[]>(`/game-lobby/${gameId}/pawns`),
        apiService.get<Wall[]>(`/game-lobby/${gameId}/walls`),
      ]);
      
      setGame(gameData);
      setPawns(pawnsData);
      setWalls(wallsData);
      setError(null); // Clear any previous errors
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing game data:", err);
      setError("Failed to refresh game data.");
      setLoading(false);
    }
  };

  // This represents a 17x17 grid for a 9x9 Quoridor board
  // with alternating cells and gaps
  const boardSize = 17;
  const cellSize = 40;
  const gapSize = 10;
  
  const columns: string[] = [];
  const rows: string[] = [];
  
  for (let i = 0; i < boardSize; i++) {
    columns.push(i % 2 === 0 ? `${cellSize}px` : `${gapSize}px`);
    rows.push(i % 2 === 0 ? `${cellSize}px` : `${gapSize}px`);
  }

  const renderBoard = () => {
    if (!game) return null;

    const currentUser = getUser();

    return (
      <div className="quoridor-board-container">
        <div
          style={{
            margin: "40px auto",
            width: `${(cellSize * 9) + (gapSize * 8)}px`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: columns.join(" "),
              gridTemplateRows: rows.join(" "),
              width: `${(cellSize * 9) + (gapSize * 8)}px`,
              height: `${(cellSize * 9) + (gapSize * 8)}px`,
              backgroundColor: "#e2e8f0", // Lighter background
            }}
          >
            {Array.from({ length: boardSize * boardSize }).map((_, index) => {
              const rowIndex = Math.floor(index / boardSize);
              const colIndex = index % boardSize;
              const isOddRow = rowIndex % 2 === 1;
              const isOddCol = colIndex % 2 === 1;

              // Wall intersection points (odd row, odd column)
              if (isOddRow && isOddCol) {
                return (
                  <WallIntersection
                    key={index}
                    row={rowIndex}
                    col={colIndex}
                    gapSize={gapSize}
                    sendPosition={sendPosition}
                  />
                );
              }

              // Pawn cells (even row, even column)
              if (!isOddRow && !isOddCol) {
                const pawn = pawns.find(
                  (pawn) => pawn.r === rowIndex && pawn.c === colIndex
                );
                return (
                  <div
                    key={index}
                    onClick={() => sendPosition(rowIndex, colIndex)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: "white",
                      border: "1px solid #8B4513",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    {pawn && (
                      <div
                        style={{
                          width: "80%",
                          height: "80%",
                          borderRadius: "50%",
                          backgroundColor: pawn.color || "#ff5722",
                        }}
                        title={`Player: ${pawn.userId}`}
                      />
                    )}
                  </div>
                );
              }

              // Wall slots (odd row, even column = horizontal wall; even row, odd column = vertical wall)
              const wallOrientation = isOddRow 
                ? WallOrientation.HORIZONTAL 
                : WallOrientation.VERTICAL;
                
              const wallHere = walls.find(
                (w) => w.r === rowIndex && w.c === colIndex && w.orientation === wallOrientation
              );

              return (
                <div
                  key={index}
                  style={{
                    width: isOddCol ? gapSize : cellSize,
                    height: isOddRow ? gapSize : cellSize,
                    backgroundColor: wallHere ? wallHere.color || "#8B4513" : "#cbd5e1",
                    opacity: wallHere ? 1 : 0.3,
                  }}
                />
              );
            })}
          </div>
        </div>
        
        {/* Game status info */}
        <div style={{ marginTop: "20px", textAlign: "center", color: "white" }}>
          {game.currentTurn && (
            <div>
              <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                Current turn: <span style={{ color: game.currentTurn.id === currentUser?.id ? "#22c55e" : "#f87171" }}>
                  {game.currentTurn.username}
                  {game.currentTurn.id === currentUser?.id ? " (You)" : ""}
                </span>
              </p>
              {game.currentTurn.id !== currentUser?.id && (
                <p style={{ color: "#cbd5e1" }}>Waiting for your opponent to make a move...</p>
              )}
            </div>
          )}
          {error && (
            <p style={{ color: "#f87171", backgroundColor: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "4px" }}>
              {error}
            </p>
          )}
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "center", gap: "20px" }}>
            <div>
              <p>Wall Count:</p>
              <p>{walls.filter(w => w.userId === currentUser?.id).length} / 10</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading game...</div>;
  if (error && !game) return <div>{error}</div>;

  return <>{renderBoard()}</>;
};

export default QuoridorBoard;