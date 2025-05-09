"use client";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { Button, Card, Col, Row, Typography } from "antd";
import { FormOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/context/AuthContext";

const { Title, Paragraph } = Typography;
// Home page component
export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <PageLayout>
      <div
        className={styles.page}
        style={{
          padding: "80px 0",
          background:
            `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pleiades_large.jpg/435px-Pleiades_large.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <main className={styles.main}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "60px",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
            }}
          >
          </div>

          <Row gutter={[24, 24]} justify="center">
            <Col xs={26} md={24} lg={22} xl={20}>
              <Card
                title={
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      background: "linear-gradient(90deg, #00b4d8, #90e0ef)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textAlign: "center",
                    }}
                  >
                    Quoridor
                  </Title>
                }
                variant="borderless"
                styles={{
                    header: { border: "none" }
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "24px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
              >
                <Paragraph
                  style={{
                    fontSize: "16px",
                    marginBottom: "2rem",
                    color: "rgba(255,255,255,0.9)",
                    textAlign: "center",
                  }}
                >
                  A game developed by SoPra-FS25 Group 24.
                </Paragraph>

                <Paragraph
                  style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                </Paragraph>
                <ul
                  style={{
                    paddingLeft: "24px",
                    marginBottom: "2rem",
                    color: "rgba(255,255,255,0.9)",
                    listStyleType: "circle",
                  }}
                >
                </ul>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "24px",
                    flexWrap: "wrap",
                  }}
                >
                  {!user
                    ? (
                      <>
                        <Button
                          type="primary"
                          icon={<FormOutlined />}
                          onClick={() => router.push("/register")}
                          size="large"
                          shape="round"
                          style={{
                            background:
                              "linear-gradient(135deg, #00b4d8, #90e0ef)",
                            border: "none",
                            padding: "0 32px",
                            height: "48px",
                            fontSize: "16px",
                            transition: "transform 0.2s",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                          className="hover-scale"
                        >
                          Register
                        </Button>

                        <Button
                          type="default"
                          icon={<LoginOutlined />}
                          onClick={() => router.push("/login")}
                          size="large"
                          shape="round"
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "#fff",
                            padding: "0 32px",
                            height: "48px",
                            fontSize: "16px",
                            transition: "transform 0.2s",
                            backdropFilter: "blur(4px)",
                          }}
                          className="hover-scale"
                        >
                          Login
                        </Button>
                      </>
                    )
                    : (
                      <Button
                        type="primary"
                        icon={<UserOutlined />}
                        onClick={() => router.push("/users")}
                        size="large"
                        shape="round"
                        style={{
                          background:
                            "linear-gradient(135deg, #00b4d8, #90e0ef)",
                          border: "none",
                          padding: "0 32px",
                          height: "48px",
                          fontSize: "16px",
                          transition: "transform 0.2s",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                        className="hover-scale"
                      >
                        View Users
                      </Button>
                    )}
                  <Button
                    type="default"
                    onClick={() =>
                      window.open(
                        "https://www.youtube.com/watch?v=z2xgVwNeh68",
                        "_blank",
                      )}
                    size="large"
                    shape="round"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#fff",
                      padding: "0 32px",
                      height: "48px",
                      fontSize: "16px",
                      transition: "transform 0.2s",
                      backdropFilter: "blur(4px)",
                    }}
                    className="hover-scale"
                  >
                    Tutorial
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </main>
      </div>
    </PageLayout>
  );
}
