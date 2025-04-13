"use client";

import React, { ReactNode } from "react";
import { Button, Layout, Spin } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const { Content } = Layout; //Destructure Context from Layout

interface PageLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}
//props for PageLayout to indicate if authentication is required
const PageLayout: React.FC<PageLayoutProps> = (
  { children, requireAuth = false }, //Children elements to be rendered
) => {
  const { loading, user, logout } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (requireAuth && loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading...">
          <div style={{ minHeight: "100px" }} /> {/* Placeholder content */}
        </Spin>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#16181D" }}>
      {/* Simple navigation header */}
      <div
        style={{
          padding: "10px 20px",
          background: "#001529",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Link
            href="/users"
            style={{ color: "white", fontSize: "18px", marginRight: "20px" }}
          >
            Home
          </Link>
          <Link
            href="/game-lobby"
            style={{ color: "white", fontSize: "18px", marginRight: "20px" }}
          >
            Game Lobby
          </Link>
        </div>
        <div>
          {user && (
            <Button
              onClick={handleLogout}
              type="link"
              style={{ color: "white" }}
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      <Content style={{ padding: "20px" }}>
        {children}
      </Content>
    </Layout>
  );
};

export default PageLayout;
