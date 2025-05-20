"use client";

import React, { ReactNode, useEffect } from "react";
import { Button, Layout, Spin } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const { Content } = Layout;

interface PageLayoutProps {
    children: ReactNode;
    requireAuth?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
                                                   children,
                                                   requireAuth = false
                                               }) => {
    const { loading, user, logout } = useAuth();
    const router = useRouter();

    // Redirect to login if authentication is required but user is not logged in
    useEffect(() => {
        if (requireAuth && !loading && !user) {
            router.push("/login");
        }
    }, [requireAuth, loading, user, router]);

    // Show loading state while checking authentication
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

    // If authentication is required and user is not logged in, don't render anything
    // (useEffect will handle redirect)
    if (requireAuth && !user) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <Layout style={{ minHeight: "100vh", background: "#16181D" }}>
            {/* Only show navigation header if user is logged in */}
            {user && (
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
                            Users
                        </Link>
                        <Link
                            href="/game-lobby"
                            style={{ color: "white", fontSize: "18px", marginRight: "20px" }}
                        >
                            Game Lobby
                        </Link>
                        <Link
                            href="/leaderboard"
                            style={{ color: "white", fontSize: "18px", marginRight: "20px" }}
                        >
                            Leaderboard
                        </Link>
                    </div>
                    <div>
                        <Button
                            onClick={handleLogout}
                            type="link"
                            style={{ color: "white" }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            )}

            <Content style={{ padding: "20px" }}>
                    {children}
            </Content>
        </Layout>
    );
};

export default PageLayout;