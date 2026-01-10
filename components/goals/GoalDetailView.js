import React, { useState, useEffect } from "react";
import { Modal, Typography, Row, Col, Progress, Tag, Divider, Space, Card, List, Button, Spin, Empty } from "antd";
import {
    TrophyOutlined,
    CalendarOutlined,
    RiseOutlined,
    FallOutlined,
    BulbOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

const GoalDetailView = ({ goal, visible, onCancel }) => {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (visible && goal?._id) {
            fetchHistory();
        }
    }, [visible, goal]);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const { data } = await axios.get(`/api/goals/transactions?goalId=${goal._id}`);
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!goal) return null;

    const totalAmount = goal.targetAmount;
    const savedAmount = goal.currentAmount;
    const remainingAmount = Math.max(totalAmount - savedAmount, 0);
    const percent = Math.min(Math.round((savedAmount / totalAmount) * 100), 100);

    const today = dayjs();
    const deadlineDate = dayjs(goal.deadline);
    const startDate = dayjs(goal.createdAt);
    const isCompleted = goal.status === "completed";
    const isOverdue = deadlineDate.isBefore(today, "day") && !isCompleted;
    const daysLeft = Math.ceil(deadlineDate.diff(today, "day"));

    // Pace Logic
    const totalDuration = deadlineDate.diff(startDate, "day");
    const elapsedDuration = today.diff(startDate, "day");
    const timeProgressPercent = totalDuration > 0
        ? Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100)
        : 100;

    let paceStatus = "On Track";
    let paceColor = "success";
    if (isCompleted) paceStatus = "Completed";
    else if (isOverdue) { paceStatus = "Overdue"; paceColor = "error"; }
    else if (percent < timeProgressPercent - 5) { paceStatus = "Behind"; paceColor = "warning"; }
    else if (percent > timeProgressPercent + 10) { paceStatus = "Ahead"; paceColor = "processing"; }

    // Smart Suggestions Logic
    const getSuggestions = () => {
        if (isCompleted) return ["Congratulations! You've reached your milestone.", "Consider setting a new goal to keep the momentum going."];
        if (isOverdue) return ["This goal is past its deadline.", "Try extending the deadline or adjusting the target amount."];

        const suggestions = [];
        const monthsRemaining = deadlineDate.diff(today, "month", true);
        const monthlyNeeded = remainingAmount / Math.max(monthsRemaining, 1);

        if (paceStatus === "Behind") {
            suggestions.push(`You're slightly behind schedule. Try saving ₹${Math.ceil(monthlyNeeded * 1.1).toLocaleString()} this month to catch up.`);
            suggestions.push("Identify non-essential expenses this week and redirect them to this goal.");
        } else if (paceStatus === "Ahead") {
            suggestions.push("Great job! You're ahead of schedule.");
            suggestions.push("If you have extra funds, consider reaching your goal even earlier!");
        } else {
            suggestions.push("You're doing great! Keep up the consistent contributions.");
            suggestions.push(`Saving just ₹${Math.ceil(monthlyNeeded).toLocaleString()} per month will get you there on time.`);
        }

        if (percent > 80) {
            suggestions.push("You're so close! Only 20% left to go.");
        }

        return suggestions;
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={700}
            centered
            className="goal-detail-modal"
            styles={{ body: { maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '24px' } }}
            title={
                <div className="flex items-center gap-2">
                    <TrophyOutlined className="text-yellow-500" />
                    <span>Goal Details</span>
                </div>
            }
        >
            <div className="flex flex-col h-full overflow-hidden">
                {/* Fixed Top Content */}
                <div className="flex-none pb-4">
                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex justify-between items-center">
                                <div>
                                    <Title level={3} className="!mb-1">{goal.name}</Title>
                                    <Space>
                                        <Tag color="blue" className="rounded-full uppercase">{goal.category}</Tag>
                                        <Tag color={paceColor} className="rounded-full uppercase">{paceStatus}</Tag>
                                    </Space>
                                </div>
                                <div className="text-right">
                                    <Text type="secondary" block>Remaining</Text>
                                    <Title level={2} className="!mb-0 !mt-0 text-blue-600">₹{remainingAmount.toLocaleString()}</Title>
                                </div>
                            </div>
                        </Col>

                        <Col span={24}>
                            <Card className="rounded-xl border-gray-100 shadow-sm" size="small">
                                <Row gutter={24} align="middle">
                                    <Col xs={24} md={12}>
                                        <div className="mb-2">
                                            <Text type="secondary" className="text-[10px]">TOTAL PROGRESS</Text>
                                            <Title level={5} className="!mt-0">₹{savedAmount.toLocaleString()} / ₹{totalAmount.toLocaleString()}</Title>
                                        </div>
                                        <Progress
                                            percent={percent}
                                            strokeWidth={10}
                                            status={isCompleted ? "success" : isOverdue ? "exception" : "active"}
                                            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                        />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <div className="space-y-2 mt-2 md:mt-0">
                                            <div className="bg-gray-50 p-2 px-3 rounded-lg flex justify-between items-center border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <CalendarOutlined className="text-blue-500 text-xs" />
                                                    <Text type="secondary" className="text-[10px]">DAYS LEFT</Text>
                                                </div>
                                                <Text strong className="text-xs">{isCompleted ? "Goal Met" : isOverdue ? "Overdue" : `${daysLeft}d`}</Text>
                                            </div>
                                            <div className="bg-gray-50 p-2 px-3 rounded-lg flex justify-between items-center border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <ClockCircleOutlined className="text-green-500 text-xs" />
                                                    <Text type="secondary" className="text-[10px]">TIME ELAPSED</Text>
                                                </div>
                                                <Text strong className="text-xs">{Math.round(timeProgressPercent)}%</Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Title level={5} className="flex items-center gap-2 mb-2 text-sm">
                                <BulbOutlined className="text-yellow-500" /> Smart Suggestions
                            </Title>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {getSuggestions().map((s, idx) => (
                                    <div key={idx} className="bg-yellow-50 border border-yellow-100 p-2 rounded-lg flex gap-2 items-start">
                                        <CheckCircleOutlined className="text-yellow-600 mt-1 text-[10px]" />
                                        <Text className="text-[11px] text-yellow-800 leading-tight">{s}</Text>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </div>

                <Divider className="!my-0" />

                {/* Scrollable Activity Content */}
                <div className="flex-1 overflow-hidden flex flex-col pt-4">
                    <Title level={5} className="flex items-center gap-2 mb-2 text-sm flex-none">
                        <ClockCircleOutlined className="text-blue-500" /> Recent Activity
                    </Title>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loadingHistory ? (
                            <div className="flex justify-center p-4"><Spin /></div>
                        ) : history.length > 0 ? (
                            <List
                                dataSource={history}
                                renderItem={(item) => (
                                    <List.Item className="px-0 py-2 border-b last:border-0 border-gray-50">
                                        <List.Item.Meta
                                            title={<Text strong className="text-xs">₹{item.amount.toLocaleString()}</Text>}
                                            description={<Text type="secondary" className="text-[10px]">{item.description} • {dayjs(item.date).format("MMM DD, YYYY")}</Text>}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No recent activity" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default GoalDetailView;
