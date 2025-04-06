import { useState } from "react";
import { Dropdown, Button, Tooltip } from "antd";
import { DownOutlined } from "@ant-design/icons";

import { getIconComponent } from "../utils/getIcons"; // Adjust path if needed

// Define available icons
const ICONS = [
"PiMoneyDuotone",
  "PiMoneyWavyDuotone",
  "PiWalletDuotone",
  "PiBankDuotone",
  "PiCreditCardDuotone",
  "PiPiggyBankDuotone",
  "PiHouseDuotone",
  "PiGiftDuotone",
];

export default function CustomIconPicker({ selectedIcon, onChange }) {
  const [icon, setIcon] = useState(selectedIcon || "PiMoneyWavyDuotone");
  const [open, setOpen] = useState(false);

  const handleIconSelect = (iconName) => {
    setIcon(iconName);
    onChange?.(iconName);
    setOpen(false); // Close dropdown after selection
  };

  const iconGrid = (
    <div
      style={{
        padding: 8,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 10,
        maxHeight: 200,
        overflowY: "auto",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      {ICONS.map((iconName) => {
        const IconComponent = getIconComponent(iconName);
        return (
        //   <Tooltip title={iconName} key={iconName}>
            <div
              onClick={() => handleIconSelect(iconName)}
              style={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background: icon === iconName ? "#e6f7ff" : "transparent",
                border: icon === iconName ? "2px solid #1890ff" : "2px solid transparent",
                cursor: "pointer",
                transition: "background 0.2s, border 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = icon === iconName ? "#e6f7ff" : "transparent")}
        
            >
              <IconComponent size={24} color={icon === iconName ? "#1890ff" : "#333"} />
            </div>
        //   </Tooltip>
        );
      })}
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [] }} // Suppress warning
      dropdownRender={() => iconGrid}
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
    >
      <Button
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          border: "1px solid #d9d9d9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {getIconComponent(icon)({ size: 24 })}
          {/* Icon name can be displayed if needed */}
        </div>
        <DownOutlined />
      </Button>
    </Dropdown>
  );
}
