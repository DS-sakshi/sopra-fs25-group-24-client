"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spin } from "antd";

interface ProtectedRouteProps {
  children: React.ReactNode; //Children elements to be rendered
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter(); //Router hook to access Next.js router
  //Check if user is logged in and redirect to login page if not
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);
  //Show loading state while checking authentication
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
          <div style={{ minHeight: "100px" }} /> {/* Placeholder content */}
        </Spin>
      </div>
    );
  }
  //If user is not logged in, return null
  if (!user) {
    return null; // Router will redirect, but this prevents flash of content
  }

  return <>{children}</>;
};

export default ProtectedRoute;
