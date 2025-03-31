"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, message, Table } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";

const GameLobby: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const apiService = useApi();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Current user:", user);
    console.log("Current games:", games);
  }, [user, games]);

  // Fetch games from the API
  const fetchGames = async () => {
    try {
      const response = await apiService.get<Game[]>("/game-lobby");
      setGames(response);
    } catch (error) {
      message.error("Failed to fetch games");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async () => {
    try {
      setLoading(true);
      // Fixed the API endpoint - removed $response.id which was causing issues
      const response = await apiService.post<Game>("/game-lobby", {
        userId: user?.id,
        username: user?.username,
      });

      if (response?.id) {
        message.success("Game created successfully!");
        // Using router.push without replace to avoid forced redirections
        router.push(`/game-lobby/${response.id}`);
      } else {
        throw new Error("No game ID received");
      }
    } catch (error) {
      console.error("Game creation failed:", error);
      message.error("Could not create game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: string) => {
    try {
      await apiService.put(`/game-lobby/${gameId}/join`, { user });
      message.success("Joined game successfully!");
      // Using router.push without replace to avoid forced redirections
      router.push(`/game-lobby/${gameId}`);
    } catch (error) {
      message.error("Failed to join game");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const columns = [
    {
      title: "Game ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span style={{ color: "#e5e7eb" }}>{text}
      </span>,
    },
    {
      title: "Creator",
      dataIndex: "creatorId",
      key: "creatorId",
      render: (text: string) => <span style={{ color: "#e5e7eb" }}>{text}
      </span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => <span style={{ color: "#e5e7eb" }}>{text}
      </span>,
    },
    {
      title: "Players",
      dataIndex: "players",
      key: "players",
      render: (players: string[]) => (
        <span style={{ color: "#e5e7eb" }}>{players?.length || 0}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Game) => {
        const isDisabled = user && record.players &&
          record.players.includes(user.id);
        return (
          <Button
            type="primary"
            onClick={() => joinGame(record.id)}
            disabled={!!isDisabled}
            className="join-button"
            style={{
              display: isDisabled ? "none" : "inline-block",
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
                Game Lobby
              </span>
            }
            extra={
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  type="primary"
                  onClick={createGame}
                  className="create-game-btn"
                >
                  Create New Game
                </Button>
                <Button
                  type="default"
                  onClick={() => router.push("/chatbot")}
                  style={{
                    background: "#f59e0b",
                    borderColor: "#f59e0b",
                    color: "#ffffff",
                    fontWeight: "500",
                  }}
                >
                  Game Rules
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
                emptyText: "No games available",
              }}
              style={{
                marginTop: "20px",
                background: "rgba(17, 24, 39, 0.5)",
              }}
              onRow={(record) => ({
                onClick: () => console.log("Row clicked:", record),
              })}
            />
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
