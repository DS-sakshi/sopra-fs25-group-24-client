"use client";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Card, Form, Input, message } from "antd";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useState } from "react"; // Add to your imports


interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push("/game-lobby");
    }
  }, [user, loading, router]);

const handleLogin = async (values: FormFieldProps) => {
  try {
    setError(null); // Clear previous errors
    await login(values.username, values.password);
    message.success("Cosmic entry confirmed!");
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
      message.error(`Cosmic access denied: ${error.message}`);
    } else {
      setError("Cosmic interference detected. Try again!");
      message.error("Cosmic interference detected. Try again!");
    }
  }
};


  // Cosmic theme styles
  const cosmicStyles = {
    pageBackground: {
      background: "linear-gradient(45deg, #0b0f2c 0%, #1a1f4d 100%)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
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
                Login
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
    message="Login Error"
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
            name="login"
            size="large"
            onFinish={handleLogin}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label={<span style={{ color: "#aab8f5" }}>Username</span>}
              rules={[{
                required: true,
                message: "Cosmic credentials required!",
              }]}
            >
              <Input
                placeholder="Enter Username"
                style={cosmicStyles.inputStyle}
                prefix={
                  <span style={{ color: "#5c77eb", marginRight: 8 }}>✦</span>
                }
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: "#aab8f5" }}>Word of Passing</span>}
              rules={[{ required: true, message: "Cosmic lock required!" }]}
            >
              <Input.Password
                placeholder="!(You shall not pass)"
                style={cosmicStyles.inputStyle}
                prefix={
                  <span style={{ color: "#5c77eb", marginRight: 8 }}>🔑</span>
                }
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    e.preventDefault();
                  }
              }}
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
                Enter the matrix
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
            New to the cosmos?{" "}
            <Link
              href="/register"
              style={{
                color: "#5c77eb",
                fontWeight: "500",
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            >
              Register
            </Link>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Login;
