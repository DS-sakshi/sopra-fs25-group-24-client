"use client";

import React, { useEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import { Button, Card, Modal, Image } from "antd";
import { PlayCircleOutlined, PictureOutlined } from "@ant-design/icons";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import wallImage1 from './wall1.png';
import wallImage2 from './wall2.png';
import wallImage3 from './wall3.png';

const GameLobby: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isWallModalVisible, setIsWallModalVisible] = useState(false);

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  // Fixed: Changed the structure to match the mapping
  const howToPlaceWall = [
    {src: wallImage1.src, caption: "Click on the green field by the intersection"},
    {src: wallImage2.src, caption: "Choose the direction of the wall"},
    {src: wallImage3.src, caption: "Both players can now see the placed wall"},
  ];  

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
              
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  size="large"
                  href="https://www.youtube.com/watch?v=39T3L6hNfmg"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "#dc2626",
                    borderColor: "#dc2626",
                    borderRadius: "25px",
                    padding: "0 30px",
                    height: "45px",
                    fontSize: "16px",
                    fontWeight: "500",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                  }}
                >
                  Watch Tutorial Video
                </Button>
              </div>

              <p
                style={{
                  fontSize: "1.2rem",
                  lineHeight: "1.8",
                  marginBottom: "25px",
                  textAlign: "center",
                  color: "#e5e7eb",
                }}
              >
                Reach the opposite side before your opponent by moving your pawn or strategically placing walls.
              </p>

              <div className="rules-grid" style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
                gap: "20px",
                marginBottom: "25px"
              }}>
                <div className="rule-card" style={{
                  padding: "20px",
                  backgroundColor: "#374151",
                  borderRadius: "10px",
                  border: "1px solid rgba(16, 185, 129, 0.3)"
                }}>
                  <h3 style={{ color: "#10b981", marginBottom: "10px" }}>🎯 Objective</h3>
                  <p style={{ color: "#e5e7eb", margin: 0 }}>Be the first to reach the opposite side of the board.</p>
                </div>

                <div className="rule-card" style={{
                  padding: "20px",
                  backgroundColor: "#374151",
                  borderRadius: "10px",
                  border: "1px solid rgba(245, 158, 11, 0.3)"
                }}>
                  <h3 style={{ color: "#f59e0b", marginBottom: "10px" }}>👤 Pawn Movement</h3>
                  <p style={{ color: "#e5e7eb", margin: 0 }}>Click on the yellow fields to move. You can go one square horizontally or vertically. Jump over opponent's pawn if possible. Don't forget, if the jump is blocked, you can jump diagonally!</p>
                </div>

                <div className="rule-card" style={{
                  padding: "20px",
                  backgroundColor: "#374151",
                  borderRadius: "10px",
                  border: "1px solid rgba(239, 68, 68, 0.3)"
                }}>
                  <h3 style={{ color: "#ef4444", marginBottom: "10px" }}>🧱 Wall Placement</h3>
                  <p style={{ color: "#e5e7eb", margin: "0 0 10px 0" }}>Place a wall by clicking on the intersection and choosing the direction. Try to block your opponent's path, but never completely trap them! Remember, the wall stretches across two fields.</p>
                  <Button
                    type="link"
                    icon={<PictureOutlined />}
                    onClick={() => setIsWallModalVisible(true)}
                    style={{ 
                      color: "#ef4444", 
                      padding: 0,
                      fontSize: "14px"
                    }}
                  >
                    How to place walls?
                  </Button>
                </div>
              </div>

              <div style={{
                textAlign: "center",
                padding: "20px",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                borderRadius: "10px",
                border: "1px solid rgba(139, 92, 246, 0.3)"
              }}>
                <h3 style={{ color: "#8b5cf6", margin: "0 0 10px 0" }}>💡 Pro Tip</h3>
                <p style={{ color: "#e5e7eb", margin: 0, fontStyle: "italic" }}>
                  Balance between advancing your pawn and blocking your opponent. Sometimes the best move is to place a wall!
                </p>
              </div>
            </div>

            {/* Wall Examples Modal - FIXED */}
            <Modal
              title="How to Place Walls"
              open={isWallModalVisible}
              onCancel={() => setIsWallModalVisible(false)}
              footer={null}
              width={800}
              style={{ top: 20 }}
            >
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "20px" 
              }}>
                {howToPlaceWall.map((imageItem, index) => (
                  <div key={index} style={{ textAlign: "center" }}>
                    <Image
                      src={imageItem.src}
                      alt={`Wall placement step ${index + 1}`}
                      style={{ 
                        borderRadius: "8px",
                        border: "2px solid #374151"
                      }}
                      fallback="/api/placeholder/250/250"
                    />
                    <p style={{ 
                      marginTop: "10px", 
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}>
                      {imageItem.caption}
                    </p>
                  </div>
                ))}
              </div>
              <div style={{ 
                marginTop: "20px", 
                padding: "15px", 
                backgroundColor: "#f3f4f6", 
                borderRadius: "8px" 
              }}>
                <p style={{ 
                  margin: 0, 
                  color: "#374151",
                  fontSize: "14px",
                  fontStyle: "italic"
                }}>
                  💡 Remember: Walls must always leave at least one path open for each player to reach their goal!
                </p>
              </div>
            </Modal>
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

            .rule-card:hover {
              transform: translateY(-2px);
              transition: transform 0.3s ease;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
          `}
        </style>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default GameLobby;