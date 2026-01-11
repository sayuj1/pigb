import { useEffect, useState } from "react";
import {
  Input,
  Select,
  Switch,
  Popconfirm,
  message,
  Tooltip,
  Button,
  Modal,
  Form,
  Card,
  Typography,
  Tag,
  Empty,
  Spin
} from "antd";
import {
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { PiTagDuotone, PiFolderBold, PiPlusCircleDuotone } from "react-icons/pi";

const { Text, Title } = Typography;
const { Option } = Select;

const CategoryList = ({ userId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  const [typeFilter, setTypeFilter] = useState(undefined);
  const [onlyUserCreated, setOnlyUserCreated] = useState(false);
  const [sortOrder, setSortOrder] = useState("ascend");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [customType, setCustomType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayTypeOptions = [...typeOptions, "other"];

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay
    return () => clearTimeout(timeout);
  }, [searchText]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {
        userId,
        search: debouncedSearchText || undefined,
        type: typeFilter || undefined,
        onlyUserCreated,
        sortBy: "name",
        sortOrder: sortOrder === "ascend" ? "asc" : "desc",
      };

      const { data } = await axios.get("/api/categories/category", { params });
      setCategories(data.categories);

      // Extract unique types from categories
      const types = [
        ...new Set(data.categories.map((cat) => cat.type.toLowerCase())),
      ];
      setTypeOptions(types);

      const uniqueTypes = [
        ...new Set(data.categories.map((cat) => cat.type).filter(Boolean)),
      ];
      setAvailableTypes(uniqueTypes);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [debouncedSearchText, typeFilter, onlyUserCreated, sortOrder]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/categories/category?id=${id}`, {
        data: { userId },
      });
      message.success("Category deleted");
      fetchCategories();
    } catch (err) {
      message.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleCreateCategory = async (values) => {
    const finalType = values.type === "other" ? values.customType : values.type;

    const newCategory = {
      name: values.name,
      type: finalType,
      icon: selectedEmoji,
    };
    try {
      setSubmitting(true);
      await axios.post("/api/categories/category", newCategory);
      message.success("Category created");
      setIsModalVisible(false);
      form.resetFields();
      setSelectedEmoji(null);
      fetchCategories();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
  );

  const totalCategories = categories.length;
  const userCreatedCount = categories.filter(c => !c.isDefault).length;

  const getTransactionTagStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "income":
        return { bg: "#d1fae5", text: "#065f46" }; // Emerald 100/800
      case "expense":
        return { bg: "#fee2e2", text: "#991b1b" }; // Red 100/800
      case "savings":
        return { bg: "#dbeafe", text: "#1e40af" }; // Blue 100/800
      case "transfer":
        return { bg: "#f3e8ff", text: "#6b21a8" }; // Purple 100/800
      case "refund":
        return { bg: "#ffedd5", text: "#9a3412" }; // Orange 100/800
      default:
        return { bg: "#f1f5f9", text: "#334155" }; // Slate 100/700
    }
  };


  return (
    <div className="p-2 space-y-6">
      {/* Summary Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card bordered={false} className="shadow-sm rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-emerald-600">
              <PiTagDuotone className="text-3xl" />
            </div>
            <div>
              <Text className="text-gray-500 font-medium">Total Categories</Text>
              <Title level={2} style={{ margin: 0, color: '#065f46' }}>
                {totalCategories}
              </Title>
            </div>
          </div>
        </Card>
        <Card bordered={false} className="shadow-sm rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-orange-600">
              <PiButtonDuotoneIcon className="text-3xl" />
            </div>
            <div>
              <Text className="text-gray-500 font-medium">Custom Categories</Text>
              <Title level={2} style={{ margin: 0, color: '#9a3412' }}>
                {userCreatedCount}
              </Title>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-4 sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md py-2 -mx-2 px-2 rounded-lg">
        <div className="flex items-center gap-3 flex-grow max-w-3xl flex-wrap">
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
            className="rounded-full shadow-sm border-gray-200 hover:border-blue-400 focus:border-blue-500"
            style={{ maxWidth: '250px' }}
          />
          <Select
            allowClear
            placeholder="Filter by type"
            onChange={(value) => setTypeFilter(value)}
            value={typeFilter}
            size="large"
            className="rounded-full shadow-sm min-w-[160px]"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {availableTypes.map((type) => (
              <Option key={type} value={type}>
                {type[0].toUpperCase() + type.slice(1)}
              </Option>
            ))}
          </Select>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm ml-2">
            <span className="text-sm font-medium text-gray-600">Only My Categories</span>
            <Switch
              checked={onlyUserCreated}
              onChange={(checked) => setOnlyUserCreated(checked)}
              size="small"
            />
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          size="large"
          className="rounded-full bg-blue-600 hover:bg-blue-700 border-none shadow-md"
        >
          Create Category
        </Button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spin size="large" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <PiFolderBold className="text-6xl text-gray-300 mb-4" />
          <Text strong className="text-lg text-gray-500">No categories found</Text>
          <Text type="secondary">Create a new category to organize your finances</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="group relative bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Delete Action */}
              {!cat.isDefault && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Popconfirm
                    title="Delete this category?"
                    description="This cannot be undone."
                    onConfirm={() => handleDelete(cat._id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      className="bg-white shadow-sm hover:bg-red-50"
                    />
                  </Popconfirm>
                </div>
              )}

              <div className="flex flex-col items-center text-center pt-2">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-4xl mb-3 shadow-inner">
                  {cat.icon || "🏷️"}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate w-full px-2" title={cat.name}>
                  {cat.name}
                </h3>
                <div className="flex gap-2 justify-center mt-1">
                  <Tag
                    className="m-0 rounded-full px-2.5 py-0.5 border-0 font-medium capitalize"
                    style={{
                      backgroundColor: getTransactionTagStyle(cat.type).bg,
                      color: getTransactionTagStyle(cat.type).text,
                    }}
                  >
                    {cat.type}
                  </Tag>

                  {cat.isDefault && (
                    <Tooltip title="System Default">
                      <Tag className="m-0 rounded-full px-2.5 py-0.5 border-0 bg-indigo-50 text-indigo-600 font-medium flex items-center gap-1">
                        <CheckCircleOutlined className="text-xs" /> Default
                      </Tag>
                    </Tooltip>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-blue-600">
            <PiPlusCircleDuotone className="text-2xl" />
            <span>Create New Category</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedEmoji(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText="Create Category"
        cancelButtonProps={{ size: "large" }}
        okButtonProps={{ size: "large" }}
        centered
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCategory} className="py-4">
          <Form.Item label="Icon" className="mb-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center text-5xl border border-gray-200">
                {selectedEmoji || "🏷️"}
              </div>
              <div style={{ width: '100%', maxHeight: 300, overflow: "auto" }} className="border rounded-lg p-2">
                <EmojiPicker
                  onEmojiClick={(emojiData) => setSelectedEmoji(emojiData.emoji)}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled={true}
                  width="100%"
                  height={300}
                />
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input size="large" placeholder="e.g. Online Subscriptions" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select
              placeholder="Select type"
              size="large"
              onChange={(value) => {
                setSelectedType(value);
                if (value !== "other") {
                  setCustomType("");
                }
              }}
              value={selectedType}
            >
              {displayTypeOptions.map((type) => (
                <Option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedType === "other" && (
            <Form.Item
              label="Custom Type Name"
              name="customType"
              rules={[{ required: true, message: "Please enter custom type name" }]}
            >
              <Input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                size="large"
                placeholder="e.g. Entertainment"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

// Helper to get colors for category types
const getTypeColor = (type) => {
  const colors = {
    home: { bg: "#ecfeff", text: "#0e7490" }, // cyan
    education: { bg: "#f0fdf4", text: "#15803d" }, // green
    business: { bg: "#fef2f2", text: "#b91c1c" }, // red
    car: { bg: "#fff7ed", text: "#c2410c" }, // orange
    personal: { bg: "#f5f3ff", text: "#6d28d9" }, // violet
    entertainment: { bg: "#fff1f2", text: "#be123c" }, // rose
    shopping: { bg: "#fdf4ff", text: "#a21caf" }, // fuchsia
    other: { bg: "#f8fafc", text: "#475569" }, // slate
  };
  return colors[type.toLowerCase()] || { bg: "#eff6ff", text: "#1d4ed8" }; // default blue
};

// Helper for icon in summary card (avoid undefined var)
const PiButtonDuotoneIcon = (props) => (
  <div {...props}>
    <PiFolderBold />
  </div>
);

export default CategoryList;
