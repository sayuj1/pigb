import { useState } from "react";
import { Dropdown, Button, theme } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { getIconComponent } from "../utils/getIcons"; // Adjust path if needed

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
  const { token } = theme.useToken();

  const primary = token.colorPrimary || "#00b894";
  const secondary = "#00cec9";
  const bgBase = token.colorBgContainer;
  const textColor = token.colorTextBase;


  const handleIconSelect = (iconName) => {
    setIcon(iconName);
    onChange?.(iconName);
    setOpen(false);
  };

  const iconGrid = (
    <div
      style={{
        padding: 10,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 10,
        maxHeight: 220,
        overflowY: "auto",
        background: bgBase,
        borderRadius: 10,
        boxShadow: "0px 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      {ICONS.map((iconName) => {
        const IconComponent = getIconComponent(iconName);
        const isSelected = icon === iconName;

        return (
          <div
            key={iconName}
            role="button"
            tabIndex={0}
            aria-label={`Select ${iconName}`}
            onClick={() => handleIconSelect(iconName)}
            onKeyDown={(e) => e.key === "Enter" && handleIconSelect(iconName)}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              background: isSelected
                ? `linear-gradient(135deg, ${primary}, ${secondary})`
                : bgBase,
              border: isSelected
                ? `2px solid ${primary}`
                : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: isSelected
                ? "0 4px 12px rgba(0, 200, 180, 0.4)"
                : "0 2px 6px rgba(0, 0, 0, 0.08)",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = `linear-gradient(135deg, ${primary}22, ${secondary}22)`;
                e.currentTarget.style.border = `2px solid ${secondary}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = bgBase;
                e.currentTarget.style.border = "2px solid transparent";
              }
            }}
          >
            <IconComponent
              size={24}
              color={isSelected ? "#ffffff" : textColor}
              style={{ transition: "color 0.2s ease" }}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [] }}
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
          borderRadius: 8,
          border: `1px solid ${token.colorBorder}`,
          background: bgBase,
          color: textColor,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.border = `1px solid ${secondary}`)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.border = `1px solid ${token.colorBorder}`)
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {getIconComponent(icon)({ size: 24, color: primary })}
        </div>
        <DownOutlined style={{ color: secondary }} />
      </Button>
    </Dropdown>
  );
}
