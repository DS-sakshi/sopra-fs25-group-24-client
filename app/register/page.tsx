"use client";

import { useRouter } from "next/navigation";
import "@ant-design/v5-patch-for-react-19";
import Link from "next/link";
import { Alert, Button, Card, Form, Input, message } from "antd";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";

interface FormFieldProps {
    username: string;
    name: string;
    password: string;
    birthday?: Date;
}

const Register: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const { register, user, loading } = useAuth();
    const [error, setError] = useState<string | null>(null);

    // Use Ant Design's message hook for context-aware messages
    const [messageApi, contextHolder] = message.useMessage();

    // Redirect if already logged in
    useEffect(() => {
        if (user && !loading) {
            router.push("/game-lobby");
        }
    }, [user, loading, router]);

    const handleRegister = async (values: FormFieldProps) => {
        try {
            setError(null);
            await register(values);
            messageApi.success({
                content: "Registration successful!",
                className: "custom-dark-blue-message"
            });
            router.push("/game-lobby");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
                messageApi.error({
                    content: `Registration failed: ${error.message}`,
                    className: "custom-dark-blue-message"
                });
            } else {
                setError("Registration failed due to an unknown error.");
                messageApi.error({
                    content: "Registration failed due to an unknown error.",
                    className: "custom-dark-blue-message"
                });
            }
        }
    };

    // Cosmic theme styles
    const cosmicStyles = {
        cardStyle: {
            width: 400,
            background: "rgba(11, 15, 44, 0.9)",
            border: "1px solid rgba(92, 119, 235, 0.3)",
            borderRadius: "15px",
            boxShadow: "0 0 30px rgba(92, 119, 235, 0.2)",
            backdropFilter: "blur(10px)",
        },
        inputStyle: {
            background: "rgba(11, 15, 44, 0.7)",
            border: "1px solid rgba(92, 119, 235, 0.3)",
            color: "#e0e6ff",
            "&:focus": {
                borderColor: "#5c77eb",
                boxShadow: "0 0 8px rgba(92, 119, 235, 0.3)",
            },
        },
        buttonStyle: {
            background: "linear-gradient(135deg, #3b4d9e 0%, #5c77eb 100%)",
            border: "none",
            fontWeight: "600",
            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            "&:hover": {
                background: "linear-gradient(135deg, #5c77eb 0%, #3b4d9e 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 15px rgba(92, 119, 235, 0.4)",
            },
        },
    };

    return (
        <PageLayout>
            {/* Message context holder for AntD messages */}
            {contextHolder}
            <div
                style={{
                    padding: "80px 0",
                    background:
                        `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Card
                    title={
                        <div>
                            <div
                                style={{
                                    color: "#e0e6ff",
                                    fontSize: "2.4em",
                                    fontWeight: "800",
                                    textAlign: "center",
                                    marginBottom: "0.9em",
                                    letterSpacing: "0.01em",
                                    textShadow: "0 3px 8px rgba(0,0,0,0.25)",
                                    background:
                                        "linear-gradient(45deg, #aab8f5 10%, #5c77eb 90%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                Register
                            </div>
                            <span
                                style={{
                                    color: "#e0e6ff",
                                    fontSize: "1.8em",
                                    fontWeight: "600",
                                    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    background: "linear-gradient(45deg, #5c77eb, #aab8f5)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                Quoridor online
              </span>
                            <div
                                style={{
                                    fontSize: "0.95em",
                                    color: "#aab8f5",
                                    fontStyle: "italic",
                                    marginTop: "0.25em",
                                    textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                                    marginBottom: "0.9em",
                                }}
                            >
                                The passage to the other side
                            </div>
                        </div>
                    }
                    styles={{
                        header: {
                            borderBottom: "1px solid rgba(92, 119, 235, 0.3)",
                            textAlign: "center",
                        },
                    }}
                    style={cosmicStyles.cardStyle}
                >
                    {error && (
                        <Alert
                            message="Registration Error"
                            description={error}
                            type="error"
                            showIcon
                            style={{
                                marginBottom: "16px",
                                background: "rgba(255, 0, 0, 0.1)",
                                border: "none",
                            }}
                        />
                    )}

                    <Form
                        form={form}
                        name="register"
                        size="large"
                        onFinish={handleRegister}
                        layout="vertical"
                    >
                        <Form.Item
                            name="username"
                            label={<span style={{ color: "#aab8f5" }}>Username</span>}
                            rules={[
                                {
                                    required: true,
                                    message: "Cosmic credentials required!",
                                },
                            ]}
                        >
                            <Input
                                placeholder="Enter a unique Username"
                                style={cosmicStyles.inputStyle}
                                prefix={
                                    <span style={{ color: "#5c77eb", marginRight: 8 }}>✦</span>
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label={<span style={{ color: "#aab8f5" }}>Name</span>}
                            rules={[{ required: true, message: "Please input your name!" }]}
                        >
                            <Input
                                placeholder="Enter name"
                                style={cosmicStyles.inputStyle}
                                prefix={
                                    <span style={{ color: "#5c77eb", marginRight: 8 }}>👤</span>
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span style={{ color: "#aab8f5" }}>Word of Passing</span>}
                            rules={[
                                {
                                    required: true,
                                    message: "Gravitational lock required!",
                                },
                            ]}
                        >
                            <Input.Password
                                placeholder="Enter an universal secret"
                                style={cosmicStyles.inputStyle}
                                prefix={
                                    <span style={{ color: "#5c77eb", marginRight: 8 }}>🔑</span>
                                }
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                style={cosmicStyles.buttonStyle}
                            >
                                Into the Matrix
                            </Button>
                        </Form.Item>
                    </Form>

                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "20px",
                            color: "#aab8f5",
                        }}
                    >
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            style={{
                                color: "#5c77eb",
                                fontWeight: "500",
                                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                            }}
                        >
                            Login here
                        </Link>
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
};

export default Register;
