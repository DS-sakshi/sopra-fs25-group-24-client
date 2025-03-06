"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types/user";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  message,
  Spin,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  LockOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import PageLayout from "@/components/PageLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UserPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const apiService = useApi();
  const { user: currentUser, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  // Cosmic theme styles
  const cosmicStyles = {
    pageBackground: {
      background: "linear-gradient(45deg, #0b0f2c 0%, #1a1f4d 100%)",
      minHeight: "100vh",
      padding: "40px 0",
    },
    cardStyle: {
      width: "80%",
      maxWidth: "600px",
      margin: "0 auto",
      background: "rgba(11, 15, 44, 0.9)",
      border: "1px solid rgba(92, 119, 235, 0.3)",
      borderRadius: "15px",
      boxShadow: "0 0 30px rgba(92, 119, 235, 0.2)",
      backdropFilter: "blur(10px)",
      position: "relative",
      overflow: "hidden",
    },
    descriptionsStyle: {
      background: "rgba(18, 25, 73, 0.6)",
      borderRadius: "8px",
      border: "1px solid rgba(92, 119, 235, 0.2)",
      ".ant-descriptions-item-label": {
        color: "#aab8f5 !important",
        background: "rgba(11, 15, 44, 0.8) !important",
        fontWeight: "600",
        padding: "12px 16px !important",
        borderRight: "1px solid rgba(92, 119, 235, 0.2) !important",
      },
      ".ant-descriptions-item-content": {
        color: "#e0e6ff !important",
        background: "rgba(18, 25, 73, 0.4) !important",
        padding: "12px 16px !important",
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
    inputStyle: {
      background: "rgba(11, 15, 44, 0.7)",
      border: "1px solid rgba(92, 119, 235, 0.3)",
      color: "#e0e6ff",
      "&:focus": {
        borderColor: "#5c77eb",
        boxShadow: "0 0 8px rgba(92, 119, 235, 0.3)",
      },
    },
  };

  useEffect(() => {
    if (currentUser) {
      console.log("==== User Profile Page Debug ====");
      console.log("Current user:", currentUser);
      console.log(
        "Current user ID:",
        currentUser.id,
        "Type:",
        typeof currentUser.id,
      );
      console.log("Profile user ID:", userId, "Type:", typeof userId);
      console.log("Comparing IDs:", String(currentUser.id) === String(userId));
      console.log("================================");
    }
  }, [currentUser, userId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: User = await apiService.get<User>(`/users/${userId}`);
        setUser(data);
        form.setFieldsValue({
          username: data.username,
          birthday: data.birthday ? dayjs(new Date(data.birthday)) : undefined,
        });
      } catch (error) {
        if (error instanceof Error) {
          setError(`Failed to load user: ${error.message}`);
          message.error(`Failed to load user: ${error.message}`);
        } else {
          setError("Failed to load user profile.");
          message.error("Failed to load user profile.");
        }
        setTimeout(() => router.push("/users"), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) fetchUser();
  }, [userId, apiService, router, currentUser, form]);

  const checkCanEdit = () => {
    if (!currentUser || !userId) return false;
    return String(currentUser.id) === String(userId);
  };

  const canEdit = checkCanEdit();

  const handleEdit = () => {
    if (!canEdit) return message.error("You can only edit your own profile");
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      if (!canEdit) {
        message.error("Permission denied: You can only edit your own profile");
        return setIsEditing(false);
      }

      const values = await form.validateFields();
      apiService.setCurrentUserId(String(currentUser?.id));
      await apiService.put(`/users/${userId}`, {
        username: values.username,
        birthday: values.birthday?.toDate(),
      });

      message.success("Profile updated successfully");
      const updatedUser = await apiService.get<User>(`/users/${userId}`);
      setUser(updatedUser);

      if (String(currentUser?.id) === String(userId)) await refreshUser();
      setIsEditing(false);
      router.push(`/users/${userId}?refresh=${Date.now()}`);
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to update profile: ${error.message}`);
        if (
          error.message.includes("username") && error.message.includes("exists")
        ) {
          form.setFields([{
            name: "username",
            errors: ["This username is already taken"],
          }]);
        }
      } else message.error("Failed to update profile.");
    }
  };

  const navigateBack = () => router.push("/users");

  return (
    <ProtectedRoute>
      <PageLayout requireAuth>
        <div
          style={{
            padding: "80px 0",
            background:
              `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
          }}
        >
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#e0e6ff",
                }}
              >
                <Button
                  icon={<ArrowLeftOutlined style={{ color: "#5c77eb" }} />}
                  onClick={navigateBack}
                  type="text"
                  style={{ marginRight: "10px" }}
                />
                <span
                  style={{
                    fontSize: "1.4em",
                    fontWeight: "600",
                    textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  Stellar Profile
                </span>
              </div>
            }
            loading={loading}
            style={cosmicStyles.cardStyle as React.CSSProperties}
            
            extra={user && (canEdit
              ? (
                !isEditing && (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    style={cosmicStyles.buttonStyle}
                  >
                    Edit Profile
                  </Button>
                )
              )
              : (
                <Button
                  disabled
                  icon={<LockOutlined />}
                  style={{
                    cursor: "not-allowed",
                    background: "rgba(92, 119, 235, 0.1)",
                    border: "1px solid rgba(92, 119, 235, 0.3)",
                    color: "#aab8f5",
                  }}
                >
                  View Only
                </Button>
              ))}
          >
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: "16px" }}
              />
            )}

            {user && !isEditing
              ? (
                <Descriptions
                  bordered
                  column={1}
                  style={cosmicStyles.descriptionsStyle}
                  labelStyle={{ color: "#e0e6ff" }}
                  contentStyle={{ color: "#e0e6ff" }}
                >
                  <Descriptions.Item label="Username">
                    <span style={{ color: "#5c77eb", fontWeight: "500" }}>
                      {user.username}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Name">
                    {user.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag
                      color={user.status === "ONLINE" ? "processing" : "error"}
                      style={{ fontWeight: "600", textTransform: "uppercase" }}
                    >
                      {user.status === "ONLINE"
                        ? "Stellar Active"
                        : "Orbiting Away"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Creation Date">
                    {user.creationDate
                      ? dayjs(user.creationDate).format(
                        "MMMM D, YYYY [at] HH:mm",
                      )
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Celestial Alignment">
                    {user.birthday
                      ? dayjs(user.birthday).format("MMMM D, YYYY")
                      : "Undiscovered"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cosmic ID">
                    <code style={{ color: "#aab8f5" }}>{user.id}</code>
                    {canEdit && (
                      <span style={{ marginLeft: 8, color: "#5c77eb" }}>
                        (Your Celestial Identity)
                      </span>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              )
              : user && isEditing
              ? (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    username: user.username,
                    birthday: user.birthday ? dayjs(user.birthday) : undefined,
                  }}
                  style={{ color: "#e0e6ff" }}
                >
                  <Form.Item
                    name="username"
                    label={<span style={{ color: "#aab8f5" }}>Username</span>}
                    rules={[{
                      required: true,
                      message: "Please enter a username",
                    }]}
                  >
                    <Input
                      style={cosmicStyles.inputStyle}
                      prefix={
                        <span style={{ color: "#5c77eb", marginRight: 8 }}>
                          ✦
                        </span>
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    name="birthday"
                    label={
                      <span style={{ color: "#aab8f5" }}>
                        Celestial Alignment Date
                      </span>
                    }
                  >
                    <DatePicker
                      style={{ width: "100%", ...cosmicStyles.inputStyle }}
                      popupClassName="calendar-popup"
                      suffixIcon={<span style={{ color: "#5c77eb" }}>🌌</span>}
                    />
                  </Form.Item>

                  <Form.Item>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                      }}
                    >
                      <Button
                        onClick={handleCancel}
                        style={{
                          background: "rgba(92, 119, 235, 0.1)",
                          border: "1px solid rgba(92, 119, 235, 0.3)",
                          color: "#aab8f5",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleSave}
                        style={cosmicStyles.buttonStyle}
                      >
                        Save to Cosmos
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              )
              : !error && <Spin tip="Loading stellar profile..." />}
          </Card>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
