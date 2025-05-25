import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { Form, Input, Button, Typography, Card } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { GoogleLogin } from "@react-oauth/google";

const { Title, Text } = Typography;

export default function Signup() {
  const { user, signup, googleSignIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleGoogleSuccess = async (response) => {
    console.log(response);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg bg-white">
        <Title level={3} className="text-center">
          Expensify Signup
        </Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input type="email" placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign Up
          </Button>
        </Form>
        <div className="text-center my-4">or</div>

        <div className="flex justify-center mt-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            text="signup_with"
          />
        </div>
        <div className="text-center mt-4">
          <Text>Have an account? </Text>
          <Link href="/login">
            <span className="text-blue-500 hover:underline">Login</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
