"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spin } from "antd";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } // Protect both game-lobby and specific game routes
      else if (
        pathname.startsWith("/game-lobby")
      ) {
        if (!user.token) { // Check for valid authentication token
          router.push("/login");
          return;
        }

        // For specific game routes, verify game access
        /* if (pathname.startsWith("/game/")) {
          const gameId = pathname.split("/")[2];
          if (gameId) {
            fetch(`/api/game-lobby/${gameId}`, {
              headers: {
                "Authorization": `Bearer ${user.token}`,
              },
            }).catch(() => router.push("/game-lobby"));
          }
        } */
      }
    }
  }, [loading, user, router, pathname]);

  // Rest of the component remains the same
  if (loading) {
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
          <div style={{ minHeight: "100px" }} />
        </Spin>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
