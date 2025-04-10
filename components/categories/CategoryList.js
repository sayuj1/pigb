import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Switch,
  Popconfirm,
  message,
  Tooltip,
  Button,
  Modal,
  Form,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";

const { Search } = Input;
const { Option } = Select;

const CategoryList = ({ userId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  const [typeFilter, setTypeFilter] = useState();
  const [onlyUserCreated, setOnlyUserCreated] = useState(false);
  const [sortOrder, setSortOrder] = useState("ascend");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [customType, setCustomType] = useState("");

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

  const handleTableChange = (_, __, sorter) => {
    if (sorter.order) {
      setSortOrder(sorter.order);
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
      await axios.post("/api/categories/category", newCategory);
      message.success("Category created");
      setIsModalVisible(false);
      form.resetFields();
      setSelectedEmoji(null);
      fetchCategories();
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to create category");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      filters: availableTypes.map((type) => ({
        text: type[0].toUpperCase() + type.slice(1),
        value: type,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Icon",
      dataIndex: "icon",
      render: (icon) => <span>{icon || "—"}</span>,
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) =>
        !record.isDefault ? (
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <span className="text-red-500 cursor-pointer">
                <DeleteOutlined className="text-red-500 cursor-pointer" />
              </span>
            </Tooltip>
          </Popconfirm>
        ) : null,
    },
  ];

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
  );

  return (
    <div className="p-4 rounded shadow">
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <Search
            placeholder="Search categories"
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            allowClear
            style={{ width: 200 }}
          />
          <Select
            allowClear
            placeholder="Filter by type"
            onChange={(value) => setTypeFilter(value)}
            value={typeFilter}
            style={{ width: 160 }}
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
          <div className="flex items-center gap-2">
            <span className="text-sm">Only My Categories</span>
            <Switch
              checked={onlyUserCreated}
              onChange={(checked) => setOnlyUserCreated(checked)}
            />
          </div>
        </div>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Create Category
        </Button>
      </div>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={filteredCategories}
        loading={loading}
        onChange={handleTableChange}
        pagination={false}
      />
      <Modal
        title="Create New Category"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedEmoji(null);
        }}
        onOk={() => {
          form.submit();
        }}
        okText="Create"
        style={{ top: 20 }} // 👈 Pushes the modal towards top
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCategory}>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select
              placeholder="Select type"
              onChange={(value) => {
                setSelectedType(value);
                if (value !== "other") {
                  setCustomType(""); // clear custom input if not needed
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
              rules={[
                { required: true, message: "Please enter custom type name" },
              ]}
            >
              <Input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
            </Form.Item>
          )}

          <Form.Item label="Icon">
            <div className="flex flex-col gap-2">
              {selectedEmoji && (
                <div className="text-2xl border border-blue-500 rounded w-fit p-1">
                  {selectedEmoji}
                </div>
              )}
              <div style={{ maxHeight: 350, overflow: "auto" }}>
                <EmojiPicker
                  onEmojiClick={(emojiData) =>
                    setSelectedEmoji(emojiData.emoji)
                  }
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled={true}
                />
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryList;
