"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Card, Form, Input, message } from "antd";
import "@ant-design/v5-patch-for-react-19";
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

  // If user is already logged in, redirect to users page
  useEffect(() => {
    if (user && !loading) {
      router.push("/users");
    }
  }, [user, loading, router]);

  const handleRegister = async (values: FormFieldProps) => {
    try {
      setError(null); // Clear any previous errors
      await register(values);
      message.success("Registration successful!");
      // Navigation is handled in the auth context
    } catch (error) {
      if (error instanceof Error) {
        // Display error message
        const errorMsg = error.message;
        message.error(`Registration failed: ${errorMsg}`);

        // Completely redirect to a new register page
        // Adding a timestamp to force a fresh page load
        router.push(`/register?refresh=${Date.now()}`);
      } else {
        console.error("An unknown error occurred during registration.");
        message.error("Registration failed due to an unknown error.");

        // Redirect to a new register page
        router.push(`/register?refresh=${Date.now()}`);
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
              Cosmic Connection
            </span>
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
              label={<span style={{ color: "#aab8f5" }}>Stellar Identity</span>}
              rules={[{
                required: true,
                message: "Cosmic credentials required!",
              }]}
            >
              <Input
                placeholder="Enter Stellar Identity"
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
              label={<span style={{ color: "#aab8f5" }}>Stellar Key</span>}
              rules={[{
                required: true,
                message: "Gravitational lock required!",
              }]}
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
                Register
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
