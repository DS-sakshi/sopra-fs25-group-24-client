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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        width: gapSize,
        height: gapSize,
        background: isHovered ? "white" : "white",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s ease",
        boxShadow: isHovered ? "0 0 5px rgba(255,255,255,0.3)" : "none",
        borderRadius: "2px",
        zIndex: showOptions ? 20 : 1,
      }}
      onClick={() => setShowOptions(!showOptions)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual indicator that this is an interactive element */}
      {isHovered && !showOptions && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "4px",
          height: "4px",
          backgroundColor: "white",
          borderRadius: "50%",
        }} />
      )}
      
      {showOptions && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            zIndex: 30,
            backgroundColor: "rgba(251, 252, 253, 0.9)",
            padding: "6px",
            borderRadius: "4px",
            boxShadow: "0 4px 8px rgba(252, 250, 250, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            width: "80px",
          }}
        >
          <button
            style={{ 
              fontSize: "10px", 
              padding: "4px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
            onClick={(e) => {
              e.stopPropagation();
              sendPosition(row, col, WallOrientation.VERTICAL);
              setShowOptions(false);
            }}
          >
            Vertical
          </button>
          <button
            style={{ 
              fontSize: "10px", 
              padding: "4px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
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

  // Debug function to log wall data for troubleshooting
  const logWalls = (wallsData: Wall[]) => {
    console.log(`Wall count: ${wallsData?.length || 0}`);
    if (wallsData && wallsData.length > 0) {
      wallsData.forEach((wall, idx) => {
        console.log(`Wall ${idx}: r=${wall.r}, c=${wall.c}, orientation=${wall.orientation}, color=${wall.color}`);
      });
    } else {
      console.log("No walls found in the data");
    }
  };

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
        
        // Log additional wall information for debugging
        logWalls(wallsData);

        setGame(gameData);
        setPawns(pawnsData || []);
        setWalls(wallsData || []);
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
        try {
          const [newPawns, newWalls] = await Promise.all([
            apiService.get<Pawn[]>(`/game-lobby/${gameId}/pawns`),
            apiService.get<Wall[]>(`/game-lobby/${gameId}/walls`),
          ]);
          
          console.log("Updated pawns data:", newPawns);
          console.log("Updated walls data:", newWalls);
          
          // Log additional wall information for debugging
          logWalls(newWalls);
          
          setPawns(newPawns || []);
          setWalls(newWalls || []);
        } catch (refreshError) {
          console.error("Error refreshing game state:", refreshError);
        }
        
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
      
      console.log("Refreshed game data:", gameData);
      console.log("Refreshed pawns data:", pawnsData);
      console.log("Refreshed walls data:", wallsData);
      
      // Log additional wall information for debugging
      logWalls(wallsData);
      
      setGame(gameData);
      setPawns(pawnsData || []);
      setWalls(wallsData || []);
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


  // Check if there's a wall at the given position and orientation
  const getWallAt = (r: number, c: number) => {
    const wall = walls.find(w => 
      w.r === r && 
      w.c === c + 1 &&
      w.orientation === "HORIZONTAL"
    );
  
    const wall1 = walls.find(w => 
      w.r === r && 
      w.c === c - 1 &&
      w.orientation === "HORIZONTAL"
    );
  
    const wall2 = walls.find(w => 
      w.r === r + 1 && 
      w.c === c &&
      w.orientation === "VERTICAL"
    );
  
    const wall3 = walls.find(w => 
      w.r === r - 1 && 
      w.c === c &&
      w.orientation === "VERTICAL"
    );
    
    return wall || wall1 || wall2 || wall3 || null;
  }; //{console.log(`Found wall at r=${r}, c=${c}`);return "a";
    //} //else {
      //return "b";};

  const renderBoard = () => {
    if (!game) return null;

    const currentUser = getUser();
    
    // For debugging
    console.log("Rendering board with walls count:", walls.length);
    
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
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              borderRadius: "4px",
              position: "relative",
            }}
          >
            {/* Render cells for the board */}
            {Array.from({ length: boardSize * boardSize }).map((_, index) => {
              const rowIndex = Math.floor(index / boardSize);
              const colIndex = index % boardSize;
              const isOddRow = rowIndex % 2 === 1;
              const isOddCol = colIndex % 2 === 1;

              // Wall intersection points (odd row, odd column)
              if (isOddRow && isOddCol) {
                return (
                  <WallIntersection
                    key={`intersection-${rowIndex}-${colIndex}`}
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
                    key={`cell-${rowIndex}-${colIndex}`}
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
                      position: "relative", 
                      boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    {pawn && (
                      <div
                        style={{
                          width: "80%",
                          height: "80%",
                          borderRadius: "50%",
                          backgroundColor: pawn.color || "#ff5722",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          border: "2px solid white",
                        }}
                        title={`Player: ${pawn.userId}`}
                      />
                    )}
                  </div>
                );
              }

              // Horizontal wall slots (odd row, even column)
              if (isOddRow && !isOddCol) {
                // Look for horizontal walls
                const wallHere = getWallAt(rowIndex, colIndex);
                if(wallHere) {    
                  const wallOwner = pawns.find(p => p.userId === wallHere.userId);            
                return (
                  <div
                    key={`hwall-${rowIndex}-${colIndex}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: wallOwner?.color,
                      border: "1px solidrgb(19, 139, 59)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      position: "relative", 
                      boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
                    }}
                  />
                );
              }
              else{
               // Gap cells (empty spaces)
              return (
                <div
                  key={`gap-${rowIndex}-${colIndex}`}
                  style={{
                    width: gapSize,
                    height: gapSize,
                    backgroundColor: "white",
                    opacity: 0.3,
                  }}
                />
              );

              }
            }

              // Vertical wall slots (even row, odd column)
              if (!isOddRow && isOddCol) {
                // Look for vertical walls
                const wallHere = getWallAt(rowIndex, colIndex);
                
                if (wallHere){
                  const wallOwner = pawns.find(p => p.userId === wallHere.userId);
                return (
                  <div
                    key={`vwall-${rowIndex}-${colIndex}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: wallOwner?.color,
                      border: "1px solidrgb(252, 251, 250)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      position: "relative", 
                      boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
                    }}
                  />
                  
                );

              }else{
                  // Gap cells (empty spaces)
                 return (
                   <div
                     key={`gap-${rowIndex}-${colIndex}`}
                     style={{
                       width: gapSize,
                       height: gapSize,
                       backgroundColor: "white",
                       opacity: 0.3,
                     }}
                   />
                 );
   
                 }
              }


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
            {/* Wall counter with improved visualization */}
            <div style={{ 
              padding: "10px 15px", 
              backgroundColor: "rgba(0,0,0,0.4)", 
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)" 
            }}>
              <p style={{ marginBottom: "5px" }}>Your Walls:</p>
              <div style={{ display: "flex", gap: "3px", justifyContent: "center" }}>
                {Array(10).fill(0).map((_, i) => {
                  const wallsPlaced = currentUser ? walls.filter(w => w.userId === currentUser.id).length : 0;
                  const isUsed = i < wallsPlaced;
                  
                  return (
                    <div key={i} style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: isUsed ? "#8B4513" : "rgba(255,255,255,0.3)",
                      border: isUsed ? "1px solid #6B3E23" : "1px solid rgba(255,255,255,0.1)",
                      boxShadow: isUsed ? "inset 0 0 3px rgba(0,0,0,0.3)" : "none",
                      borderRadius: "2px"
                    }}></div>
                  );
                })}
              </div>
              <p style={{ fontSize: "14px", marginTop: "5px" }}>
                {currentUser ? walls.filter(w => w.userId === currentUser.id).length : 0} / 10
              </p>
            </div>
            
            {/* Opponent wall counter if needed */}
            {game.currentUsers && game.currentUsers.length > 1 && (
              <div style={{ 
                padding: "10px 15px", 
                backgroundColor: "rgba(0,0,0,0.4)", 
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)" 
              }}>
                <p style={{ marginBottom: "5px" }}>Opponent Walls:</p>
                <div style={{ display: "flex", gap: "3px", justifyContent: "center" }}>
                  {Array(10).fill(0).map((_, i) => {
                    const opponent = game.currentUsers?.find(u => u.id !== currentUser?.id);
                    const wallsPlaced = opponent ? walls.filter(w => w.userId === opponent.id).length : 0;
                    const isUsed = i < wallsPlaced;
                    
                    return (
                      <div key={i} style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: isUsed ? "#DC2626" : "rgba(255,255,255,0.3)",
                        border: isUsed ? "1px solid #B91C1C" : "1px solid rgba(255,255,255,0.1)",
                        boxShadow: isUsed ? "inset 0 0 3px rgba(0,0,0,0.3)" : "none",
                        borderRadius: "2px"
                      }}></div>
                    );
                  })}
                </div>
                <p style={{ fontSize: "14px", marginTop: "5px" }}>
                  {(() => {
                    const opponent = game.currentUsers?.find(u => u.id !== currentUser?.id);
                    return opponent ? walls.filter(w => w.userId === opponent.id).length : 0;
                  })()} / 10
                </p>
              </div>
            )}
          </div>
          
          {/* Debug/refresh button */}
          <div style={{ marginTop: "15px" }}>
            <button 
              onClick= {refreshGameData} 
              style={{ 
                padding: "6px 12px", 
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Refresh Game Data
            </button>
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#94a3b8" }}>
              Walls count: {walls.length}
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