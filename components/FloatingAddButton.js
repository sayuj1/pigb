import { PlusOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";

export default function FloatingAddButton({ onClick }) {
    return (
        <FloatButton
            icon={<PlusOutlined />}
            type="primary"
            onClick={onClick}
            tooltip="Add Transaction"
            style={{
                background: "linear-gradient(135deg, #00b894, #00cec9)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0, 200, 180, 0.4)",
            }}
        />
    );
}
