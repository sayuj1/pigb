import React, { useState } from "react";
import { Card, Progress, Tag, Typography, Tooltip, message, Space } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    TrophyOutlined,
    PlusCircleOutlined,
    HistoryOutlined,
    CheckCircleOutlined,
    UndoOutlined,
    RiseOutlined,
    FallOutlined,
    InfoCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import AddMoneyModal from "./AddMoneyModal";
import GoalHistory from "./GoalHistory";
import GoalDetailView from "./GoalDetailView";
import axios from "axios";

const { Text, Title } = Typography;

const GoalCard = ({ goal, onEdit, onDelete, onRefresh }) => {
    const [addMoneyVisible, setAddMoneyVisible] = useState(false);
    const [historyVisible, setHistoryVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const totalAmount = goal.targetAmount;
    const savedAmount = goal.currentAmount;
    const remainingAmount = Math.max(totalAmount - savedAmount, 0);
    const percent = Math.min(Math.round((savedAmount / totalAmount) * 100), 100);

    const isCompleted = goal.status === "completed";
    const today = dayjs();
    const deadlineDate = dayjs(goal.deadline);
    const startDate = dayjs(goal.createdAt);
    const isOverdue = deadlineDate.isBefore(today, "day") && !isCompleted;
    const daysLeft = Math.ceil(deadlineDate.diff(today, "day"));

    // Monthly savings calculation
    const monthsRemaining = deadlineDate.diff(today, "month", true);
    const monthlySavingsNeeded = remainingAmount > 0 && monthsRemaining > 0
        ? Math.ceil(remainingAmount / Math.max(monthsRemaining, 1))
        : 0;

    // Pace Logic
    const totalDuration = deadlineDate.diff(startDate, "day");
    const elapsedDuration = today.diff(startDate, "day");
    const timeProgressPercent = totalDuration > 0
        ? Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100)
        : 100;

    let paceStatus = "On Track";
    let paceColor = "success";
    let paceIcon = <RiseOutlined />;

    if (isCompleted) {
        paceStatus = "Goal Achieved";
        paceColor = "success";
        paceIcon = <TrophyOutlined />;
    } else if (isOverdue) {
        paceStatus = "Overdue";
        paceColor = "error";
        paceIcon = <InfoCircleOutlined />;
    } else if (percent < timeProgressPercent - 5) {
        paceStatus = "Behind";
        paceColor = "warning";
        paceIcon = <FallOutlined />;
    } else if (percent > timeProgressPercent + 10) {
        paceStatus = "Ahead";
        paceColor = "processing";
        paceIcon = <RiseOutlined />;
    }

    const handleStatusUpdate = async (e, newStatus) => {
        e.stopPropagation();
        try {
            setLoading(true);
            const updatePayload = {
                ...goal,
                status: newStatus,
            };
            if (newStatus === "completed") {
                updatePayload.currentAmount = totalAmount;
            }

            await axios.put(`/api/goals/${goal._id}`, updatePayload);
            message.success(`Goal marked as ${newStatus}!`);
            onRefresh();
        } catch (error) {
            message.error(`Failed to mark as ${newStatus}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (e) => {
        // Prevent opening detail view if clicking on actions or modals
        if (e.target.closest(".ant-card-actions") || e.target.closest(".ant-modal")) {
            return;
        }
        setDetailVisible(true);
    };

    return (
        <>
            <Card
                hoverable
                loading={loading}
                onClick={handleCardClick}
                className={`rounded-xl shadow-md transition-all duration-300 hover:shadow-xl ${isCompleted ? "border-green-400 border-2" : ""
                    } flex flex-col w-full h-full`}
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' } }}
                actions={[
                    isCompleted ? (
                        <Tooltip title="Mark as Pending" key="pending">
                            <UndoOutlined
                                className="text-orange-500"
                                onClick={(e) => handleStatusUpdate(e, "pending")}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Mark as Completed" key="complete">
                            <CheckCircleOutlined
                                className="text-green-600"
                                onClick={(e) => handleStatusUpdate(e, "completed")}
                            />
                        </Tooltip>
                    ),
                    <Tooltip title="Add Money" key="add">
                        <PlusCircleOutlined
                            className="text-green-500"
                            onClick={(e) => { e.stopPropagation(); setAddMoneyVisible(true); }}
                        />
                    </Tooltip>,
                    <Tooltip title="History" key="history">
                        <HistoryOutlined
                            className="text-blue-500"
                            onClick={(e) => { e.stopPropagation(); setHistoryVisible(true); }}
                        />
                    </Tooltip>,
                    <Tooltip title="Edit" key="edit">
                        <EditOutlined onClick={(e) => { e.stopPropagation(); onEdit(goal); }} />
                    </Tooltip>,
                    <Tooltip title="Delete" key="delete">
                        <DeleteOutlined
                            onClick={(e) => { e.stopPropagation(); onDelete(goal._id); }}
                            className="text-red-500"
                        />
                    </Tooltip>,
                ]}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Title level={4} className="mb-0 !text-gray-800">
                            {goal.name}
                        </Title>
                        <Space>
                            <Tag color="blue" className="mt-1 rounded-full uppercase text-[10px]">
                                {goal.category}
                            </Tag>
                            <Tag color={paceColor} icon={paceIcon} className="mt-1 rounded-full uppercase text-[10px]">
                                {paceStatus}
                            </Tag>
                        </Space>
                    </div>
                </div>

                <div className="mb-6 flex-1">
                    <div className="flex justify-between mb-2">
                        <Text type="secondary">Progress</Text>
                        <Text strong>
                            ₹{savedAmount.toLocaleString()} / ₹{totalAmount.toLocaleString()}
                        </Text>
                    </div>
                    <Progress
                        percent={percent}
                        status={isCompleted ? "success" : isOverdue ? "exception" : "active"}
                        strokeColor={{
                            "0%": "#108ee9",
                            "100%": "#87d068",
                        }}
                        strokeWidth={12}
                    />
                </div>

                <div className="space-y-3 mb-6">
                    {!isCompleted && !isOverdue && monthlySavingsNeeded > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                    <RiseOutlined />
                                </div>
                                <Text type="secondary" className="text-xs">Savings Needed / Month</Text>
                            </div>
                            <Text strong className="text-sm text-blue-700">₹{monthlySavingsNeeded.toLocaleString()}</Text>
                        </div>
                    )}
                </div>

                <div className="flex items-center text-gray-400 text-[10px] justify-between border-t pt-3">
                    <div className="flex items-center">
                        <CalendarOutlined className="mr-1" />
                        <span>Deadline: {deadlineDate.format("MMM DD, YYYY")}</span>
                    </div>
                    {remainingAmount > 0 && !isOverdue && (
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${daysLeft < 7 ? 'bg-red-50 text-red-600 border border-red-100' :
                            daysLeft < 30 ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                'bg-green-50 text-green-600 border border-green-100'
                            }`}>
                            <ClockCircleOutlined style={{ fontSize: '9px' }} />
                            <span>{daysLeft}d left</span>
                        </div>
                    )}
                </div>

                <AddMoneyModal
                    goalId={goal._id}
                    visible={addMoneyVisible}
                    onCancel={() => setAddMoneyVisible(false)}
                    onSuccess={() => {
                        setAddMoneyVisible(false);
                        onRefresh();
                    }}
                />
                <GoalHistory
                    goalId={goal._id}
                    visible={historyVisible}
                    onCancel={() => setHistoryVisible(false)}
                />
            </Card>

            <GoalDetailView
                goal={goal}
                visible={detailVisible}
                onCancel={() => setDetailVisible(false)}
            />
        </>
    );
};

export default GoalCard;
