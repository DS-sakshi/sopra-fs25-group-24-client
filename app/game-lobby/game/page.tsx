"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Button, Card, Descriptions, message, Spin, Tag, Alert } from "antd";
import { ArrowLeftOutlined, CloseCircleOutlined } from "@ant-design/icons";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

interface QuoridorGame {
  id: string;
  player1: string;
  player2: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  winner?: string;
  // Add other game properties as needed
}

export default function GameRoomPage() {
  const params = useParams();
  const gameId = params.id as string;
  const router = useRouter();
  const apiService = useApi();
  const { user: currentUser } = useAuth();
  const [game, setGame] = useState<QuoridorGame | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        setError(null);
        /*const data: QuoridorGame = await apiService.get(`/game-lobby/${gameId}`);
        
        if (!data?.id) {
          console.error("Game not found");
          message.error("Could not retrieve game. Please try again.");
        }

        // Check if game is finished
        //if (data.status === 'FINISHED' && !game?.winner) {
         // router.push('/game-lobby');
        //  return;
        //}

        setGame(data);
        */

      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load game session");
        message.error("Failed to load game session");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
    
    // Setup polling to check game state periodically
    const interval = setInterval(fetchGame, 5000);
    return () => clearInterval(interval);
  }, [gameId, apiService]);

  const handleAbortGame = async () => {
    try {
      await apiService.delete(`/game-lobby/${gameId}`);
      message.success("Game aborted successfully");
      router.push("/game-lobby");
      //change state to FINISHED
    } catch (error) {
      message.error("Failed to abort game");
    }
  };

  // Only redirect if game is finished
  //useEffect(() => {
   // if (game?.status === 'FINISHED') {
   //   router.push('/game-lobby');
   // }
  //}, [game?.status]);

  return (

      <PageLayout requireAuth>
        <div style={{ padding: "40px 20px", minHeight: "100vh" }}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push('/game-lobby')}
                  type="text"
                />
                <span style={{ fontSize: '1.4em' }}>
                  Game Room {gameId}
                </span>
              </div>
            }
            loading={loading}
            style={{ maxWidth: 1200, margin: '0 auto' }}
            extra={
              game?.status === 'IN_PROGRESS' && (
                <Button
                  type="primary"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleAbortGame}
                >
                  Abort Game
                </Button>
              )
            }
          >
            {error ? (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{
                      marginBottom: 20,
                      backgroundColor: "#fde2e2", // Hellrot / Rosa Hintergrund
                      color: "#611a15",           // Dunkler Rotton für die Schrift
                      borderColor: "#f5c6cb",     // Passend zum Hintergrund
                    }}
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
                <Descriptions bordered>
                  <Descriptions.Item label="Status">
                    <Tag color={game.status === 'IN_PROGRESS' ? 'green' : 'orange'}>
                      {game.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Player 1">
                    {game.player1}
                  </Descriptions.Item>
                  <Descriptions.Item label="Player 2">
                    {game.player2 || 'Waiting...'}
                  </Descriptions.Item>
                </Descriptions>

                {/* Game board visualization */}
                <div style={{ 
                  marginTop: 20,
                  height: 400,
                  background: '#f0f2f5',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {game.status === 'FINISHED' ? (
                    <h2>{game.winner ? `${game.winner} wins!` : 'Game Over'}</h2>
                  ) : (
                    'Game Board Visualization'
                  )}
                </div>
              </div>
            ) : (
                //Game implementation Tobias
                <Card>
                  {
                    <>
                      <Spin tip="Loading game..." />
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
                              gridTemplateColumns: 'repeat(9, 50px)',
                              gridTemplateRows: 'repeat(9, 50px)',
                              width: '450px',
                              height: '450px',
                            }}
                        >
                          {Array.from({ length: 81 }).map((_, index) => {
                            const row = Math.floor(index / 9);
                            const col = index % 9;
                            const isBlack = (row + col) % 2 === 1;
                            return (
                                <div
                                    key={index}
                                    style={{
                                      width: '50px',
                                      height: '50px',
                                      background: isBlack ? 'black' : 'white',
                                    }}
                                />
                            );
                          })}
                        </div>
                      </div>
                    </>
                  }
                </Card>

            )}
          </Card>
        </div>
      </PageLayout>

  );
}
