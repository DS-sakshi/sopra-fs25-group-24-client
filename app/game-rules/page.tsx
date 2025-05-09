"use client";

import React, { useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { Button, Card } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const GameLobby: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  return (
    <ProtectedRoute>
      <PageLayout requireAuth>
        <div className="game-lobby-container">
          <Card
            title={<span className="game-lobby-title">Game Lobby</span>}
            extra={
              <Button
                type="primary"
                onClick={() => router.push("/game-lobby")}
                className="create-game-btn"
              >
                Go back
              </Button>
            }
            className="game-lobby-card"
          >
            {/* Quoridor Rules Section */}
            <div
              className="quoridor-rules-container"
              style={{
                marginTop: "40px",
                padding: "30px",
                backgroundColor: "#1f2937",
                color: "#ffffff",
                borderRadius: "15px",
                boxShadow: "0px 8px 16px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  fontSize: "2rem",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  color: "#8b5cf6",
                }}
              >
                Quoridor Game Rules
              </h2>
              <p
                style={{
                  fontSize: "1.2rem",
                  lineHeight: "1.8",
                  marginBottom: "20px",
                  textAlign: "justify",
                  color: "#e5e7eb",
                }}
              >
                Quoridor is a strategy board game for two players. The objective
                is to move your pawn to the opposite side of the board before
                your opponent does.
              </p>
              <ul
                style={{
                  listStyleType: "none",
                  paddingLeft: "0",
                  fontSize: "1.1rem",
                  lineHeight: "1.6",
                  color: "#e5e7eb",
                }}
              >
                <li
                  style={{
                    marginBottom: "10px",
                    paddingLeft: "20px",
                    position: "relative",
                    color: "#10b981",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "-2px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#10b981",
                      borderRadius: "50%",
                    }}
                  >
                  </span>
                  Each player starts with a pawn and a set of walls.
                </li>
                <li
                  style={{
                    marginBottom: "10px",
                    paddingLeft: "20px",
                    position: "relative",
                    color: "#f59e0b",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "-2px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#f59e0b",
                      borderRadius: "50%",
                    }}
                  >
                  </span>
                  Players take turns either moving their pawn or placing a wall.
                </li>
                <li
                  style={{
                    marginBottom: "10px",
                    paddingLeft: "20px",
                    position: "relative",
                    color: "#3b82f6",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "-2px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#3b82f6",
                      borderRadius: "50%",
                    }}
                  >
                  </span>
                  Pawns can move one square at a time horizontally or
                  vertically. Jumping over another pawn is allowed if there is
                  an empty space behind it.
                </li>
                <li
                  style={{
                    marginBottom: "10px",
                    paddingLeft: "20px",
                    position: "relative",
                    color: "#ef4444",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "-2px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#ef4444",
                      borderRadius: "50%",
                    }}
                  >
                  </span>
                  Walls are used to block opponents but must not completely
                  block their path to the goal.
                </li>
                <li
                  style={{
                    marginBottom: "10px",
                    paddingLeft: "20px",
                    position: "relative",
                    color: "#f97316",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "-2px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#f97316",
                      borderRadius: "50%",
                    }}
                  >
                  </span>
                  The first player to reach the opposite side wins!
                </li>
              </ul>
            </div>
          </Card>
        </div>

        <style jsx global>
          {`
            .game-lobby-container {
              background: linear-gradient(
                  rgba(0, 0, 0, 0.7),
                  rgba(0, 0, 0, 0.7)
              ),
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
              background-color: rgba(17,24,39,0.85) !important;
            }
          `}
        </style>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default GameLobby;
