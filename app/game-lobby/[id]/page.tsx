"use client";
import styles from "@/styles/QuoridorBoard.module.css";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  message,
  Modal,
  Spin,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import QuoridorBoard from "./board"; // importing from same directory
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Game, GameStatus } from "@/types/game";
import { Pawn } from "@/types/pawn";
import { Wall } from "@/types/wall";
import { ApplicationError } from "@/types/error";
import { getWebsocketDomain } from "@/utils/domain";
import Suggestion from "./suggestion";
import Chat, { initializeGameChat, deleteGameChat } from "./chatcomponent";
import { getDatabase, ref, push, onValue, set } from "firebase/database";
export default function GameRoomPage() {
  console.log("Component mounted");
  const params = useParams();
  const router = useRouter();
  const apiService = useApi();
  const { getUser } = useAuth();
  // Ensure gameId is properly extracted from params
  const gameId = params?.id ? String(params.id) : "";
  const [walls, setWalls] = React.useState<any[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isSuggestionVisible, setIsSuggestionVisible] = React.useState(false);
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [pawns, setPawns] = useState<Pawn[]>([]);
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
  const currentUser = getUser();
    if (!currentUser) {
      setError("No user logged in.");
      return;
    }
  // useCallback to memoize fetchGame
  const fetchGame = async () => {
    try {
      setLoading(true);
      console.log("Fetching game with ID:", gameId);
      const data: Game = await apiService.get(`/game-lobby/${gameId}`);
      if (!data?.id) {
        throw new Error("Invalid game data");
      }
      setGame(data);
      setError(null);
      console.log("Data received:", data);
      return data; //return data
    } catch (err) {
      console.error("Failed to load game:", err);
      setError("Failed to load game");
      throw err; // Rethrow the error to be caught in the Websocket handler
    } finally {
      setLoading(false);
    }
  };
  const isCurrentUserWinner = () => {
    if (!user || !game || !game.currentUsers || !game.currentTurn) return false;

    // Player who just moved (not currentTurn) is the winner
    const winningPlayer = game.currentUsers.find(
        (u) => u.id !== game.currentTurn.id
    );

    if (!winningPlayer) return false;

    return String(winningPlayer.id) === String(user.id);
  };
  useEffect(() => {
    if (!gameId) {
      setError("Game ID is missing. Please check the URL or select a game from the lobby.");
      setLoading(false);
      return;
    }

    const loadGameAndInitChat = async () => {
    try {
      await fetchGame();
      // Initialize a fresh chat after game is loaded
      initializeGameChat(gameId);
    } catch (err) {
      console.error("Error loading game:", err);
    }
  };

  loadGameAndInitChat();
}, []);



  useEffect(() => {
    const domain = getWebsocketDomain();
    const ws = new WebSocket(`${domain}/refresh-websocket`);
    setSocket(ws);

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      //console.log(data);
      if (data.type === "refresh" && data.gameId === gameId) {
        refreshGameData().catch(err => {
        if (err?.message?.includes("404") || err?.message?.includes("Game does not exist")) {
          // Game no longer exists - aborted
          message.info("Game no longer exists. Returning to lobby...");
          router.push("/game-lobby");
        }
      });
        console.log(data.gameId);
        console.log("Received refresh for gameId:", gameId);
      }

    });

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

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
        // Check if game was aborted or ended
    if (gameData?.gameStatus === GameStatus.ENDED) {
      if (game?.gameStatus !== GameStatus.ENDED) {
    setGame(gameData);
    deleteGameChat(gameId);
  }
  setLoading(false);
  return;

    }
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
        throw err;
      }
    }; 
  const handleToggleSuggestion = () => {
    setIsSuggestionVisible(!isSuggestionVisible);
    if (isChatOpen) {
      setIsChatOpen(false);
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
  const handleUpdateGame = (updatedGame: Game) => {
    console.log("Game updated:", updatedGame);
    setGame(updatedGame);
  };

  // Abort the game
  const handleAbortGame = () => {
    setConfirmModalVisible(true);
  };

  const confirmAbortGame = async () => {
    try {
      if (!user) {
        throw new Error("No authenticated user");
      }

      // Send user data correctly formatted
      await apiService.delete(`/game-lobby/${gameId}`, {
        id: user.id,
        username: user.username,
        status: user.status,
      });

      message.success("Game aborted successfully");
      router.push("/game-lobby");
    } catch (err: unknown) {
      const error = err as ApplicationError;
      const errorMessage = error.response?.data?.message || error.message ||
          "Failed to abort game";
      message.error(`Failed to abort game: ${errorMessage}`);
      console.error("Error aborting game:", error);
    } finally {
      setConfirmModalVisible(false);
    }
  };


  const renderContent = () => {
  if (loading) return <Spin tip="Loading game..." />;
  if (error && !game) {
    return (
      <Alert
        message="Error, could not load game"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="middle" type="primary" onClick={() => router.push("/game-lobby")}>
            Return to Lobby
          </Button>
        }
      />
    );
  }
  if (!game) return null;
  
  // If game is waiting for players
  if (game.gameStatus === GameStatus.WAITING_FOR_USER) {
    return (
      <Alert
        message={<span style={{ color: 'blue' }}>Waiting for another player to join...</span>}
        type="info"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }
  
  // If game is ended
  if (game.gameStatus === GameStatus.ENDED) {
    return (
      <div className="game-over-container" style={{
    textAlign: "center",
    padding: "20px",
  backgroundColor: "#1a242f",
  borderRadius: "8px",
 boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
 maxWidth: "450px",
 margin: "20px auto",
color: "white",
animation: "fadeIn 0.8s ease-in-out",
position: "relative",
overflow: "hidden"
  }}>
    {/* Confetti animation - only when player wins */}
    {!isCurrentUserWinner() && (
                                              <div className="confetti-container" style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                pointerEvents: "none",
                                                zIndex: 1
                                              }}>
                                                {Array.from({ length: 50 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="confetti-piece"
                                                        style={{
                                                          position: "absolute",
                                                          width: `${Math.random() * 8 + 5}px`,
                                                          height: `${Math.random() * 6 + 3}px`,
                                                          backgroundColor: [`#f94144`, `#f3722c`, `#f8961e`, `#f9c74f`, `#90be6d`, `#43aa8b`, `#577590`][Math.floor(Math.random() * 7)],
                                                          left: `${Math.random() * 100}%`,
                                                          top: `-5%`,
                                                          borderRadius: Math.random() > 0.5 ? '50%' : '0',
                                                          animation: `confettiFall ${Math.random() * 3 + 2}s linear infinite`,
                                                          animationDelay: `${Math.random() * 3}s`
                                                        }}
                                                    />
                                                ))}
                                              </div>
                                          )}

                                          <div style={{
                                            fontSize: "3rem",
                                            marginBottom: "10px",
                                            animation: "bounce 1s ease-in-out",
                                            position: "relative",
                                            zIndex: 2
                                          }}>
                                            {isCurrentUserWinner() ? "🎮" : "🏆"}
                                          </div>

                                          <h2 style={{
                                            fontSize: "2rem",
                                            fontWeight: "bold",
                                            color: "#f1c40f",
                                            textShadow: "0 0 8px rgba(241, 196, 15, 0.5)",
                                            margin: "0 0 10px 0",
                                            animation: "pulse 2s infinite",
                                            position: "relative",
                                            zIndex: 2
                                          }}>
                                            Game Over
                                          </h2>

                                          <p style={{
                                            fontSize: "1.2rem",
                                            marginBottom: "15px",
                                            position: "relative",
                                            zIndex: 2
                                          }}>
                                            {isCurrentUserWinner()
                                                ? "You lost!"
                                                : "You won!"}
                                          </p>

                                          <div style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: "12px",
                                            marginTop: "12px",
                                            position: "relative",
                                            zIndex: 2
                                          }}>
                                            <button onClick={() => router.push("/game-lobby")} style={{
                                              padding: "8px 16px",
                                              backgroundColor: "#3498db",
                                              color: "white",
                                              border: "none",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                              fontWeight: "bold",
                                              transition: "all 0.2s"
                                            }}>
                                              Play Again
                                            </button>
                                            <button onClick={() => router.push("/game-lobby")} style={{
                                              padding: "8px 16px",
                                              backgroundColor: "#e74c3c",
                                              color: "white",
                                              border: "none",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                              fontWeight: "bold",
                                              transition: "all 0.2s"
                                            }}>
                                              Main Menu
                                            </button>
                                          </div>

                                          <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes bounce {
          0% { transform: translateY(-15px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes confettiFall {
          0% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(450px) rotate(720deg); 
            opacity: 0;
          }
        }
        
        .game-over-container:hover .confetti-piece {
          animation-play-state: paused;
        }
      `}</style>
                                        </div>
    );
  }

    return (
      <div style={{ display: "flex", height: "100%" }}>
        {/* Left Panel */}
        <div style={{ flex: "0 0 200px", padding: "10px", borderRight: "1px solid rgba(255,255,255,0.1)", color: "white",marginLeft: "0" }}>
  {/* Game status info */}
  <div className={styles.gameStatusContainer}>
    {game.currentTurn && (
      <div style={{ minHeight: "50px" }}> {/* Fixed height container for turn info */}
      <div> 
                <p className={styles.currentTurnText}>
              You are the: <span style={{
                color: game.creator?.id === currentUser?.id ? "#ef4444" : "#2563eb"
              }}>
                {game.creator?.id === currentUser?.id ? "red" : "blue"} pawn
              </span>
              </p></div>
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
    
    
    <div className={styles.wallCountersContainer}>
      {/* Wall counter - always visible */}
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
        <p style={{ fontSize: "10px", marginTop: "5px" }}>
          {currentUser ? walls.filter(w => w.userId === currentUser.id).length : 0} / 10
        </p>
      </div>
      
      {/* Opponent wall counter - ALWAYS SHOW (removed conditional) */}
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
        <p style={{ fontSize: "10px", marginTop: "5px" }}>
          {(() => {
            const opponent = game.currentUsers?.find(u => u.id !== currentUser?.id);
            return opponent ? walls.filter(w => w.userId === opponent.id).length : 0;
          })()} / 10
        </p>
      </div>
    </div>
    
    {/* Refresh button */}
    <div style={{ marginTop: "15px" }}>
      <button 
        onClick={refreshGameData} 
        className={styles.refreshButton}
      >
        Refresh Game Data
      </button>
      <div className={styles.wallsCountText} style={{ 
  fontSize: "18px",  // Makes text larger
  color: "#2ecc71",   // Bright green color
  fontWeight: "bold", // Makes text bold for emphasis
  marginTop: "8px"    // Adds some spacing from the button
}}>
</div>
      {/* Move error message here - after walls count */}
      {error && (
        <div className={styles.errorMessageContainer} style={{ 
          marginTop: "15px", 
          padding: "8px", 
          backgroundColor: "rgba(220, 53, 69, 0.2)", 
          borderRadius: "4px",
          borderLeft: "4px solid #dc3545" 
        }}>
          <p className={styles.errorMessage} style={{ 
            color: "#ff6b6b", 
            margin: 0,
            fontSize: "14px" 
          }}>
            {error}
          </p>
        </div>
      )}
    </div>
  </div>
</div>
    

        {/* Center Panel */} 
  <div style={{ flex: 1, padding: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
    <QuoridorBoard 
      gameId={game.id} 
      onMoveComplete={(updatedGame) => {
        setGame(updatedGame);
        refreshGameData();
      }} 
    />
  </div>


        {/* Right Panel */}
        <div
  style={{
    flex: "0 0 200px",
    padding: "10px",
    borderLeft: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "flex-end",
  }}
>
  {/* Only show Suggestion when game is running */}
  {(game.gameStatus === GameStatus.RUNNING) && (
    <div style={{ width: "100%" }}>
      <Suggestion pawns={pawns} walls={walls} />
    </div>
  )}

  {/* Chat Button */}
          <Button onClick={() => setIsChatOpen(!isChatOpen)}
            style={{ marginTop: "auto" }}>
            💬 Chat {unreadMessages > 0 && <span style={{ fontWeight: "bold" }}>{unreadMessages > 9 ? "9+" : unreadMessages}</span>}
          </Button>
          {isChatOpen && (
            <div style={{ width: "100%" }}>
              <Chat gameId={game.id} gameEnded={(game.gameStatus as GameStatus) === GameStatus.ENDED} />
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <ProtectedRoute>
      <PageLayout requireAuth>
        <div
          style={{
            padding: "40px 20px",
            minHeight: "100vh",
            background:
              "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg')",
            backgroundSize: "cover",
          }}
        >
          <Card
  title={
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <Button
        icon={<ArrowLeftOutlined style={{ color: "white" }}/>}
        onClick={() => router.push("/game-lobby")}
        type="text"
      />
      <span style={{ fontSize: "1.4em", color: "#4f46e5" }}>
        Quoridor Game: {gameId}
      </span>
    </div>
  }
  loading={loading}
  style={{
    width: "95vw",
    height: "95vh",
    maxWidth: "none",
    padding: "20px",
    margin: "0 auto",
    background: "rgba(17, 24, 39, 0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  }}
  extra={
    game?.gameStatus !== GameStatus.ENDED && (
      <Button
        type="primary"
        danger
        icon={<CloseCircleOutlined />}
        onClick={handleAbortGame}
      >
        Abort Game
      </Button>
    )
  }
>
  {renderContent()}
</Card>
            

            {/* Confirm abort modal */}
            <Modal
                title="Abort Game"
                open={confirmModalVisible}
                onOk={confirmAbortGame}
                onCancel={() => setConfirmModalVisible(false)}
                okText="Yes, Abort Game"
                cancelText="No, Continue Playing"
                style={{ top: "30%" }}
            >
              <div style={{ color: "#000", fontSize: "16px" }}>
                <p>
                  Are you sure you want to abort this game? This action cannot be
                  undone.
                </p>
              </div>
            </Modal>
          </div>
        </PageLayout>
      </ProtectedRoute>
  );
}