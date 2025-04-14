"use client";


import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Descriptions, message, Spin, Tag, Alert, Modal } from "antd";
import { ArrowLeftOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import QuoridorBoard from "./board"; // importing from same directory
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";


// Import from /types/api
import {
  Game,
  GameStatus,
  MovePostDTO,
  UserGetDTO,
  UserStatus
} from "@/types/api";


export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const apiService = useApi();   // your custom hook or similar
  const { user: currentUser } = useAuth();

  const gameId = params.id as string;  // from [gameId].tsx
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);


  // Poll the game data periodically
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);

        const data: Game = await apiService.get(`/game-lobby/${gameId}`);

        // Validate the game data
        if (!data?.id) {
          message.error("Could not retrieve game. Please try again.");
          return;
        }

        // Initialize board if it doesn't exist
        if (!data.board) {
          data.board = {
            pawns: [],
            walls: []
          };
        }

        // Initialize pawns for both players when game starts
        if (data.gameStatus === GameStatus.RUNNING && (!data.board.pawns || data.board.pawns.length === 0)) {
          data.board.pawns = [
            // Creator's pawn (starts at bottom)
            {
              id: 1,
              userId: data.creator.id,
              r: data.sizeBoard - 1,
              c: Math.floor(data.sizeBoard / 2)
            },
            // Opponent's pawn (starts at top)
            {
              id: 2,
              userId: data.currentUsers.find(u => u.id !== data.creator.id)?.id || '',
              r: 0,
              c: Math.floor(data.sizeBoard / 2)
            }
          ];
        }

        // Initialize empty walls array if not present
        if (!data.board.walls) {
          data.board.walls = [];
        }

        setGame(data);
      } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load game data";
        setError(errorMsg);
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };


    fetchGame();
    const intervalId = setInterval(fetchGame, 3000);
    return () => clearInterval(intervalId);
  }, [gameId, apiService]);


  // Called by QuoridorBoard to refresh game state after a move or wall
  const handleUpdateGame = (updatedGame: Game) => {
    setGame(updatedGame);
  };


  // Abort the game
  const handleAbortGame = () => {
    setConfirmModalVisible(true);
  };


  const confirmAbortGame = async () => {
    try {
      // Prepare a user object if needed by your backend:
      const userDTO: UserGetDTO = {
        id: Number(localStorage.getItem("id")),
        name: localStorage.getItem("name") || "",
        username: localStorage.getItem("username") || "",
        status: localStorage.getItem("status") as UserStatus || UserStatus.OFFLINE,
        token: localStorage.getItem("token") || "",
        creationDate: localStorage.getItem("creationDate") || "",
        birthday: localStorage.getItem("birthday") || ""
      };


      await apiService.delete(`/game-lobby/${gameId}`, userDTO);
      message.success("Game aborted successfully");
      router.push("/game-lobby");
    } catch (err: any) {
      message.error("Failed to abort game: " + err.message);
      console.error("Error aborting game:", err);
    } finally {
      setConfirmModalVisible(false);
    }
  };


  const renderGameDetails = () => {
    if (!game) return null;


    // E.g., highlight the game's status, board size, etc.
    return (
        <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
          <Descriptions.Item
              label={<span style={{ color: "#e5e7eb" }}>Status</span>}
          >
            <Tag
                color={
                  game.gameStatus === GameStatus.WAITING_FOR_USER
                      ? "orange"
                      : game.gameStatus === GameStatus.RUNNING
                          ? "green"
                          : "red"
                }
            >
              {game.gameStatus}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
              label={<span style={{ color: "#e5e7eb" }}>Board Size</span>}
          >
          <span style={{ color: "#e5e7eb" }}>
            {game.sizeBoard} x {game.sizeBoard}
          </span>
          </Descriptions.Item>
          <Descriptions.Item
              label={
                <span style={{ color: "#e5e7eb" }}>
              <UserOutlined /> Creator (Blue)
            </span>
              }
          >
          <span style={{ color: "#e5e7eb" }}>
            {game.creator?.username}
            {game.currentTurn?.id === game.creator.id && " (Current Turn)"}
          </span>
          </Descriptions.Item>
          <Descriptions.Item
              label={
                <span style={{ color: "#e5e7eb" }}>
              <UserOutlined /> Opponent (Red)
            </span>
              }
          >
          <span style={{ color: "#e5e7eb" }}>
            {game.currentUsers
                .filter((u) => u.id !== game.creator.id)
                .map((u) => u.username)
                .join(", ") || "Waiting for player..."}
            {game.currentTurn &&
                game.currentTurn.id !== game.creator.id &&
                game.gameStatus === GameStatus.RUNNING &&
                " (Current Turn)"}
          </span>
          </Descriptions.Item>
        </Descriptions>
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
                backgroundSize: "cover"
              }}
          >
            <Card
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
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
                  maxWidth: 900,
                  margin: "0 auto",
                  background: "rgba(17, 24, 39, 0.85)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                }}
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
                            onClick={() => router.push("/game-lobby")}
                        >
                          Return to Lobby
                        </Button>
                      }
                  />
              ) : !game ? (
                  <Spin tip="Loading game..." />
              ) : (
                  <>
                    {renderGameDetails()}


                    {/* Always show the board if there's a game, but conditionally render content inside */}
                    {game.gameStatus === GameStatus.WAITING_FOR_USER ? (
                        <Alert
                            message="Waiting for another player to join..."
                            type="info"
                            showIcon
                            style={{ marginBottom: 20 }}
                        />
                    ) : (
                        <QuoridorBoard
                            currentUser={{
                                id: Number(currentUser!.id),
                                name: currentUser!.name,
                                username: currentUser!.username,
                                status: UserStatus[currentUser!.status as keyof typeof UserStatus] as UserStatus,
                                token: currentUser!.token,
                                creationDate: currentUser!.creationDate.toString(),
                                birthday: currentUser!.birthday?.toString(),
                                totalGamesWon: Number(currentUser!.totalGamesWon) || 0,
                                totalGamesLost: Number(currentUser!.totalGamesLost) || 0,
                                totalGamesPlayed: Number(currentUser!.totalGamesPlayed) || 0
                            }}
                            game={game}
                            gameId={String(game.id)}
                            apiService={apiService}
                            onUpdateGame={handleUpdateGame}
                        />

                    )}
                  </>
              )}
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
                <p>Are you sure you want to abort this game? This action cannot be undone.</p>
              </div>
            </Modal>
          </div>
        </PageLayout>
      </ProtectedRoute>
  );}
