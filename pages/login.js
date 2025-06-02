import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { useRouter } from "next/router";
import { Form, Input, Button, Typography, Card, Divider } from "antd";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { ArrowLeftOutlined } from "@ant-design/icons";
import ROUTES from "@/lib/routes";

const { Title, Text } = Typography;

export default function Login() {
  const { user, login, googleSignIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [user, router]);

  const handleSubmit = async (values) => {
    setLoading(true);
    await login(values.email, values.password);
    setLoading(false);
  };

  const handleGoogleSuccess = async (response) => {
    googleSignIn(response.credential);
  };

  const handleGoogleFailure = () => {
    console.error("Google Sign-In failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
      <Card
        className="w-full max-w-md shadow-xl"
        style={{ borderRadius: "1rem", padding: "2rem" }}
      >
        {/* Back Button inside Card */}
        <div className="mb-4">
          <Link href="/" passHref>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              className="text-blue-600 p-0"
              style={{
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Back to Home
            </Button>
          </Link>
        </div>

        <Title level={3} className="text-center mb-6">
          Welcome Back to Expensify
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input type="email" placeholder="Enter your email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter your password" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
            className="mt-2"
          >
            Login
          </Button>
        </Form>

        <Divider plain className="text-gray-500">
          or continue with
        </Divider>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            size="large"
          />
        </div>

        <div className="text-center mt-6">
          <Text>Don't have an account? </Text>
          <Link href="/signup">
            <span className="text-blue-600 font-medium hover:underline">
              Sign up
            </span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
