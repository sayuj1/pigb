import { ConfigProvider, theme } from "antd";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeWrapper({ children }) {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgBase: isDarkMode ? "#141414" : "#ffffff",
          colorTextBase: isDarkMode ? "#ffffff" : "#000000",
          colorBgContainer: isDarkMode? "#001529": "#ffffff"
          // Add other custom tokens as needed
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
