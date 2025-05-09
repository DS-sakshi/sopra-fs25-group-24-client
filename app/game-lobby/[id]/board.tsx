import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";
import { Pawn } from "@/types/pawn";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
import { Wall, WallOrientation } from "@/types/wall";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/QuoridorBoard.module.css";
import Chat from "./chatcomponent";
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
      className={`${styles.wallIntersection} ${showOptions ? styles.wallIntersectionActive : ''}`}
      style={{ width: gapSize, height: gapSize }}
      onClick={() => setShowOptions(!showOptions)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual indicator that this is an interactive element */}
      {isHovered && !showOptions && (
        <div className={styles.wallIndicator} />
      )}
      
      {showOptions && (
        <div className={styles.wallOptionsMenu}>
          <button
            className={styles.wallOptionButton}
            onClick={(e) => {
              e.stopPropagation();
              sendPosition(row, col, WallOrientation.VERTICAL);
              setShowOptions(false);
            }}
          >
            Vertical
          </button>
          <button
            className={styles.wallOptionButton}
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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Debug function to log wall data
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

  // Listen for new messages and update unread count
  useEffect(() => {
    if (!gameId) return;
    
    // Only track unread messages when chat is closed
    if (isChatOpen) return;
    
    const database = getDatabase();
    const messagesRef = ref(database, `chats/${gameId}/messages`);
    
    // This variable will track the last message count we've seen
    let lastKnownCount = 0;
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const messageCount = Object.keys(data).length;
        // Only update unread count if there are new messages
        if (messageCount > lastKnownCount) {
          setUnreadMessages(prev => prev + (messageCount - lastKnownCount));
          lastKnownCount = messageCount;
        }
      }
    });
    
    return () => unsubscribe();
  }, [gameId, isChatOpen]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setUnreadMessages(0);
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
  }, []);

  const sendPosition = async (
    row: number,
    col: number,
    orientation?: WallOrientation
  ) => {
    // Your existing sendPosition logic - no styling to remove
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
      console.log("Sending move payload:", JSON.stringify(payload, null, 2));
      
      const response = await apiService.post<Game>(
        `/game-lobby/${game.id}/move`,
        payload
      );
      
      if (response) {
        setGame(response);
        
        try {
          const [newPawns, newWalls] = await Promise.all([
            apiService.get<Pawn[]>(`/game-lobby/${gameId}/pawns`),
            apiService.get<Wall[]>(`/game-lobby/${gameId}/walls`),
          ]);
          
          console.log("Updated pawns data:", newPawns);
          console.log("Updated walls data:", newWalls);
          
          logWalls(newWalls);
          
          setPawns(newPawns || []);
          setWalls(newWalls || []);
        } catch (refreshError) {
          console.error("Error refreshing game state:", refreshError);
        }
        
        setError(null);
        
        if (onMoveComplete) {
          onMoveComplete(response);
        }
      }
    } catch (error: any) {
      console.error("Error sending move:", error);
      const errorMessage = error.message || "Failed to make move";
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
      
      logWalls(wallsData);
      
      setGame(gameData);
      setPawns(pawnsData || []);
      setWalls(wallsData || []);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing game data:", err);
      setError("Failed to refresh game data.");
      setLoading(false);
    }
  }; 

  // Board dimensions
  const boardSize = 17;
  const cellSize = 40;
  const gapSize = 10;
  
  const columns: string[] = [];
  const rows: string[] = [];
  
  for (let i = 0; i < boardSize; i++) {
    columns.push(i % 2 === 0 ? `${cellSize}px` : `${gapSize}px`);
    rows.push(i % 2 === 0 ? `${cellSize}px` : `${gapSize}px`);
  }

  // Check if there's a wall at the given position
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
  };

  const renderBoard = () => {
    if (!game) return null;

    const currentUser = getUser();
    console.log("Rendering board with walls count:", walls.length);
    
    return (
      <div className={styles.quoridorBoardContainer}>
        <div style={{ width: `${(cellSize * 9) + (gapSize * 8)}px` }}>
          <div 
            className={styles.boardGrid}
            style={{ 
              gridTemplateColumns: columns.join(" "),
              gridTemplateRows: rows.join(" "),
              width: `${(cellSize * 9) + (gapSize * 8)}px`,
              height: `${(cellSize * 9) + (gapSize * 8)}px`,
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
                    className={styles.pawnCell}
                    onClick={() => sendPosition(rowIndex, colIndex)}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {pawn && (
                      <div
                        className={styles.pawn}
                        style={{ backgroundColor: pawn.color || "#ff5722" }}
                        title={`Player: ${pawn.userId}`}
                      />
                    )}
                  </div>
                );
              }

              // Horizontal wall slots (odd row, even column)
              if (isOddRow && !isOddCol) {
                const wallHere = getWallAt(rowIndex, colIndex);
                if(wallHere) {    
                  const wallOwner = pawns.find(p => p.userId === wallHere.userId);            
                  return (
                    <div
                      key={`hwall-${rowIndex}-${colIndex}`}
                      className={styles.wallHorizontal}
                      style={{ 
                        width: cellSize, 
                        height: cellSize,
                        backgroundColor: wallOwner?.color 
                      }}
                    />
                  );
                } else {
                  return (
                    <div
                      key={`gap-${rowIndex}-${colIndex}`}
                      className={styles.gapCell}
                      style={{ width: gapSize, height: gapSize }}
                    />
                  );
                }
              }

              // Vertical wall slots (even row, odd column)
              if (!isOddRow && isOddCol) {
                const wallHere = getWallAt(rowIndex, colIndex);
                if (wallHere) {
                  const wallOwner = pawns.find(p => p.userId === wallHere.userId);
                  return (
                    <div
                      key={`vwall-${rowIndex}-${colIndex}`}
                      className={styles.wallVertical}
                      style={{ 
                        width: cellSize, 
                        height: cellSize,
                        backgroundColor: wallOwner?.color
                      }}
                    />
                  );
                } else {
                  return (
                    <div
                      key={`gap-${rowIndex}-${colIndex}`}
                      className={styles.gapCell}
                      style={{ width: gapSize, height: gapSize }}
                    />
                  );
                }
              }
            })}
          </div>
        </div>
        
        {/* Game status info */}
        <div className={styles.gameStatusContainer}>
          {game.currentTurn && (
            <div>
              <p className={styles.currentTurnText}>
                Current turn: <span className={game.currentTurn.id === currentUser?.id ? styles.yourTurn : styles.opponentTurn}>
                  {game.currentTurn.username}
                  {game.currentTurn.id === currentUser?.id ? " (You)" : ""}
                </span>
              </p>
              {game.currentTurn.id !== currentUser?.id && (
                <p className={styles.waitingText}>Waiting for your opponent to make a move...</p>
              )}
            </div>
          )}
          
          {error && (
            <p className={styles.errorMessage}>{error}</p>
          )}
          
          <div className={styles.wallCountersContainer}>
            {/* Wall counter */}
            <div className={styles.wallCounter}>
              <p style={{ marginBottom: "5px" }}>Your Walls:</p>
              <div className={styles.wallBlocks}>
                {Array(10).fill(0).map((_, i) => {
                  const wallsPlaced = currentUser ? walls.filter(w => w.userId === currentUser.id).length : 0;
                  const isUsed = i < wallsPlaced;
                  
                  return (
                    <div 
                      key={i} 
                      className={`${styles.wallBlock} ${isUsed ? styles.wallBlockUsed : styles.wallBlockUnused}`}
                    />
                  );
                })}
              </div>
              <p style={{ fontSize: "14px", marginTop: "5px" }}>
                {currentUser ? walls.filter(w => w.userId === currentUser.id).length : 0} / 10
              </p>
            </div>
            
            {/* Opponent wall counter */}
            {game.currentUsers && game.currentUsers.length > 1 && (
              <div className={styles.wallCounter}>
                <p style={{ marginBottom: "5px" }}>Opponent Walls:</p>
                <div className={styles.wallBlocks}>
                  {Array(10).fill(0).map((_, i) => {
                    const opponent = game.currentUsers?.find(u => u.id !== currentUser?.id);
                    const wallsPlaced = opponent ? walls.filter(w => w.userId === opponent.id).length : 0;
                    const isUsed = i < wallsPlaced;
                    
                    return (
                      <div 
                        key={i} 
                        className={`${styles.wallBlock} ${isUsed ? styles.opponentWallBlockUsed : styles.wallBlockUnused}`} 
                      />
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
          
          {/* Refresh button */}
          <div style={{ marginTop: "15px" }}>
            <button 
              onClick={refreshGameData} 
              className={styles.refreshButton}
            >
              Refresh Game Data
            </button>
            <div className={styles.wallsCountText}>
              Walls count: {walls.length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading game...</div>;
  if (error && !game) return <div>{error}</div>;
  

  return (
    <div style={{ 
      position: "relative",
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'center',
      maxWidth: '1600px',
      margin: '0 auto'
    }}>
      <div>
        {renderBoard()}
      </div>

      {/* Floating Chat Button with Notification Badge */}
      <button 
        onClick={handleOpenChat}
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          zIndex: 1000,
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "24px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        💬
        {/* Notification Badge */}
        {unreadMessages > 0 && (
          <div style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            backgroundColor: "#ef4444",
            color: "white",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}>
            {unreadMessages > 9 ? '9+' : unreadMessages}
          </div>
        )}
      </button>

      {/* Chat Panel: Only visible when isChatOpen is true */}
      {isChatOpen && (
        <div style={{
          position: "fixed",
          right: "20px",
          bottom: "100px",
          zIndex: 1000,
          width: "220px",
          height: "250px",
          backgroundColor: "#1a2234",
          //borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ 
            //display: "flex", 
            //justifyContent: "space-between", 
            //alignItems: "center",
            //padding: "10px", 
            //borderBottom: "1px solid #334155"
          }}> 
            <button 
              onClick={() => setIsChatOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "Yellow",
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              ✕
            </button>
          </div>
          <Chat gameId={gameId} />
        </div>
      )}
    </div>
  );
};

export default QuoridorBoard;