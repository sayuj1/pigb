import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, message, Empty, Spin, Typography, Row, Col, Modal, Input, Select, Pagination, Space } from "antd";
import { PlusOutlined, ExclamationCircleOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import GoalCard from "./GoalCard";
import GoalForm from "./GoalForm";
import debounce from "lodash/debounce";
import { GOAL_CATEGORIES } from "@/contants/goalCategories";

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Filter states
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6);

    const fetchGoals = async (params = {}) => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/goals", {
                params: {
                    search: params.search ?? search,
                    category: params.category ?? category,
                    status: params.status ?? status,
                    page: params.page ?? page,
                    limit: params.limit ?? limit,
                }
            });
            setGoals(data.goals);
            setTotal(data.total);
        } catch (error) {
            message.error("Failed to fetch goals");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value) => {
            setPage(1);
            fetchGoals({ search: value, page: 1 });
        }, 500),
        [category, status, limit]
    );

    useEffect(() => {
        fetchGoals();
    }, [category, status, page, limit]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    const handleCreateOrUpdate = async (values) => {
        try {
            setSubmitting(true);
            if (editingGoal) {
                await axios.put(`/api/goals/${editingGoal._id}`, values);
                message.success("Goal updated successfully");
            } else {
                await axios.post("/api/goals", values);
                message.success("Goal created successfully");
            }
            setModalVisible(false);
            setEditingGoal(null);
            fetchGoals();
        } catch (error) {
            message.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        confirm({
            title: "Are you sure you want to delete this goal?",
            icon: <ExclamationCircleOutlined />,
            content: "This action cannot be undone.",
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    await axios.delete(`/api/goals/${id}`);
                    message.success("Goal deleted successfully");
                    fetchGoals();
                } catch (error) {
                    message.error("Failed to delete goal");
                }
            },
        });
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setModalVisible(true);
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                    <Title level={2} className="!mb-0">
                        Financial Goals
                    </Title>
                    <Text type="secondary">Track your milestones and stay motivated.</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => {
                        setEditingGoal(null);
                        setModalVisible(true);
                    }}
                    className="rounded-lg h-12 px-6 flex items-center bg-gradient-to-r from-[#00b894] to-[#00cec9] border-none shadow-md hover:shadow-lg transition-all"
                >
                    Add Goal
                </Button>
            </div>

            {/* Filters Section */}
            <Card className="rounded-xl border-none shadow-sm bg-white">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={10}>
                        <Input
                            placeholder="Search goals..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            size="large"
                            value={search}
                            onChange={handleSearchChange}
                            allowClear
                            className="rounded-lg"
                        />
                    </Col>
                    <Col xs={24} sm={12} md={7}>
                        <div className="flex items-center gap-2">
                            <Text type="secondary" className="whitespace-nowrap text-xs uppercase font-bold tracking-wider">Category:</Text>
                            <Select
                                value={category}
                                onChange={(val) => { setCategory(val); setPage(1); }}
                                className="w-full"
                                size="large"
                            >
                                <Option value="All">All Categories</Option>
                                {GOAL_CATEGORIES.map(cat => (
                                    <Option key={cat} value={cat}>{cat}</Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={7}>
                        <div className="flex items-center gap-2">
                            <Text type="secondary" className="whitespace-nowrap text-xs uppercase font-bold tracking-wider">Status:</Text>
                            <Select
                                value={status}
                                onChange={(val) => { setStatus(val); setPage(1); }}
                                className="w-full"
                                size="large"
                            >
                                <Option value="All">All Status</Option>
                                <Option value="pending">Pending</Option>
                                <Option value="completed">Completed</Option>
                                <Option value="near_deadline">Nearing Deadline</Option>
                                <Option value="overdue">Overdue</Option>
                            </Select>
                        </div>
                    </Col>
                </Row>
            </Card>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : goals.length === 0 ? (
                <div className="mt-4 bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            search || category !== "All" || status !== "All"
                                ? "No goals match your search/filters."
                                : "No goals found. Start by adding one!"
                        }
                    />
                    {(search || category !== "All" || status !== "All") && (
                        <Button
                            type="link"
                            onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); setPage(1); }}
                            className="mt-2"
                        >
                            Clear all filters
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <Row gutter={[24, 24]} className="mt-4">
                        {goals.map((goal) => (
                            <Col xs={24} sm={12} lg={8} key={goal._id} className="flex">
                                <GoalCard goal={goal} onEdit={handleEdit} onDelete={handleDelete} onRefresh={fetchGoals} />
                            </Col>
                        ))}
                    </Row>

                    <div className="mt-12 flex justify-center">
                        <Pagination
                            current={page}
                            total={total}
                            pageSize={limit}
                            onChange={(p) => setPage(p)}
                            showSizeChanger={false}
                            className="bg-white p-4 rounded-xl shadow-sm px-8"
                        />
                    </div>
                </>
            )}

            <GoalForm
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingGoal(null);
                }}
                onFinish={handleCreateOrUpdate}
                initialValues={editingGoal}
                loading={submitting}
            />
        </div>
    );
};

export default Goals;
