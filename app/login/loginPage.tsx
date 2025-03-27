"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Form, Input, message } from "antd";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import PageLayout from "@/components/PageLayout";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push("/users");
    }
  }, [user, loading, router]);

  const handleLogin = async (values: FormFieldProps) => {
    try {
      await login(values.username, values.password);
      message.success("Stellar entry confirmed!");
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Orbital access denied: ${error.message}`);
      } else {
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
              Celestial Gateway
            </span>
          }
          headStyle={{
            borderBottom: "1px solid rgba(92, 119, 235, 0.3)",
            textAlign: "center",
          }}
          style={cosmicStyles.cardStyle}
        >
          <Form
            form={form}
            name="login"
            size="large"
            onFinish={handleLogin}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label={<span style={{ color: "#aab8f5" }}>Stellar Identity</span>}
              rules={[{
                required: true,
                message: "Cosmic credentials required!",
              }]}
            >
              <Input
                placeholder="Enter Identity"
                style={cosmicStyles.inputStyle}
                prefix={
                  <span style={{ color: "#5c77eb", marginRight: 8 }}>✦</span>
                }
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: "#aab8f5" }}>Stellar Key</span>}
              rules={[{ required: true, message: "Stellar lock required!" }]}
            >
              <Input.Password
                placeholder="Enter universal secret"
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
                Initiate Cosmic Connection
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
              Create Stellar Identity
            </Link>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Login;
