import React from "react";
import { Progress, Typography, Row, Col, Card, Tooltip } from "antd";
import { TrophyOutlined, ClockCircleOutlined, AlertOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useDashboard } from "@/context/DashboardContext";
import BudgetSkeleton from "../resuable/skeletons/BudgetSkeleton";

const { Title, Text } = Typography;

export default function GoalProgress() {
    const { goalStats, goalStatsLoading } = useDashboard();

    if (goalStatsLoading) return <BudgetSkeleton />;

    const overallPercent = goalStats.totalTargetAmount > 0
        ? Math.round((goalStats.totalCurrentAmount / goalStats.totalTargetAmount) * 100)
        : 0;

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-6 mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-0">
                    <TrophyOutlined className="text-yellow-500" /> Goal Progress
                </h2>
                <Text type="secondary" className="text-xs uppercase font-bold tracking-wider">Overall Status</Text>
            </div>

            {goalStats.totalGoals === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                    <TrophyOutlined className="text-5xl text-gray-200 mb-4" />
                    <Title level={5} className="!mb-1">No On-going Goals</Title>
                    <Text type="secondary">Set a financial goal to track your progress here.</Text>
                </div>
            ) : (
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={8} className="flex flex-col items-center">
                        <Progress
                            type="dashboard"
                            percent={overallPercent}
                            strokeWidth={10}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                            width={160}
                        />
                        <div className="text-center mt-2">
                            <Text strong className="text-lg">Overall Progress</Text>
                            <br />
                            <Text type="secondary" className="text-xs">₹{goalStats.totalCurrentAmount.toLocaleString()} / ₹{goalStats.totalTargetAmount.toLocaleString()}</Text>
                        </div>
                    </Col>

                    <Col xs={24} md={16}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Text type="secondary" className="text-[10px] uppercase font-bold">On-going Goals</Text>
                                        <Title level={3} className="!mt-1 !mb-0">{goalStats.pendingGoals}</Title>
                                    </div>
                                    <TrophyOutlined className="text-blue-500 text-xl" />
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Text type="secondary" className="text-[10px] uppercase font-bold">Completed</Text>
                                        <Title level={3} className="!mt-1 !mb-0">{goalStats.completedGoals}</Title>
                                    </div>
                                    <CheckCircleOutlined className="text-green-500 text-xl" />
                                </div>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Text type="secondary" className="text-[10px] uppercase font-bold">Nearing Deadline</Text>
                                        <Title level={3} className={`!mt-1 !mb-0 ${goalStats.nearingDeadline > 0 ? 'text-orange-600' : ''}`}>
                                            {goalStats.nearingDeadline}
                                        </Title>
                                    </div>
                                    <ClockCircleOutlined className="text-orange-500 text-xl" />
                                </div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Text type="secondary" className="text-[10px] uppercase font-bold">Overdue</Text>
                                        <Title level={3} className={`!mt-1 !mb-0 ${goalStats.overdue > 0 ? 'text-red-600' : ''}`}>
                                            {goalStats.overdue}
                                        </Title>
                                    </div>
                                    <AlertOutlined className="text-red-500 text-xl" />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}
        </div>
    );
}
