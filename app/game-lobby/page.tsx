"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, message, Table, Tag } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { JSX } from "react/jsx-runtime";

const GameLobby = () => {
  const { user } = useAuth();
  const router = useRouter();
  const apiService = useApi();
  interface Game {
    id: string;
    creator: { username: string };
    gameStatus: string;
    currentUsers?: { id: string }[];
    numberUsers: number;
  }

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingGame, setCreatingGame] = useState(false);

  // Fetch games from API
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<Game[]>("/game-lobby");
      setGames(response);
    } catch (error) {
      message.error("Failed to fetch games");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new game
  const createGame = async () => {
    if (!user) {
      message.error("You need to log in to create a game");
      return;
    }

    try {
      setCreatingGame(true);
      const response: { id: string } = await apiService.post("/game-lobby", {
        id: user.id,
        username: user.username,
      });

      if (response?.id) {
        message.success("Game created successfully!");
        await fetchGames(); // Refresh the game list
        router.push(`/game-lobby/${response.id}`);
      }
    } catch (error) {
      message.error("Could not create game");
      console.error(error);
    } finally {
      setCreatingGame(false);
    }
  };

  // Join an existing game
  interface User {
    id: string;
    username: string;
  }

  interface ApiError {
    response?: {
      status: number;
    };
  }

  const joinGame = async (gameId: string): Promise<void> => {
    if (!user) {
      message.error("You need to log in to join a game");
      return;
    }

    try {
      setLoading(true);
      await apiService.put(`/game-lobby/${gameId}/join`, {
        id: user.id,
        username: user.username,
      });

      message.success("Joined game successfully!");
      router.push(`/game-lobby/${gameId}`);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response && apiError.response.status === 409) {
        message.error("You are already in this game");
      } else if (apiError.response && apiError.response.status === 404) {
        message.error("Game is full or already running");
      } else {
        message.error("Failed to join game");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and set up polling
  useEffect(() => {
    fetchGames();

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchGames();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get appropriate color for game status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "WAITING_FOR_USER":
        return "orange";
      case "RUNNING":
        return "green";
      case "ENDED":
        return "red";
      default:
        return "default";
    }
  };

  // Table columns definition
  interface GameRecord {
    id: string;
    creator: { username: string };
    gameStatus: string;
    currentUsers?: { id: string }[];
    numberUsers: number;
  }

  interface Column {
      title: string;
      dataIndex?: string | string[];
      key: string;
      render?: (text: any, record?: GameRecord) => JSX.Element | null;
    }

  const columns: Column[] = [
    {
      title: "Game ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span style={{ color: "#e5e7eb" }}>{text}
      </span>,
    },
    {
      title: "Creator",
      dataIndex: ["creator", "username"],
      key: "creator",
      render: (text: string) => <span style={{ color: "#e5e7eb" }}>{text}
      </span>,
    },
    {
      title: "Status",
      dataIndex: "gameStatus",
      key: "gameStatus",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Players",
      key: "players",
      render: (_, record?: GameRecord) => (
        <span style={{ color: "#e5e7eb" }}>
          {record?.currentUsers?.length || 0}/{record?.numberUsers || 0}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record?: GameRecord) => {
        if (!record) {
          return null;
        }

        const isUserInGame = user &&
          record.currentUsers?.some((u) => u.id === user.id);
        const isGameFull =
          (record.currentUsers?.length || 0) >= record.numberUsers;
        const isGameRunning = record.gameStatus === "RUNNING" ||
          record.gameStatus === "ENDED";
        const canJoin = !isUserInGame && !isGameFull && !isGameRunning;

        if (isUserInGame) {
          return (
            <Button
              type="primary"
              onClick={() => router.push(`/game-lobby/${record.id}`)}
              style={{
                background: "#4f46e5",
                borderColor: "#4f46e5",
              }}
            >
              Resume Game
            </Button>
          );
        }

        return (
          <Button
            type="primary"
            onClick={() => joinGame(record.id)}
            disabled={!canJoin}
            className="join-button"
            style={{
              opacity: canJoin ? 1 : 0.5,
              transition: "all 0.3s",
            }}
          >
            Join Game
          </Button>
        );
      },
    },
  ];

  return (
    <ProtectedRoute>
      <PageLayout requireAuth>
        <div className="game-lobby-container">
          <Card
            title={
              <span className="game-lobby-title">
                Quoridor Game Lobby
              </span>
            }
            extra={
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  type="primary"
                  onClick={fetchGames}
                  className="refresh-btn"
                  style={{
                    background: "#6366f1",
                    borderColor: "#6366f1",
                  }}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  onClick={createGame}
                  loading={creatingGame}
                  className="create-game-btn"
                >
                  New Game
                </Button>
              </div>
            }
            className="game-lobby-card"
          >
            <Table
              columns={columns}
              dataSource={games}
              loading={loading}
              rowKey="id"
              className="game-table"
              bordered
              pagination={false}
              locale={{
                emptyText:
                  "No games available. Create a new game to get started!",
              }}
              style={{
                marginTop: "20px",
                background: "rgba(17, 24, 39, 0.5)",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <Button
                type="default"
                onClick={() => router.push("/game-rules")}
                className="tutorial-btn"
                style={{
                  backgroundColor: "#2563eb",
                  borderColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "500",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  whiteSpace: "nowrap",
                }}
              >
                View Game Rules
              </Button>
              <Button
                type="default"
                onClick={() => router.push("/chatbot")}
                style={{
                  background: "#f59e0b",
                  borderColor: "#f59e0b",
                  color: "#ffffff",
                  fontWeight: "500",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  whiteSpace: "nowrap",
                }}
              >
                Strategy Tips
              </Button>
            </div>
          </Card>
        </div>

        <style jsx global>
          {`
          .game-lobby-container {
            background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
              url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg');
            min-height: 100vh;
            padding: 40px 0;
            background-size: cover;
            background-position: center;
          }

          .game-lobby-title {
            background: linear-gradient(90deg, #8b5cf6, #4f46e5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 1.8rem;
            font-weight: 500;
          }

          .game-lobby-card {
            width: 90% !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
            background: rgba(17, 24, 39, 0.85) !important;
            backdrop-filter: blur(12px) !important;
            border-radius: 20px !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
          }

          .game-table {
            color: #e5e7eb !important;
          }

          .game-table .ant-table-thead > tr > th {
            background: rgba(255, 255, 255, 0.1) !important;
            color: #e5e7eb !important;
            border-bottom: 1px solid rgba(255,255,255,0.2) !important;
          }

          .game-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
            background: transparent !important;
          }

          .create-game-btn {
            background: #4f46e5 !important;
            border-color: #4f46e5 !important;
            font-weight: 500 !important;
          }

          .join-button {
            background: #10b981 !important;
            border-color: #10b981 !important;
          }

          .join-button[disabled] {
            background: #374151 !important;
            border-color: #4b5563 !important;
            color: #6b7280 !important;
          }
        `}
        </style>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default GameLobby;
