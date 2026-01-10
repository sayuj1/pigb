import React, { useState, useEffect, useContext } from "react";
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
    Space,
    Modal
} from "antd";
import {
    UserOutlined,
    MailOutlined,
    GlobalOutlined,
    DollarCircleOutlined,
    CalendarOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    LockOutlined
} from "@ant-design/icons";
import axios from "axios";
import ProtectedRoute from "@/context/ProtectRoute";
import AuthContext from "@/context/AuthContext";
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
    const [passwordForm] = Form.useForm();
    const { setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passModalVisible, setPassModalVisible] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/api/user");
            setUserData(res.data);
            setUser(res.data);
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
            const res = await axios.put("/api/user", payload);
            message.success("Profile updated successfully");
            setUser(res.data);
            fetchProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
            message.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (values) => {
        setPasswordLoading(true);
        try {
            await axios.post("/api/user/change-password", {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            message.success("Password changed successfully");
            setPassModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            console.error("Error changing password:", error);
            message.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
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

                                    <div className="w-full text-left bg-emerald-50 p-4 rounded-xl space-y-3">
                                        <div>
                                            <Text className="block text-emerald-800 text-[10px] uppercase font-bold tracking-wider mb-1">Member Since</Text>
                                            <Text strong className="text-emerald-900 flex items-center gap-2 text-sm">
                                                <CalendarOutlined /> {new Date(userData?.createdAt).toLocaleDateString()}
                                            </Text>
                                        </div>
                                        {/* <div>
                                            <Text className="block text-emerald-800 text-[10px] uppercase font-bold tracking-wider mb-1">Login Provider</Text>
                                            <Text strong className="text-emerald-900 flex items-center gap-2 text-sm capitalize">
                                                <GlobalOutlined /> {userData?.provider || 'Manual'}
                                            </Text>
                                        </div>
                                        <div>
                                            <Text className="block text-emerald-800 text-[10px] uppercase font-bold tracking-wider mb-1">Default Currency</Text>
                                            <Text strong className="text-emerald-900 flex items-center gap-2 text-sm">
                                                <DollarCircleOutlined /> {userData?.locale?.currency} ({userData?.locale?.symbol})
                                            </Text>
                                        </div> */}
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

                                    <Divider />

                                    <Title level={5} className="mb-4">Account Security</Title>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                        <Row gutter={16} align="middle">
                                            <Col xs={24} sm={16}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${userData?.provider === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {userData?.provider === 'google' ? <GlobalOutlined /> : <UserOutlined />}
                                                    </div>
                                                    <div>
                                                        <Text strong className="block">Logged in via {userData?.provider === 'google' ? 'Google' : 'Manual Login'}</Text>
                                                        <Text type="secondary" className="text-xs">Your account is secured with {userData?.provider === 'google' ? 'Google OAuth 2.0' : 'Encrypted Passwords'}</Text>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={8} className="text-right">
                                                {userData?.provider === 'manual' && (
                                                    <Button
                                                        size="small"
                                                        className="text-xs rounded-lg"
                                                        onClick={() => setPassModalVisible(true)}
                                                    >
                                                        Change Password
                                                    </Button>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>

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

                <Modal
                    title={<Title level={4} className="!m-0">Change Password</Title>}
                    open={passModalVisible}
                    onCancel={() => {
                        setPassModalVisible(false);
                        passwordForm.resetFields();
                    }}
                    footer={null}
                    className="max-w-md"
                    centered
                >
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                        className="mt-6"
                    >
                        <Form.Item
                            name="currentPassword"
                            label="Current Password"
                            rules={[{ required: true, message: 'Please enter your current password' }]}
                        >
                            <Input.Password prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg h-10" />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please enter your new password' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg h-10" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Please confirm your new password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined className="text-gray-400" />} className="rounded-lg h-10" />
                        </Form.Item>

                        <div className="flex gap-3 justify-end mt-8">
                            <Button
                                onClick={() => {
                                    setPassModalVisible(false);
                                    passwordForm.resetFields();
                                }}
                                className="rounded-lg h-10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={passwordLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg h-10 px-6"
                            >
                                Update Password
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </SidebarLayout>
        </>
    );
};

export default ProtectedRoute(ProfilePage);
