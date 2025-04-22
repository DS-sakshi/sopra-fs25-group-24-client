"use client";

import React, { useEffect, useState } from "react";
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
import Board from "./board"; // importing from same directory
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Game, GameStatus } from "@/types/game";
import { User } from "@/types/user";
import { Wall } from "@/types/wall";
import { Pawn } from "@/types/pawn";
import { ApiService } from "@/api/apiService";
//import { Move } from "@/types/move";
//import { Board } from "@/types/board";
import { ApplicationError } from "@/types/error";

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const apiService = useApi(); // your custom hook or similar
  const { user: currentUser } = useAuth();

  const gameId = params.id as string; // from [gameId].tsx
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const { user } = useAuth();
  // Poll the game data periodically
  const fetchGame = async () => {
    try {
      setLoading(true);
      const data: Game = await apiService.get(`/game-lobby/${gameId}`);
      if (!data?.id) {
        throw new Error("Invalid game data");
      }

      setGame(data);
      setError(null);
    } catch (err) {
      setError("Failed to load game");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 5000); //refresh time
    return () => clearInterval(interval);
  }, [gameId]);

  const handleUpdateGame = (updatedGame: Game) => {
    setGame(updatedGame);
  };

  // Abort the game
  const handleAbortGame = () => {
    setConfirmModalVisible(true);
  };

  const confirmAbortGame = async () => {
    try {
      // Send only the required data fields that match backend DTO structure
      await apiService.delete(`/game-lobby/${gameId}`, {
        id: Number(localStorage.getItem("id")),
        username: localStorage.getItem("username"),
        status: localStorage.getItem("status"),
        // Only send fields that the backend needs
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

  const renderGameDetails = () => {
    if (!game) return null;

    // E.g., highlight the game's status, board size, etc.
    return (
      <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
        <Descriptions.Item
          label={<span style={{ color: "#e5e7eb" }}>Status</span>}
        >
          <Tag
            color={game.gameStatus === GameStatus.WAITING_FOR_USER
              ? "orange"
              : game.gameStatus === GameStatus.RUNNING
              ? "green"
              : "red"}
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
            <UserOutlined /> Creator (Red)
          </span>
        }
      >
        <span style={{ color: "#e5e7eb" }}>
          {game.creator?.username || "Unknown"}
        </span>
      </Descriptions.Item>
        <Descriptions.Item
          label={
            <span style={{ color: "#e5e7eb" }}>
              <UserOutlined /> Opponent (blue)
            </span>
          }
        >
          <span style={{ color: "#e5e7eb" }}>
          {game.creator && game.currentUsers
            .filter((u) => u.id !== game.creator?.id)
            .map((u) => u.username)
            .join(", ") || "Waiting for player..."}
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
            {error
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
                  {renderGameDetails()}

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
                      game.currentUsers.length === 2 && user ?
                     (
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
                        <Board
                          game={game}
                          gameId={gameId}
                          currentUser={user}
                          onGameStatusChange={handleUpdateGame}
                        />
                      </div>
                    )
                    : (
                      game.gameStatus === GameStatus.ENDED && (
                        <Alert
                        message="Game Over"
                        description="The game has ended. Thank you for playing!"
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