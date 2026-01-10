import React from "react";
import { Typography, Button, Space, Row, Col } from "antd";
import {
    PiSparkleDuotone,
    PiPlusCircleDuotone,
    PiChartLineUpDuotone,
    PiWalletDuotone,
    PiTargetDuotone
} from "react-icons/pi";
import Link from "next/link";

const { Title, Text } = Typography;

export default function DashboardWelcome() {
    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-50/50 p-8 md:p-12 mt-4 overflow-hidden relative border border-emerald-50">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-50 rounded-full opacity-50 blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-50 rounded-full opacity-50 blur-3xl" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex p-4 rounded-2xl bg-emerald-50 text-emerald-600 mb-6 shadow-sm border border-emerald-100 animate-bounce">
                    <PiSparkleDuotone className="text-4xl" />
                </div>

                <Title level={1} className="!mb-4 !text-gray-900 font-bold tracking-tight">
                    Welcome to Your Wealth Journey
                </Title>

                <Text className="text-gray-500 text-lg mb-10 block leading-relaxed">
                    Your dashboard is ready to go! Start recording your first transaction or link an account to see your financial insights come to life.
                </Text>

                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                    <Link href="/income-expense">
                        <Button
                            type="primary"
                            size="large"
                            icon={<PiPlusCircleDuotone className="text-xl" />}
                            className="h-14 px-8 rounded-2xl border-none shadow-lg shadow-emerald-200 flex items-center gap-2 text-lg font-semibold"
                        >
                            Add Transaction
                        </Button>
                    </Link>
                    <Link href="/goals">
                        <Button
                            size="large"
                            icon={<PiTargetDuotone className="text-xl" />}
                            className="h-14 px-8 rounded-2xl flex items-center gap-2 text-lg font-semibold border-gray-200 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                        >
                            Set a Goal
                        </Button>
                    </Link>
                </div>

                <Row gutter={[24, 24]} className="text-left mt-8 border-t border-gray-100 pt-10">
                    <Col xs={24} md={8}>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                                <PiWalletDuotone className="text-2xl" />
                            </div>
                            <div>
                                <Text strong className="block text-gray-800">Track Balance</Text>
                                <Text type="secondary" className="text-xs">Monitor your savings and expenses in real-time.</Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <PiChartLineUpDuotone className="text-2xl" />
                            </div>
                            <div>
                                <Text strong className="block text-gray-800">Visual Insights</Text>
                                <Text type="secondary" className="text-xs">Beautiful charts to help you spend smarter.</Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="p-4 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                            <Text type="secondary" className="text-sm block italic">Every big achievement starts with a single step.</Text>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
