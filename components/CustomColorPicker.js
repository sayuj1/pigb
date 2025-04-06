import { useEffect, useState } from "react";
import { Dropdown, Button, Tooltip, theme } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext"; // adjust path if needed

const COLOR_PRESETS = [
  "#00838F", "#1565C0", "#1E88E5", "#42A5F5", "#FF9800",
  "#FFC107", "#795548", "#5D4037", "#D32F2F", "#E53935",
  "#F44336", "#E91E63", "#9C27B0", "#AB47BC", "#BA68C8",
  "#388E3C", "#00796B", "#4DB6AC", "#2E7D32", "#8BC34A",
  "#000000", "#607D8B", "#B0BEC5", "#455A64", "#37474F"
];

export default function ColorPresetSelector({ selectedColor, onChange }) {
  const [color, setColor] = useState(selectedColor || COLOR_PRESETS[0]);
  const [open, setOpen] = useState(false);
  const { token } = theme.useToken();
  const { isDarkMode } = useTheme();

  const handleColorSelect = (newColor) => {
    setColor(newColor);
    onChange?.(newColor);
    setOpen(false); // Close dropdown after selection
  };

  const colorGrid = (
    <div
      style={{
        background: token.colorBgElevated,
        padding: 8,
        borderRadius: 8,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
        border: isDarkMode ? "1px solid #444" : "1px solid #d9d9d9",
      }}
    >
      {COLOR_PRESETS.map((preset) => (
        <Tooltip title={preset} key={preset}>
          <div
            onClick={() => handleColorSelect(preset)}
            style={{
              backgroundColor: preset,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `2px solid ${color === preset ? token.colorPrimary : "transparent"}`,
              cursor: "pointer",
            }}
          />
        </Tooltip>
      ))}
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [] }} // to suppress the deprecation warning
      dropdownRender={() => colorGrid}
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
    >
      <Button
        style={{
          width: '100%',
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: token.colorBgContainer,
          color: token.colorText,
          border: isDarkMode ? "1px solid #444" : "1px solid #d9d9d9",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 24,
            backgroundColor: color,
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        {/* Select Color */}
        <DownOutlined />
      </Button>
    </Dropdown>
  );
}
