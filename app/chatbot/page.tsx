"use client";

import React from "react";
import { Button, Card } from "antd";
import { useRouter } from "next/navigation";

const ChatbotPage: React.FC = () => {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #1e293b, #0f172a)",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <Card
        title="Game Rules"
        style={{
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
          background: "rgba(17, 24, 39, 0.85)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <p style={{ color: "#e5e7eb", fontSize: "16px", lineHeight: "1.6" }}>
          Welcome to the Quoridor Game! Here are the rules:
        </p>
        <ul style={{ color: "#e5e7eb", textAlign: "left" }}>
          <li>
            Each player must move their pawn to the opposite side of the board.
          </li>
          <li>Players can place walls to block their opponent's path.</li>
          <li>Walls cannot completely block all paths to the goal.</li>
          <li>The first player to reach the opposite side wins!</li>
        </ul>
        <Button
          type="primary"
          onClick={() => router.push("/game-lobby")}
          style={{
            marginTop: "20px",
            background: "#4f46e5",
            borderColor: "#4f46e5",
          }}
        >
          Back
        </Button>
      </Card>
    </div>
  );
};

export default ChatbotPage;
