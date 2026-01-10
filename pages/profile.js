import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    Card,
    Typography,
    Avatar,
    Form,
    Input,
    Button,
    Select,
    Row,
    Col,
    Divider,
    message,
    Spin,
    Space
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    GlobalOutlined,
    DollarCircleOutlined,
    CalendarOutlined,
    SaveOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons";
import axios from "axios";
import ProtectedRoute from "@/context/ProtectRoute";
import Head from "next/head";
import { getAllISOCodes, getAllInfoByISO } from "iso-country-currency";

const { Title, Text } = Typography;
const { Option } = Select;

const SidebarLayout = dynamic(() => import("@/components/Layout"), {
    ssr: false,
});

const countries = getAllISOCodes();

const ProfilePage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/api/user");
            setUserData(res.data);
            form.setFieldsValue({
                name: res.data.name,
                email: res.data.email,
                currency: res.data.locale?.currency,
                symbol: res.data.locale?.symbol,
                countryCode: res.data.locale?.iso,
                dateFormat: res.data.locale?.dateFormat,
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
            message.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleCountryChange = (isoCode) => {
        const countryInfo = getAllInfoByISO(isoCode);
        if (countryInfo) {
            form.setFieldsValue({
                currency: countryInfo.currency,
                symbol: countryInfo.symbol,
                dateFormat: countryInfo.dateFormat || "d/M/yyyy"
            });
        }
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            const payload = {
                name: values.name,
                locale: {
                    currency: values.currency,
                    symbol: values.symbol,
                    iso: values.countryCode,
                    countryName: countries.find(c => c.iso === values.countryCode)?.countryName || "",
                    dateFormat: values.dateFormat,
                }
            };
            await axios.put("/api/user", payload);
            message.success("Profile updated successfully");
            fetchProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            message.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spin size="large" tip="Loading profile..." />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>User Profile | PigB</title>
            </Head>
            <SidebarLayout>
                <div className="max-w-4xl mx-auto p-4 md:p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => window.history.back()}
                            className="border-none bg-gray-100 hover:bg-gray-200"
                        />
                        <Title level={2} className="!mb-0">User Profile</Title>
                    </div>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Card className="text-center shadow-md rounded-2xl border-none h-full">
                                <div className="flex flex-col items-center py-6">
                                    <Avatar
                                        size={120}
                                        src={userData?.profilePicture}
                                        icon={<UserOutlined />}
                                        className="mb-4 shadow-lg border-4 border-emerald-50"
                                    />
                                    <Title level={4} className="!mb-1">{userData?.name}</Title>
                                    <Text type="secondary">{userData?.email}</Text>

                                    <Divider />

                                    <div className="w-full text-left bg-emerald-50 p-4 rounded-xl">
                                        <Text className="block text-emerald-800 text-xs uppercase font-bold tracking-wider mb-2">Member Since</Text>
                                        <Text strong className="text-emerald-900 flex items-center gap-2">
                                            <CalendarOutlined /> {new Date(userData?.createdAt).toLocaleDateString()}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={16}>
                            <Card className="shadow-md rounded-2xl border-none">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={onFinish}
                                    requiredMark={false}
                                >
                                    <Title level={5} className="mb-4">Personal Information</Title>
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="name"
                                                label="Full Name"
                                                rules={[{ required: true, message: "Please enter your name" }]}
                                            >
                                                <Input prefix={<UserOutlined className="text-gray-400" />} className="rounded-lg h-10" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="email"
                                                label="Email Address"
                                            >
                                                <Input
                                                    prefix={<MailOutlined className="text-gray-400" />}
                                                    disabled
                                                    className="rounded-lg h-10 bg-gray-50"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider />

                                    <Title level={5} className="mb-4">Financial & Locale Settings</Title>
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="countryCode"
                                                label="Country"
                                            >
                                                <Select
                                                    disabled
                                                    showSearch
                                                    placeholder="Select a country"
                                                    optionFilterProp="children"
                                                    onChange={handleCountryChange}
                                                    className="h-10"
                                                >
                                                    {countries.map(c => (
                                                        <Option key={c.iso} value={c.iso}>{c.countryName}</Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="dateFormat"
                                                label="Date Format"
                                            >
                                                <Select className="h-10" disabled>
                                                    <Option value="d/M/yyyy">Day/Month/Year (d/M/yyyy)</Option>
                                                    <Option value="M/d/yyyy">Month/Day/Year (M/d/yyyy)</Option>
                                                    <Option value="yyyy-MM-dd">ISO (yyyy-MM-dd)</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="currency"
                                                label="Currency"
                                            >
                                                <Input readOnly className="rounded-lg h-10 bg-gray-50" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="symbol"
                                                label="Currency Symbol"
                                            >
                                                <Input readOnly prefix={<DollarCircleOutlined className="text-gray-400" />} className="rounded-lg h-10 bg-gray-50" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <div className="text-right mt-6">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={saving}
                                            icon={<SaveOutlined />}
                                            className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none shadow-lg shadow-emerald-100"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </SidebarLayout>
        </>
    );
};

export default ProtectedRoute(ProfilePage);
