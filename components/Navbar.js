import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import Link from "next/link";
import { Menu, Button, Dropdown, Avatar, Typography, theme } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useTheme } from "@/context/ThemeContext";

const { Text } = Typography;

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { token } = theme.useToken();
  const { isDarkMode } = useTheme();

  const userMenuItems = [
    {
      key: "profile",
      label: (
        <Link href="/profile" className="flex items-center px-4 py-2">
          <UserOutlined className="mr-2" /> Profile
        </Link>
      ),
    },
    {
      key: "logout",
      label: (
        <Button
          type="link"
          onClick={logout}
          className="flex items-center"
        >
          <LogoutOutlined className="mr-2" /> Logout
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full shadow-md flex items-center py-4" style={{
      backgroundColor: token.colorBgContainer
    }}>
      {/* <Menu mode="horizontal" className="w-full !p-0 flex items-center" items={menuItems} /> */}

      {/* Right Side: User Info or Auth Buttons */}
      <div className="ml-auto px-4 min-w-fit" style={{
        backgroundColor: token.colorBgContainer
      }}>
        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar src={user.profilePicture} size="default">
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Text>{user.name}</Text>
            </div>
          </Dropdown>
        ) : (
          <div className="flex gap-4">
            <Button type="link">
              <Link href="/login">Login</Link>
            </Button>
            <Button type="primary">
              <Link href="/signup">Signup</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
