import { ConfigProvider, theme } from "antd";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeWrapper({ children }) {
  const { isDarkMode } = useTheme();

  const primaryColor = "#00b894"; // teal green
  const secondaryColor = "#00cec9"; // cyan

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          // Core brand colors
          colorPrimary: primaryColor,
          colorInfo: primaryColor, // used for links & info states
          colorSuccess: "#26de81",
          colorWarning: "#fbc531",
          colorError: "#e84118",

          // Backgrounds
          colorBgBase: isDarkMode ? "#141414" : "#ffffff",
          colorBgContainer: isDarkMode ? "#001529" : "#ffffff",
          colorBorder: isDarkMode ? "#333" : "#e0e0e0",

          // Text colors
          colorTextBase: isDarkMode ? "#ffffff" : "#000000",
          colorTextSecondary: isDarkMode ? "#b5b5b5" : "#555",

          // Optional gradient reference (custom, not native)
          gradientPrimary: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
        },
        components: {
          Button: {
            colorPrimaryHover: secondaryColor,
            colorPrimaryActive: "#00a884",
            borderRadius: 8,
            fontWeight: 500,
          },
          Tabs: {
            itemActiveColor: primaryColor,
            itemHoverColor: secondaryColor,
          },
          Input: {
            // activeBorderColor: primaryColor,
            activeBorderColor: primaryColor,
            hoverBorderColor: secondaryColor,
            borderRadius: 6,
          },

          Dropdown: {
            // These affect the dropdown panel
            colorBgElevated: isDarkMode ? "#1f1f1f" : "#ffffff",
            controlItemBgHover: isDarkMode ? "#003d36" : "#e6fffb",
            controlItemBgActive: isDarkMode ? "#004d40" : "#b2f2eb",
            colorText: isDarkMode ? "#eaeaea" : "#000000",
            colorTextHover: secondaryColor,
            borderRadius: 8,
            boxShadowSecondary:
              "0 4px 20px rgba(0, 0, 0, 0.12)",
          },

          Select: {
            // Popup (dropdown) background
            colorBgElevated: isDarkMode ? "#1f1f1f" : "#ffffff",
            optionSelectedBg: isDarkMode ? "#004d40" : "#b2f2eb",
            optionActiveBg: isDarkMode ? "#003d36" : "#e6fffb",
            // colorBorder: primaryColor,
            optionSelectedColor: "#000000",
            borderRadius: 6,
            colorText: isDarkMode ? "#eaeaea" : "#000000",
            colorTextPlaceholder: isDarkMode ? "#888" : "#999",
            colorPrimaryHover: secondaryColor,
          },


        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
