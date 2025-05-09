"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Input, Layout, List } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { Space } from "antd";
import { useRouter } from "next/navigation";

//import { router } from "next/client";

const { Header, Content } = Layout;

interface Message {
  content: string;
  role: "user" | "assistant";
  id: string;
}



const ChatInterface = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();

  // Load chat history only on client
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

        try {
            const response = await fetch("/api/groq-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userMessage: input }),
            });

            const data = await response.json();

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
        }

        setInput("");
    };

    return (
    <>
      <style jsx global>
        {`
            .game-lobby-container {
                background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
                    url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg');
                min-height: 100vh;
                background-size: cover;
                background-position: center;
            }

            .message {
                color: #ffffff;
                font-weight: 500;
                padding: 8px 12px;
                border-radius: 8px;
                max-width: 70%;
                word-wrap: break-word;
            }

            .message.user {
                background: #2563eb;
                align-self: flex-end;
            }

            .message.assistant {
                background: #f59e0b;
                align-self: flex-start;
            }
        `}
      </style>

      <div className="game-lobby-container">
        <Layout style={{ minHeight: "100vh", background: "transparent" }}>
          <Header
            style={{
              color: "white",
              background: "#001529",
              fontSize: "1.5rem",
            }}
          >
            Quoridor Strategy Tips
          </Header>
          <Content
            style={{
              padding: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
              <Card
                  style={{
                      width: "100%",
                      maxWidth: 800,
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      borderRadius: "12px",
                  }}
              >
                  <Button
                      size="middle"
                      type="primary"
                      onClick={() => router.push("/game-lobby")}
                  >
                      Return to Lobby
                  </Button>

                  {/* --- Intro Text Block START --- */}
                  <div
                      style={{
                          background: "rgba(37, 99, 235, 0.15)",
                          border: "1px solid #2563eb",
                          borderRadius: 8,
                          padding: 16,
                          margin: "24px 0",
                          color: "#fff",
                          fontSize: "1.1rem",
                          fontWeight: 500,
                          textAlign: "center",
                          lineHeight: 1.6,
                      }}
                  >
                      <span role="img" aria-label="maze">🧱</span> <b>Stuck in a maze of walls?</b> Let’s outsmart your opponent!<br />
                      Need a clever move or curious about winning strategies in <b>Quoridor</b>? <span role="img" aria-label="lightbulb">💡</span> Chat with our strategy bot for quick tips, move suggestions, and smart tactics to gain the upper hand.<br />
                      Whether you're a beginner or a seasoned player, your next brilliant play is just a message away!<br /><br />
                      <b>Start chatting now – your winning move is waiting.</b> <span role="img" aria-label="target">🎯</span>
                  </div>
                  {/* --- Intro Text Block END --- */}

                  <List
                      dataSource={messages}
                      renderItem={(item) => (
                          <List.Item
                              style={{
                                  display: "flex",
                                  justifyContent: item.role === "user"
                                      ? "flex-end"
                                      : "flex-start",
                              }}
                          >
                              <div className={`message ${item.role}`}>
                                  {item.content}
                              </div>
                          </List.Item>
                      )}
                  />
                  <div style={{ marginTop: 24 }}>
                      <Space.Compact style={{ width: "100%" }}>
                          <Input
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Type your message..."
                              onPressEnter={handleSubmit}
                              style={{
                                  width: "calc(100% - 100px)",
                                  backgroundColor: "#ffffff",
                                  borderRadius: "5px",
                              }}
                          />
                          <Button
                              type="primary"
                              onClick={handleSubmit}
                              style={{
                                  width: 100,
                                  backgroundColor: "#2563eb",
                                  borderColor: "#2563eb",
                                  color: "#ffffff",
                                  fontWeight: "500",
                                  borderRadius: "5px",
                              }}
                          >
                              Send
                          </Button>
                      </Space.Compact>
                  </div>
              </Card>
          </Content>
        </Layout>
      </div>
    </>
  );
};

export default ChatInterface;
