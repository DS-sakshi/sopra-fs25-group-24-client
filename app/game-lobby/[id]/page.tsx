"use client";
/* import { User } from "@/types/user";
import { Pawn} from "@/types/pawn";
import { Move } from "@/types/move";
import { Game } from "@/types/game";
import {Board} from "@/types/board";
import {Wall} from "@/types/wall"; */
import React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Descriptions, message, Spin, Tag, Alert, Modal } from "antd";
import { ArrowLeftOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Type definitions
interface Pawn {
  id: number;
  userId: number;
  r: number;
  c: number;
  color?: string;
}

interface Board {
  pawns: Pawn[];
  walls?: Array<{
    r: number;
    c: number;
    orientation: 'HORIZONTAL' | 'VERTICAL';
  }>;
}

interface GameData {
  id: string;
  creator: {
    id: string;
    username: string;
  };
  currentTurn?: {
    id: string;
    username: string;
  };
  gameStatus: "WAITING_FOR_USER" | "RUNNING" | "ENDED";
  sizeBoard: number;
  board: Board;
  currentUsers?: Array<{
    id: string;
    username: string;
  }>;
  winner?: string;
}

export default function GameRoomPage() {
  const params = useParams();
  const gameId = params.id as string;
  const router = useRouter();
  const apiService = useApi();
  const { user: currentUser } = useAuth();
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [selectedPawn, setSelectedPawn] = useState<Pawn | null>(null);
  // Create a 17-element array, alternating 20px and 10px
  const columns = Array.from({ length: 17 }, (_, i) => (i % 2 === 0 ? '20px' : '10px'));
  // Same for rows
  const rows = columns;
  // Sum up track sizes for total width/height: (9 × 20px) + (8 × 10px) = 260
  const totalSize = 260;

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.get<GameData>(`/game-lobby/${gameId}`);
        
        if (!data?.id) {
          message.error("Could not retrieve game. Please try again.");
          return;
        }

        setGame(data);
        
        if (currentUser && data.currentTurn?.id === currentUser.id && data.gameStatus === "RUNNING") {
          calculatePossibleMoves(data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load game session";
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
    
    const interval = setInterval(fetchGame, 3000);
    return () => clearInterval(interval);
  }, [gameId, apiService, currentUser]);

  // Calculate possible moves for the current player
  const calculatePossibleMoves = (gameData: GameData) => {
    if (!currentUser || !gameData?.board) return;
    
    const pawn = gameData.board.pawns.find(p => p.userId === parseInt(currentUser.id));
    if (!pawn) return;
    
    const boardSize = gameData.sizeBoard || 9;
    const { r, c } = pawn;
    const possiblePositions: [number, number][] = [];
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    
    for (const [dr, dc] of directions) {
      const newR = r + dr;
      const newC = c + dc;
      
      if (newR >= 0 && newR < boardSize && newC >= 0 && newC < boardSize) {
        possiblePositions.push([newR, newC]);
      }
    }
    
    const opponentPawn = gameData.board.pawns.find(p => p.userId !== parseInt(currentUser.id));
    if (opponentPawn) {
      if (Math.abs(pawn.r - opponentPawn.r) + Math.abs(pawn.c - opponentPawn.c) === 1) {
        const jumpR = opponentPawn.r + (opponentPawn.r - pawn.r);
        const jumpC = opponentPawn.c + (opponentPawn.c - pawn.c);
        
        if (jumpR >= 0 && jumpR < boardSize && jumpC >= 0 && jumpC < boardSize) {
          possiblePositions.push([jumpR, jumpC]);
        }
      }
    }
    
    setPossibleMoves(possiblePositions);
  };

  // Handle pawn selection
  const handlePawnSelection = (pawn: Pawn): void => {
    if (!isCurrentUserTurn()) return;
    
    setSelectedPawn(pawn);
  };

  // Check if it's the current user's turn
  const isCurrentUserTurn = () => {
    return currentUser && game && game.currentTurn?.id === currentUser.id && game.gameStatus === "RUNNING";
  };

  // Handle cell click to move pawn
  const handleCellClick = async (row: number, col: number): Promise<void> => {
    if (!isCurrentUserTurn() || !game) return;
    
    // Find the current player's pawn
    const pawn = currentUser ? game.board?.pawns?.find(p => p.userId === parseInt(currentUser.id)) : null;
    if (!pawn) return;
    
    // Check if the move is valid
    const isValidMove = possibleMoves.some(([r, c]) => r === row && c === col);
    if (!isValidMove) {
      message.error("Invalid move");
      return;
    }
    
    try {
      setLoading(true);
      
      // Create move object
      interface Move {
        startPosition: [number, number];
        endPosition: [number, number];
        user: {
          id: string;
          username: string;
        };
        type: "NORMAL";
      }

      const move: Move = {
        startPosition: [pawn.r, pawn.c],
        endPosition: [row, col],
        user: {
          id: currentUser?.id || "",
          username: currentUser?.username || "Unknown"
        },
        type: "NORMAL"
      };
      
      // Send move to API
      await apiService.post(`/game-lobby/${gameId}/move`, move);
      
      // Refresh the game after move
      const updatedGame = await apiService.get<GameData>(`/game-lobby/${gameId}`);
      setGame(updatedGame);
      setPossibleMoves([]);
      
      message.success("Move completed");
    } catch (error) {
      message.error("Failed to make move");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle aborting a game
  const handleAbortGame = () => {
    setConfirmModalVisible(true);
  };

  // Confirm and abort the game
  const confirmAbortGame = async () => {
    try {
      await apiService.delete(`/game-lobby/${gameId}`);
      message.success("Game aborted successfully");
      router.push("/game-lobby");
    } catch (error) {
      message.error("Failed to abort game");
    } finally {
      setConfirmModalVisible(false);
    }
  };

  // Render the game board
  const renderBoard = () => {
    if (!game || !game.board) {
      console.log("No game or board data available");
      return null;
    }
    
    console.log("Rendering board with data:", game.board); // Debug log



    const boardSize = game.sizeBoard || 9;
    const cellSize = 40; // Size of each cell in pixels
    
    return (

      <div className="quoridor-board-container">
        <div className="quoridor-board-wrapper" style={{ position: 'relative', margin: '40px auto', width: `${cellSize * boardSize + (boardSize - 1) * 2}px` }}>
          {/* Board grid */}
          <div 
            className="quoridor-board"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
              gap: '2px',
              position: 'relative',
              background: '#8B4513'
            }}
          >
            {/* Board cells */}
            {Array.from({ length: boardSize }).map((_, rowIndex) => (
              Array.from({ length: boardSize }).map((_, colIndex) => {
                const isPossibleMove = possibleMoves.some(
                  ([r, c]) => r === rowIndex && c === colIndex
                );
                
                // Find pawns at this position
                const pawnsAtPosition = game.board.pawns?.filter(
                  pawn => pawn.r === rowIndex && pawn.c === colIndex
                ) || [];
                
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
                      backgroundColor: isPossibleMove ? '#90ee9060' : '#FFDEAD',
                      border: isPossibleMove ? '2px dashed green' : '1px solid #8B4513',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: isPossibleMove ? 'pointer' : 'default',
                      position: 'relative',
                    }}
                  >
                    {/* Render pawns */}
                    {pawnsAtPosition.map((pawn, idx) => (
                      <div 
                        key={`pawn-${rowIndex}-${colIndex}-${idx}`}
                        onClick={() => handlePawnSelection(pawn)}
                        style={{
                          width: '80%',
                          height: '80%',
                          borderRadius: '50%',
                          backgroundColor: pawn.color || (pawn.userId === parseInt(game.creator.id) ? 'blue' : 'red'),
                          boxShadow: '0 3px 5px rgba(0,0,0,0.3)',
                          cursor: pawn.userId === parseInt(currentUser?.id ?? "0") && isCurrentUserTurn() ? 'pointer' : 'default',
                          border: selectedPawn?.id === pawn.id ? '2px solid yellow' : 'none',
                          zIndex: 3
                        }}
                      />
                    ))}
                  </div>
                );
              })
            ))}
          </div>
          
          {/* Render walls as separate elements ABOVE the board */}
          {game.board.walls?.map((wall, index) => {
            const isHorizontal = wall.orientation === 'HORIZONTAL';
            
            return (
              <div
                key={`wall-${index}`}
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
                  zIndex: 2,
                  borderRadius: '2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            );
          })}
        </div>

        
        {/* Game status message */}
        {renderGameStatus()}
      </div>
    );
  };
  const sendPosition = async (
      row: number,
      col: number,
      orientation?: 'VERTICAL' | 'HORIZONTAL',
  ) => {
    const message = orientation
        ? `Coordinates: Row ${row}, Column ${col}, Orientation: ${orientation}`
        : `Coordinates: Row ${row}, Column ${col}`;

    alert(message);
  };
  // Render game status message
  const renderGameStatus = () => {
    if (!game) return null;
    
    if (game.gameStatus === "WAITING_FOR_USER") {
      return (
        <Alert
          message="Waiting for another player to join"
          description="Share this game ID with a friend to play together."
          type="info"
          showIcon
          style={{ marginBottom: 20, marginTop: 20 }}
        />
      );
    }
    
    if (game.gameStatus === "ENDED") {
      // Find the winner if available
      const winnerUsername = game.winner || "Someone";
      
      return (
        <Alert
          message={`Game Over: ${winnerUsername} wins!`}
          description="Returning to lobby..."
          type="success"
          showIcon
          style={{ marginBottom: 20, marginTop: 20 }}
        />
      );
    }
    
    if (game.gameStatus === "RUNNING") {
      const currentTurnUser = game.currentTurn;
      
      return (
        <Alert
          message={`Current Turn: ${currentTurnUser?.username || "Unknown"}`}
          description={isCurrentUserTurn() 
            ? "It's your turn! Select a valid move." 
            : "Waiting for opponent to move..."}
          type={isCurrentUserTurn() ? "success" : "info"}
          showIcon
          style={{ marginBottom: 20, marginTop: 20 }}
        />
      );
    }
    
    return null;
  };

  return (
    <ProtectedRoute>
      <PageLayout requireAuth>
        <div style={{ padding: "40px 20px", minHeight: "100vh", background: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg')", backgroundSize: "cover" }}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push('/game-lobby')}
                  type="text"
                />
                <span style={{ fontSize: '1.4em', color: '#4f46e5' }}>
                  Quoridor Game: {gameId}
                </span>
              </div>
            }
            loading={loading}
            style={{ maxWidth: 800, margin: '0 auto', background: 'rgba(17, 24, 39, 0.85)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            extra={
              <Button
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleAbortGame}
              >
                  Abort Game
                </Button>
            }
          >
            {error ? (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 20 }}
                action={
                  <Button
                    size="middle"
                    type="primary"
                    onClick={() => router.push('/game-lobby')}
                  >
                    Return to Lobby
                  </Button>
                }
              />
            ) : game ? (
              <div>
                <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
                  <Descriptions.Item label={<span style={{ color: "#e5e7eb" }}>Status</span>}>
                    <Tag color={
                      game.gameStatus === "WAITING_FOR_USER" ? 'orange' : 
                      game.gameStatus === "RUNNING" ? 'green' : 'red'
                    }>
                      {game.gameStatus}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span style={{ color: "#e5e7eb" }}>Board Size</span>}>
                    <span style={{ color: "#e5e7eb" }}>{game.sizeBoard} x {game.sizeBoard}</span>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ color: "#e5e7eb" }}>
                      <UserOutlined /> Creator (Blue)
                    </span>}
                  >
                    <span style={{ color: "#e5e7eb" }}>
                      {game.creator?.username} 
                      {game.currentTurn?.id === game.creator?.id && " (Current Turn)"}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span style={{ color: "#e5e7eb" }}>
                      <UserOutlined /> Opponent (Red)
                    </span>}
                  >
                    <span style={{ color: "#e5e7eb" }}>
                      {game.currentUsers?.find(u => u.id !== game.creator.id)?.username || 'Waiting for player...'} 
                      {game.currentTurn?.id !== game.creator?.id && game.gameStatus === "RUNNING" && " (Current Turn)"}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                {/* Game board visualization */}
                {renderBoard()}
              </div>

            ) : (
              <Spin tip="Loading game..." />
            )}
          </Card>
          <br />
          <h2>Game Board</h2>
          <br />
          <Card>
            <>
              <div
                  style={{
                    marginTop: 20,
                    height: 400,
                    background: '#f0f2f5',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}
              >

                <div
                    style={{
                      display: 'grid',
                      // Use our alternating columns & rows
                      gridTemplateColumns: columns.join(' '),
                      gridTemplateRows: rows.join(' '),
                      gap: 0,
                      // Match the total container size
                      width: `${totalSize}px`,
                      height: `${totalSize}px`,
                    }}
                >
                  {Array.from({ length: 289 }).map((_, index) => {
                    const row = Math.floor(index / 17);
                    const col = index % 17;
                    const isOddRow = row % 2 === 1;
                    const isOddCol = col % 2 === 1;
                    const isBlue = (isOddCol && isOddRow);
                    const isBlack = (row + col) % 2 === 1;
                    const [showButtons, setShowButtons] = useState(false);

                    const handleBoardClick = () => {
                      if (!isBlue) {
                        sendPosition(row, col);
                        return;
                      }
                      setShowButtons(prev => !prev); // Toggle buttons on blue clicks
                    };

                    return (
                        <div
                            key={index}
                            style={{
                              width: isOddCol ? '10px' : '20px',
                              height: isOddRow ? '10px' : '20px',
                              background: isBlue ? 'blue' : isBlack ? 'black' : 'white',
                              cursor: 'pointer',
                              position: 'relative' // For button positioning
                            }}
                            onClick={handleBoardClick}
                        >
                          {/* Buttons overlay for blue cells */}
                          {isBlue && showButtons && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                gap: '4px'
                              }}>
                                <button
                                    style={{ fontSize: '8px', padding: '2px' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      sendPosition(row, col, 'VERTICAL');
                                      setShowButtons(false);
                                    }}
                                >
                                  Vertical
                                </button>
                                <button
                                    style={{ fontSize: '8px', padding: '2px' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      sendPosition(row, col, 'HORIZONTAL');
                                      setShowButtons(false);
                                    }}
                                >
                                  Horizontal
                                </button>
                              </div>
                          )}
                        </div>
                    );
                  })}

                </div>
              </div>
              <div
                  id="coords-display"
                  style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '10px',
                    background: 'white',
                    border: '1px solid #ccc'
                  }}
              >
              </div>

              </>

          </Card>
        </div>

        <Modal
          title="Abort Game"
          open={confirmModalVisible}
          onOk={confirmAbortGame}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Yes, Abort Game"
          cancelText="No, Continue Playing"
          style={{ 
            top: '30%',
            color: '#ffffff'
          }}
        >
          <div style={{ color: '#000000', fontSize: '16px' }}>
          <p>Are you sure you want to abort this game? This action cannot be undone.</p>
          </div>
        </Modal>

        <style jsx global>{`
          .quoridor-board-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 20px;
          }
          
          .ant-descriptions-item-label,
          .ant-descriptions-item-content {
            background: rgba(30, 41, 59, 0.8) !important;
          }
        `}</style>
      </PageLayout>
    </ProtectedRoute>
  );
}