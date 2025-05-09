"use client";
import React, { useEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Card, message, Spin, Table, Tag, Progress, Tooltip, Avatar } from "antd";
import type { TableProps } from "antd";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CrownFilled, TrophyFilled, StarFilled } from "@ant-design/icons";

// Helper: Medal icon for top 3
const getMedal = (rank: number) => {
  if (rank === 0) return <CrownFilled style={{ color: "#FFD700", fontSize: 22 }} />;
  if (rank === 1) return <TrophyFilled style={{ color: "#C0C0C0", fontSize: 20 }} />;
  if (rank === 2) return <StarFilled style={{ color: "#CD7F32", fontSize: 18 }} />;
  return null;
};

const columns: TableProps<User>["columns"] = [
  {
    title: "#",
    dataIndex: "rank",
    key: "rank",
    align: "center",
    render: (_: any, __: User, idx: number) => (
        <span style={{ fontWeight: 700, fontSize: 18 }}>
        {getMedal(idx) || idx + 1}
      </span>
    ),
    width: 60,
  },
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
    render: (text) => (
        <span style={{
          color: "#a78bfa",
          fontWeight: 500,
          fontSize: 16,
          letterSpacing: 0.5,
        }}>{text}</span>
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => (
        <span style={{ color: "#e5e7eb" }}>{text}</span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => (
        <Tag color={status === "ONLINE" ? "#4f46e5" : "#6b7280"} style={{ fontWeight: 600 }}>
          {status}
        </Tag>
    ),
  },
  {
    title: "Games Played",
    dataIndex: "totalGamesPlayed",
    key: "totalGamesPlayed",
    align: "center",
    render: (val) => <span style={{ color: "#fbbf24", fontWeight: 600 }}>{val}</span>,
  },
  {
    title: "Games Won",
    dataIndex: "totalGamesWon",
    key: "totalGamesWon",
    align: "center",
    render: (val) => <span style={{ color: "#34d399", fontWeight: 600 }}>{val}</span>,
  },
  {
    title: "Games Lost",
    dataIndex: "totalGamesLost",
    key: "totalGamesLost",
    align: "center",
    render: (val) => <span style={{ color: "#f87171", fontWeight: 600 }}>{val}</span>,
  },
  {
    title: "Win Rate",
    key: "winRate",
    align: "center",
    render: (_, record: User) => {
      const { totalGamesPlayed, totalGamesWon } = record;
      const rate = totalGamesPlayed ? Math.round((totalGamesWon / totalGamesPlayed) * 100) : 0;
      return (
          <Tooltip title={`${rate}%`}>
            <Progress
                percent={rate}
                size="small"
                strokeColor={rate > 60 ? "#34d399" : rate > 30 ? "#fbbf24" : "#f87171"}
                showInfo={false}
                style={{ minWidth: 60 }}
            />
          </Tooltip>
      );
    },
  },
  {
    title: "Creation Date",
    dataIndex: "creationDate",
    key: "creationDate",
    render: (date) => (
        date ? new Date(date).toLocaleDateString() : "N/A"
    ),
    align: "center",
  },
];

// Podium component for top 3 players
const TopPlayersPodium = ({ users }: { users: User[] }) => {
  if (!users || users.length < 3) return null;

  const podiumUsers = users.slice(0, 3);
  const [second, first, third] = [podiumUsers[1], podiumUsers[0], podiumUsers[2]];

  // Calculate win rates
  const getWinRate = (user: User) => {
    return user.totalGamesPlayed
        ? Math.round((user.totalGamesWon / user.totalGamesPlayed) * 100)
        : 0;
  };

  return (
      <div className="podium-container" style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        marginBottom: "40px",
        height: "280px"
      }}>
        {/* Second Place */}
        <div className="podium-player" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginRight: "10px"
        }}>
          <Avatar size={80} style={{
            backgroundColor: "#d1d5db",
            border: "3px solid #C0C0C0",
            marginBottom: "10px"
          }}>
            {second.username.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 600, color: "#a78bfa" }}>{second.username}</div>
            <div style={{ color: "#e5e7eb" }}>{second.name}</div>
            <div style={{ color: "#34d399", fontWeight: 600 }}>Won: {second.totalGamesWon}</div>
            <div style={{ color: "#fbbf24" }}>WR: {getWinRate(second)}%</div>
          </div>
          <div className="podium-block" style={{
            width: "120px",
            height: "80px",
            background: "linear-gradient(0deg, #d1d5db, #9ca3af)",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "10px"
          }}>
            <TrophyFilled style={{ color: "#C0C0C0", fontSize: 32 }} />
          </div>
        </div>

        {/* First Place */}
        <div className="podium-player" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10
        }}>
          <Avatar size={100} style={{
            backgroundColor: "#fbbf24",
            border: "4px solid #FFD700",
            marginBottom: "10px"
          }}>
            {first.username.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#a78bfa" }}>{first.username}</div>
            <div style={{ color: "#e5e7eb", fontSize: "16px" }}>{first.name}</div>
            <div style={{ color: "#34d399", fontWeight: 700 }}>Won: {first.totalGamesWon}</div>
            <div style={{ color: "#fbbf24", fontWeight: 600 }}>WR: {getWinRate(first)}%</div>
          </div>
          <div className="podium-block" style={{
            width: "140px",
            height: "120px",
            background: "linear-gradient(0deg, #fbbf24, #f59e0b)",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "10px"
          }}>
            <CrownFilled style={{ color: "#FFD700", fontSize: 42 }} />
          </div>
        </div>

        {/* Third Place */}
        <div className="podium-player" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginLeft: "10px"
        }}>
          <Avatar size={70} style={{
            backgroundColor: "#f59e42",
            border: "3px solid #CD7F32",
            marginBottom: "10px"
          }}>
            {third.username.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#a78bfa" }}>{third.username}</div>
            <div style={{ color: "#e5e7eb" }}>{third.name}</div>
            <div style={{ color: "#34d399", fontWeight: 600 }}>Won: {third.totalGamesWon}</div>
            <div style={{ color: "#fbbf24" }}>WR: {getWinRate(third)}%</div>
          </div>
          <div className="podium-block" style={{
            width: "110px",
            height: "60px",
            background: "linear-gradient(0deg, #f59e42, #d97706)",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "10px"
          }}>
            <StarFilled style={{ color: "#CD7F32", fontSize: 26 }} />
          </div>
        </div>
      </div>
  );
};

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let users: User[] = await apiService.get<User[]>("/users");
        // Sort by games won desc, then games played desc
        users = users.sort((a, b) =>
            b.totalGamesWon - a.totalGamesWon ||
            b.totalGamesPlayed - a.totalGamesPlayed
        );
        setUsers(users);
      } catch (error) {
        if (error instanceof Error) {
          message.error(`Failed to fetch users: ${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiService]);

  return (
      <ProtectedRoute>
        <PageLayout requireAuth>
          <div
              style={{
                background:
                    `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg')`,
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
                        background: "linear-gradient(90deg, #fbbf24, #8b5cf6, #4f46e5)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontSize: "2rem",
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                  >
                🌟 Quoridor Leaderboard
              </span>
                }
                loading={loading}
                style={{
                  width: "95%",
                  maxWidth: "1300px",
                  margin: "0 auto",
                  background: "rgba(17, 24, 39, 0.90)",
                  backdropFilter: "blur(14px)",
                  borderRadius: "24px",
                  border: "1.5px solid rgba(255,255,255,0.09)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                }}
                styles={{
                  header: {
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                  },
                }}
            >
              {users ? (
                  <>
                    {/* Podium display for top 3 players */}
                    <TopPlayersPodium users={users} />

                    {/* Table for all players */}
                    <Table<User>
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        pagination={false}
                        onRow={(row) => ({
                          onClick: () => router.push(`/users/${row.id}`),
                          style: {
                            cursor: "pointer",
                            background: "rgba(31, 41, 55, 0.5)",
                            color: "#e5e7eb",
                            transition: "background 0.2s",
                          },
                        })}
                        components={{
                          header: {
                            cell: (props) => (
                                <th
                                    style={{
                                      background: "rgba(55, 65, 81, 0.93)",
                                      color: "#e5e7eb !important",
                                      borderBottom: "1px solid rgba(255,255,255,0.13)",
                                      fontWeight: 700,
                                      fontSize: 15,
                                      letterSpacing: 0.5,
                                    }}
                                >
                                  {props.children}
                                </th>
                            ),
                          },
                        }}
                        className="leaderboard-table"
                        rowClassName={(_, idx) =>
                            idx === 0
                                ? "leaderboard-row-gold"
                                : idx === 1
                                    ? "leaderboard-row-silver"
                                    : idx === 2
                                        ? "leaderboard-row-bronze"
                                        : ""
                        }
                        style={{
                          color: "#e5e7eb",
                          borderRadius: "12px",
                          overflow: "hidden"
                        }}
                    />
                  </>
              ) : (
                  <Spin
                      tip="Gathering Stellar Data..."
                      style={{ color: "#8b5cf6", margin: "40px 0" }}
                  />
              )}
            </Card>
            <style jsx global>{`
              .leaderboard-row-gold {
                background: linear-gradient(90deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.1)) !important;
              }
              .leaderboard-row-gold td {
                background: transparent !important;
                border-bottom: 1px solid rgba(251, 191, 36, 0.3) !important;
              }
              .leaderboard-row-gold td:first-child {
                background: rgba(251, 191, 36, 0.4) !important;
                border-left: 4px solid #fbbf24 !important;
              }

              .leaderboard-row-silver {
                background: linear-gradient(90deg, rgba(209, 213, 219, 0.3), rgba(209, 213, 219, 0.1)) !important;
              }
              .leaderboard-row-silver td {
                background: transparent !important;
                border-bottom: 1px solid rgba(209, 213, 219, 0.3) !important;
              }
              .leaderboard-row-silver td:first-child {
                background: rgba(209, 213, 219, 0.4) !important;
                border-left: 4px solid #d1d5db !important;
              }

              .leaderboard-row-bronze {
                background: linear-gradient(90deg, rgba(245, 158, 66, 0.3), rgba(245, 158, 66, 0.1)) !important;
              }
              .leaderboard-row-bronze td {
                background: transparent !important;
                border-bottom: 1px solid rgba(245, 158, 66, 0.3) !important;
              }
              .leaderboard-row-bronze td:first-child {
                background: rgba(245, 158, 66, 0.4) !important;
                border-left: 4px solid #f59e42 !important;
              }

              .ant-table-tbody > tr:hover > td {
                background: rgba(139, 92, 246, 0.15) !important;
              }
            `}</style>
          </div>
        </PageLayout>
      </ProtectedRoute>
  );
};

export default Dashboard;