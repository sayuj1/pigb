import React, { useState, useEffect } from "react";
import { List, Typography, Spin, message, Modal, Tag } from "antd";
import { HistoryOutlined, ArrowUpOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Text } = Typography;

const GoalHistory = ({ goalId, visible, onCancel }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && goalId) {
            fetchHistory();
        }
    }, [visible, goalId]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/goals/transactions?goalId=${goalId}`);
            setHistory(data);
        } catch (error) {
            message.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <span className="flex items-center gap-2">
                    <HistoryOutlined /> Transaction History
                </span>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            centered
            className="rounded-xl overflow-hidden"
        >
            {loading ? (
                <div className="flex justify-center p-8">
                    <Spin />
                </div>
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={history}
                    className="max-h-[400px] overflow-y-auto"
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                                        <ArrowUpOutlined />
                                    </div>
                                }
                                title={<Text strong>₹{item.amount.toLocaleString()}</Text>}
                                description={
                                    <div className="flex flex-col">
                                        <Text type="secondary" size="small">{item.description}</Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {dayjs(item.date).format("MMM DD, YYYY - hh:mm A")}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: "No transactions found" }}
                />
            )}
        </Modal>
    );
};

export default GoalHistory;
