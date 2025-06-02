import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { Form, Input, Button, Typography, Card, Divider } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowLeftOutlined } from "@ant-design/icons";
import ROUTES from "@/lib/routes";

const { Title, Text } = Typography;

export default function Signup() {
  const { user, signup, googleSignIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [user, router]);

  const handleGoogleSuccess = async (response) => {
    googleSignIn(response.credential);
  };

  const handleGoogleFailure = () => {
    console.error("Google Sign-In failed");
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    await signup(values.name, values.email, values.password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4">
      <Card
        className="w-full max-w-md shadow-xl"
        style={{ borderRadius: "1rem", padding: "2rem" }}
      >
        {/* Back Button */}
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
          Join Expensify
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" size="large" />
          </Form.Item>

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
            Sign Up
          </Button>
        </Form>

        <Divider plain className="text-gray-500">
          or sign up with
        </Divider>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            text="signup_with"
            size="large"
          />
        </div>

        <div className="text-center mt-6">
          <Text>Already have an account? </Text>
          <Link href="/login">
            <span className="text-blue-600 font-medium hover:underline">
              Login
            </span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
