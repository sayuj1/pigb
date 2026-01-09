import ProtectedRoute from "@/context/ProtectRoute";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
    DatePicker, Button, Card, Typography, Spin, Alert,
    Tabs, Tag, Empty, Layout
} from "antd";
import { RobotOutlined, CheckCircleOutlined, HistoryOutlined } from "@ant-design/icons";
import axios from "axios";
import Head from "next/head";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CgSmartphoneChip } from "react-icons/cg";

const SidebarLayout = dynamic(() => import("@/components/Layout"), { ssr: false });
const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

function AIReports() {
    const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, 'month')); // Default to last month
    const [loading, setLoading] = useState(false);
    const [reportDoc, setReportDoc] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("0");
    const [usageStats, setUsageStats] = useState({ used: 0, limit: 3 });

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const month = selectedDate.month() + 1;
            const year = selectedDate.year();

            const response = await axios.get("/api/reports", { params: { month, year } });
            const doc = response.data.report;
            if (response.data.usageStats) {
                setUsageStats(response.data.usageStats);
            }

            setReportDoc(doc);
            if (doc) {
                // Default to showing the selected version, or the last one if newly generated
                setActiveTab(String(doc.selectedVersionIndex));
            } else {
                setActiveTab("0");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch report.");
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const month = selectedDate.month() + 1;
            const year = selectedDate.year();

            const response = await axios.post("/api/reports/generate", { month, year });
            const updatedDoc = response.data.report;
            setReportDoc(updatedDoc);
            setUsageStats(prev => ({ ...prev, used: prev.used + 1 }));
            // Switch to the newly created version (last one)
            setActiveTab(String(updatedDoc.versions.length - 1));
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to generate report.");
        } finally {
            setLoading(false);
        }
    };

    const setAsMainVersion = async (index) => {
        if (!reportDoc) return;
        try {
            const response = await axios.put("/api/reports", {
                reportId: reportDoc._id,
                selectedVersionIndex: index
            });
            setReportDoc(response.data.report);
            // Stay on current tab, but UI update will show the badge on this version
        } catch (err) {
            setError("Failed to update main version preference.");
        }
    };

    // Initial fetch on mount or date change
    useEffect(() => {
        fetchReport();
    }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps


    const renderContent = (version) => {
        if (version.status === 'generating') {
            return (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                    <Spin size="large" />
                    <Text className="mt-4 text-gray-500">Generating comprehensive financial analysis...</Text>
                    <Text type="secondary" className="text-xs mt-2">This may take a few moments.</Text>
                </div>
            );
        }

        if (version.status === 'failed') {
            return (
                <div className="py-10">
                    <Alert
                        message="Generation Failed"
                        description={version.content || "An error occurred while generating the report."}
                        type="error"
                        showIcon
                    />
                </div>
            );
        }

        // Default: completed or legacy (no status)
        return (
            <div id="report-content" className="prose max-w-none text-gray-700 p-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {version.content}
                </ReactMarkdown>
            </div>
        );
    };

    const successfulVersionsCount =
        reportDoc?.versions?.filter(v => v.status === "completed").length || 0;

    return (
        <>
            <Head>
                <title>AI Financial Reports | PigB</title>
            </Head>
            <SidebarLayout>
                <div className="p-6 max-w-5xl mx-auto">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <Title
                                level={2}
                                style={{
                                    marginBottom: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <CgSmartphoneChip className="text-emerald-500 " />
                                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent font-semibold">
                                    AI Financial Reports
                                </span>
                            </Title>


                            <Text type="secondary">
                                Analyze your monthly spending and get actionable insights.
                            </Text>
                            <div className="mt-2">
                                <Tag color={usageStats.used >= 3 ? "red" : "blue"} style={{ fontSize: '14px', padding: '4px 10px' }}>
                                    Credits Used: {usageStats.used} / {usageStats.limit}
                                </Tag>
                                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                    (You get 3 AI credits every month)
                                </Text>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4 md:mt-0">
                            <DatePicker
                                picker="month"
                                value={selectedDate}
                                onChange={date => date && setSelectedDate(date)}
                                allowClear={false}
                                className="w-40"
                            />
                            <Button
                                type="primary"
                                onClick={generateReport}
                                loading={loading}
                                disabled={successfulVersionsCount >= 3 || usageStats.used >= usageStats.limit}
                            >
                                {reportDoc ? "Generate New Version" : "Generate Report"}
                            </Button>
                        </div>
                    </div>

                    {error && <Alert message={error} type="error" showIcon className="mb-6" closable />}

                    {loading && !reportDoc ? (
                        <div className="text-center py-20">
                            <Spin size="large" tip="Loading analysis..." />
                        </div>
                    ) : !reportDoc ? (
                        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                            <Empty
                                description={
                                    <span>
                                        No report found for <strong>{selectedDate.format("MMMM YYYY")}</strong>.<br />
                                        Click Generate to start analyzing.
                                    </span>
                                }
                            />
                        </div>
                    ) : (
                        <Card bordered={false} className="shadow-sm">
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                tabPosition="top"
                                items={reportDoc.versions.map((ver, index) => ({
                                    key: String(index),
                                    label: (
                                        <span>
                                            Version {index + 1} &nbsp;
                                            {index === reportDoc.selectedVersionIndex && (
                                                <Tag color="green" className="ml-2 mr-0">Main</Tag>
                                            )}
                                        </span>
                                    ),
                                    children: (
                                        <div className="animate-fade-in">
                                            <div className="flex justify-between items-center mb-4 border-b pb-4">
                                                <Text type="secondary">
                                                    Generated on {dayjs(ver.createdAt).format("MMM D, YYYY h:mm A")}
                                                </Text>
                                                <div className="flex gap-2">
                                                    {index !== reportDoc.selectedVersionIndex && (
                                                        <Button
                                                            size="small"
                                                            icon={<CheckCircleOutlined />}
                                                            onClick={() => setAsMainVersion(index)}
                                                        >
                                                            Set as Main Report
                                                        </Button>
                                                    )}
                                                </div>
                                                {index === reportDoc.selectedVersionIndex && (
                                                    <Button type="text" size="small" icon={<CheckCircleOutlined />} disabled className="text-green-600">
                                                        Currently Main Report
                                                    </Button>
                                                )}
                                            </div>
                                            {renderContent(ver)}
                                        </div>
                                    )
                                }))}
                            />
                        </Card>
                    )}

                    {reportDoc && successfulVersionsCount >= 3 && (
                        <div className="mt-4 text-center">
                            <Text type="secondary">
                                <HistoryOutlined /> Maximum limit of 3 successful revisions reached for this month.
                            </Text>
                        </div>
                    )}

                </div>
            </SidebarLayout>
        </>
    );
}

export default ProtectedRoute(AIReports);
