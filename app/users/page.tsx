"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Card, message, Spin, Table, Tag } from "antd";
import type { TableProps } from "antd";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
    render: (text) => <a style={{ color: "#9f7aea" }}>{text}</a>,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag color={status === "ONLINE" ? "#4f46e5" : "#6b7280"}>
        {status}
      </Tag>
    ),
  },
  {
    title: "Creation Date",
    dataIndex: "creationDate",
    key: "creationDate",
    render: (date) => (
      date ? new Date(date).toLocaleDateString() : "N/A"
    ),
  },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const users: User[] = await apiService.get<User[]>("/users");
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
              `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg')`,
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
                Stellar Users
              </span>
            }
            loading={loading}
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
            {users
              ? (
                <Table<User>
                  columns={columns}
                  dataSource={users}
                  rowKey="id"
                  onRow={(row) => ({
                    onClick: () => router.push(`/users/${row.id}`),
                    style: {
                      cursor: "pointer",
                      background: "rgba(31, 41, 55, 0.5)",
                      color: "#e5e7eb",
                    },
                  })}
                  components={{
                    header: {
                      cell: (props) => (
                        <th
                          style={{
                            background: "rgba(55, 65, 81, 0.9)",
                            color: "#e5e7eb !important",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            fontWeight: 600,
                          }}
                        >
                          {props.children}
                        </th>
                      ),
                    },
                  }}
                  rowClassName={() => "hover-row"}
                  style={{ color: "#e5e7eb" }}
                />
              )
              : (
                <Spin
                  tip="Gathering Stellar Data..."
                  style={{ color: "#8b5cf6", margin: "40px 0" }}
                />
              )}
          </Card>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
