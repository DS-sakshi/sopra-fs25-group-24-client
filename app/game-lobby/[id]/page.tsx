"use client";

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
import { ApplicationError } from "@/types/error";


export default function GameRoomPage() {
  console.log("Component mounted");
  const params = useParams();
  const router = useRouter();
  const apiService = useApi();
  // Ensure gameId is properly extracted from params
  const gameId = params?.id ? String(params.id) : "";

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const { user } = useAuth();

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
    } catch (err) {
      console.error("Failed to load game:", err);
      setError("Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameId) {
      fetchGame();
    }
    }, []);

    useEffect(() => {
      const socket = new WebSocket('ws://localhost:8080/refresh-websocket');
    
      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        fetchGame();
        console.log("SFASFD")
  
      });
    
       return () => {
        socket.close();
       };
    }, []);
    

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
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
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
              width: "100%",
              maxWidth: "800px",
              padding: "20px",
              margin: "0 auto",
              background: "rgba(17, 24, 39, 0.85)",
              backdropFilter: "blur(12px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
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
            {error && !game
              ? (
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
              )
              : !game
              ? <Spin tip="Loading game..." />
              : (
                <>
                  {/* Conditional alerts */}
                  {game.gameStatus === GameStatus.WAITING_FOR_USER && (
                    <Alert
                      message="Waiting for another player to join..."
                      type="info"
                      showIcon
                      style={{ marginBottom: 20 }}
                    />
                  )}
                  {game.gameStatus === GameStatus.RUNNING &&
                      game.currentUsers && game.currentUsers.length === 2
                    ? (
                      <div className="game-page">
                        <h1
                          style={{
                            color: "#e5e7eb",
                            textAlign: "center",
                            marginBottom: "20px",
                          }}
                        >
                          Quoridor Game
                        </h1>
                        <QuoridorBoard
                          gameId={gameId}
                          onMoveComplete={handleUpdateGame}
                        />
                      </div>
                    )
                    : (
                      game.gameStatus === GameStatus.ENDED && (
                        <Alert
                          message="Game Over"
                          description={game.currentTurn?.id === game.creator.id
                            ? "You won!"
                            : "You lost!"}
                          type="success"
                          showIcon
                          style={{ marginBottom: 20 }}
                        />
                      )
                    )}
                </> // Close the fragment here
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
