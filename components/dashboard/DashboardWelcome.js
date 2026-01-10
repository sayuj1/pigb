import React from "react";
import { Typography, Button, Row, Col } from "antd";
import {
    PiSparkleDuotone,
    PiPlusCircleDuotone,
    PiChartLineUpDuotone,
    PiWalletDuotone,
    PiTargetDuotone,
    PiQuotesDuotone
} from "react-icons/pi";
import Link from "next/link";

const { Title, Text } = Typography;

export default function DashboardWelcome() {
    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-50/50 p-8 md:p-12 mt-4 overflow-hidden relative border border-emerald-50 text-center">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-50 rounded-full opacity-50 blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-50 rounded-full opacity-50 blur-3xl" />

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="inline-flex p-4 rounded-2xl bg-emerald-50 text-emerald-600 mb-6 shadow-sm border border-emerald-100 animate-bounce">
                    <PiSparkleDuotone className="text-4xl" />
                </div>

                <Title level={1} className="!mb-4 !text-gray-900 font-bold tracking-tight">
                    Welcome to Your Wealth Journey
                </Title>

                <Text className="text-gray-500 text-lg mb-12 block leading-relaxed max-w-2xl mx-auto">
                    Your dashboard is ready to go! Start building your financial health today by tracking your first entry or setting a future goal.
                </Text>

                <div className="space-y-8">
                    {/* Transaction Section */}
                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-md">
                        <Row gutter={[24, 24]} align="middle">
                            <Col xs={24} sm={12} lg={8}>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
                                        <PiWalletDuotone className="text-2xl" />
                                    </div>
                                    <div>
                                        <Text strong className="block text-gray-800 leading-tight">Track Balance</Text>
                                        <Text type="secondary" className="text-xs">Monitor savings and expenses.</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} lg={8}>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                                        <PiChartLineUpDuotone className="text-2xl" />
                                    </div>
                                    <div>
                                        <Text strong className="block text-gray-800 leading-tight">Visual Insights</Text>
                                        <Text type="secondary" className="text-xs">Beautiful charts, smarter spending.</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={8} className="text-center lg:text-right">
                                <Link href="/income-expense">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PiPlusCircleDuotone className="text-xl" />}
                                        className="h-14 px-8 rounded-2xl border-none shadow-lg shadow-emerald-200 flex items-center gap-2 text-lg font-semibold w-full lg:w-auto justify-center lg:ml-auto"
                                    >
                                        Add Transaction
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                    </div>

                    {/* Goals Section */}
                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50 transition-all hover:bg-white hover:shadow-md">
                        <Row gutter={[24, 24]} align="middle">
                            <Col xs={24} lg={16}>
                                <div className="flex items-center gap-4 text-left">
                                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600 flex-shrink-0">
                                        <PiQuotesDuotone className="text-2xl" />
                                    </div>
                                    <div>
                                        <Text strong className="block text-gray-800 leading-tight">Every big achievement starts with a single step.</Text>
                                        <Text type="secondary" className="text-xs">Start planning for what matters most to you.</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} lg={8} className="text-center lg:text-right">
                                <Link href="/goals">
                                    <Button
                                        size="large"
                                        icon={<PiTargetDuotone className="text-xl" />}
                                        className="h-14 px-8 rounded-2xl flex items-center gap-2 text-lg font-semibold border-gray-200 hover:border-emerald-400 hover:text-emerald-600 transition-all w-full lg:w-auto justify-center lg:ml-auto"
                                    >
                                        Set a Goal
                                    </Button>
                                </Link>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </div>
    );
}
