import React, { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spin } from "antd";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user || !user.token) {
                router.replace("/login");
            }
        }
    }, [loading, user, router, pathname]);

    if (loading || !user || !user.token) {
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
                    <div style={{ minHeight: 100 }} />
                </Spin>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
