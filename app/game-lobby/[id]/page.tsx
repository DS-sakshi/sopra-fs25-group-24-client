"use client";

import React, { useEffect, useState } from "react";
import { Card, Button, message } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";

interface GameDetailProps {
  params: {
    gameId: string;
  };
}

const GameDetail: React.FC<GameDetailProps> = ({ params }) => {
  const { user } = useAuth();
  const router = useRouter();
  const apiService = useApi();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGame = async () => {
    try {
      const response = await apiService.get<Game>(`/game-lobby/${params.gameId}`);
      setGame(response);
    } catch (error) {
      message.error("Failed to fetch game details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [params.gameId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <PageLayout requireAuth>
        <div
          style={{
            background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg')`,
            minHeight: "100vh",
            padding: "40px 0",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Card
            title={
              <span
                style={{
                  background: "linear-gradient(90deg, #8b5cf6, #4f46e5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "1.8rem",
                  fontWeight: 500,
                }}
              >
                Game Room {params.gameId}
              </span>
            }
            style={{
              width: "90%",
              maxWidth: "1200px",
              margin: "0 auto",
              background: "rgba(17, 24, 39, 0.85)",
              backdropFilter: "blur(12px)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            headStyle={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            {game && (
              <div style={{ color: "#e5e7eb" }}>
                <h3>Status: {game.status}</h3>
                <h4>Players:</h4>
                <ul>
                  {game.players.map((playerId) => (
                    <li key={playerId}>{playerId}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default GameDetail;