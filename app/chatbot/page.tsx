"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Input, Layout, List, Space, Avatar, Spin } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLayout from "@/components/PageLayout";
import { CommentOutlined, SendOutlined, RobotOutlined, UserOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;

interface Message {
    content: string;
    role: "user" | "assistant";
    id: string;
}

const ChatInterface = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof globalThis !== "undefined") {
            const saved = localStorage.getItem("chatHistory");
            if (saved) {
                setMessages(JSON.parse(saved));
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(messages));
    }, [messages]);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            content: input,
            role: "user",
            id: Date.now().toString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            const response = await fetch("/api/groq-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userMessage: input }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", response.status, errorText);
                throw new Error("Server returned an error response.");
            }

            const text = await response.text();
            const data = text ? JSON.parse(text) : { message: "No response body received" };

            const aiMessage: Message = {
                content: data.message ?? "No response from assistant.",
                role: "assistant",
                id: Date.now().toString(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    content: "Error processing your request",
                    role: "assistant",
                    id: Date.now().toString(),
                },
            ]);
        } finally {
            setLoading(false);
        }

        setInput("");
    };

    return (
        <>
            <style jsx global>{`
                .chat-container {
                    background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
                    url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg');
                    min-height: 100vh;
                    background-size: cover;
                    background-position: center;
                    padding: 40px 0;
                }

                .message-bubble {
                    display: flex;
                    margin-bottom: 16px;
                    max-width: 85%;
                    align-items: flex-start; /* Align items at the top */
                }

                .message-bubble.user {
                    margin-left: auto;
                    flex-direction: row-reverse;
                }

                .message-content {
                    padding: 12px 16px;
                    border-radius: 12px;
                    position: relative;
                    margin: 0 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                }

                .user .message-content {
                    background: linear-gradient(135deg, #4f46e5, #6366f1);
                    color: white;
                    border-top-right-radius: 4px;
                }

                .assistant .message-content {
                    background: linear-gradient(135deg, #f59e0b, #fbbf24);
                    color: #1f2937;
                    border-top-left-radius: 4px;
                }

                .messages-container {
                    height: 450px;
                    overflow-y: auto;
                    padding: 20px;
                    margin-bottom: 20px;
                    background: rgba(17, 24, 39, 0.4);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    background: rgba(251, 191, 36, 0.2);
                    border-radius: 12px;
                    width: fit-content;
                }

                .typing-dot {
                    width: 8px;
                    height: 8px;
                    background: #fbbf24;
                    border-radius: 50%;
                    margin: 0 2px;
                    animation: typing-animation 1.4s infinite ease-in-out;
                }

                .typing-dot:nth-child(1) { animation-delay: 0s; }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes typing-animation {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-5px); }
                }
            `}</style>

            <div className="chat-container">
                <Layout style={{ minHeight: "100vh", background: "transparent" }}>
                    <Content style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
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
                                    Quoridor Strategy Coach
                                </span>
                            }
                            style={{
                                width: "95%",
                                maxWidth: "900px",
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
                                body: {
                                    padding: "24px",
                                }
                            }}
                            extra={
                                <Button
                                    size="middle"
                                    type="primary"
                                    onClick={() => router.push("/game-lobby")}
                                    style={{
                                        background: "rgba(139, 92, 246, 0.9)",
                                        borderColor: "#8b5cf6",
                                        fontWeight: 600
                                    }}
                                >
                                    Return to Lobby
                                </Button>
                            }
                        >
                            {/* Welcome Banner */}
                            <div
                                style={{
                                    background: "linear-gradient(90deg, rgba(79, 70, 229, 0.3), rgba(139, 92, 246, 0.3))",
                                    border: "1px solid rgba(139, 92, 246, 0.5)",
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 24,
                                    color: "#e5e7eb",
                                    fontSize: "1.1rem",
                                    fontWeight: 500,
                                    lineHeight: 1.6,
                                }}
                            >
                                <span role="img" aria-label="maze">🧱</span> <b>Master the maze of walls!</b> Get expert guidance to outsmart your opponent.<br />
                                Need strategic advice for your next <b>Quoridor</b> move? <span role="img" aria-label="lightbulb">💡</span> Our AI coach provides personalized tips, tactics, and winning strategies tailored to your gameplay situation.<br />
                                <b>Start chatting now – elevate your game to the next level!</b> <span role="img" aria-label="target">🎯</span>
                            </div>

                            {/* Messages Container */}
                            <div className="messages-container">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`message-bubble ${msg.role}`}>
                                        <Avatar
                                            icon={msg.role === "user" ? <UserOutlined /> : <RobotOutlined />}
                                            style={{
                                                backgroundColor: msg.role === "user" ? "#4f46e5" : "#f59e0b",
                                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                width: "32px",
                                                height: "32px",
                                                minWidth: "32px", // Prevent compression
                                                flexShrink: 0 // Prevent the avatar from shrinking
                                            }}
                                        />
                                        <div className="message-content">
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="message-bubble assistant">
                                        <Avatar
                                            icon={<RobotOutlined />}
                                            style={{
                                                backgroundColor: "#f59e0b",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                width: "32px",
                                                height: "32px",
                                                minWidth: "32px" // Prevent compression
                                            }}
                                        />
                                        <div className="typing-indicator">
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                            <div className="typing-dot"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div style={{ marginTop: 16 }}>
                                <Space.Compact style={{ width: "100%" }}>
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask for strategy advice..."
                                        onPressEnter={handleSubmit}
                                        prefix={<CommentOutlined style={{ color: "#8b5cf6" }} />}
                                        disabled={loading}
                                        style={{
                                            height: "50px",
                                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                                            borderRadius: "12px 0 0 12px",
                                            fontSize: "16px",
                                            color: "#1f2937",
                                            borderColor: "rgba(139, 92, 246, 0.5)",
                                            paddingLeft: "12px",
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        icon={<SendOutlined />}
                                        style={{
                                            height: "50px",
                                            width: "60px",
                                            background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
                                            borderColor: "#4f46e5",
                                            borderRadius: "0 12px 12px 0",
                                        }}
                                    />
                                </Space.Compact>
                            </div>
                        </Card>
                    </Content>
                </Layout>
            </div>
        </>
    );
};

// Wrap in ProtectedRoute + PageLayout
const ProtectedChatPage = () => (
    <ProtectedRoute>
        <PageLayout>
            <ChatInterface />
        </PageLayout>
    </ProtectedRoute>
);

export default ProtectedChatPage;