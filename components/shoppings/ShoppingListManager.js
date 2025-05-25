import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  message,
  Space,
  Table,
  Typography,
  Row,
  Col,
  Pagination,
  Spin,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import ShoppingListModal from "./ShoppingListModal";
import ItemModal from "./ItemModal";
import AddTransactionModal from "../transactions/AddTransactionModal";

const capitalizeWords = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

const ShoppingListManager = () => {
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [itemModalState, setItemModalState] = useState({
    open: false,
    list: null,
    item: null,
  });
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLists: 0,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [addTransactionModalVisible, setAddTransactionModalVisible] =
    useState(false);
  const [prefilledTransaction, setPrefilledTransaction] = useState(null);
  const [itemLoading, setItemLoading] = useState({});

  const handleAddExpense = (selectedItems) => {
    if (selectedItems.length === 0) {
      message.warning("Please select at least one item.");
      return;
    }

    const totalAmount = selectedItems.reduce(
      (sum, item) => sum + item.price,
      0
    );
    const description = selectedItems.map((item) => item.name).join(", ");

    setPrefilledTransaction({
      type: "expense",
      amount: totalAmount,
      description,
    });

    setAddTransactionModalVisible(true);
  };

  const fetchLists = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/shoppings/shoppings", {
        params: { search: debouncedSearch, page, limit: 10 }, // Limit items per page (adjust as needed)
      });
      setShoppingLists(data.shoppingLists);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        totalLists: data.pagination.totalLists,
      });
    } catch (err) {
      message.error("Failed to fetch shopping lists");
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (id) => {
    setLoading(true);
    const currentPageBeforeDeletion = pagination.currentPage; // Save the current page before deletion
    try {
      await axios.delete("/api/shoppings/shoppings", { params: { id } });
      message.success("Deleted successfully");

      // Fetch the updated list data after deletion
      const { data } = await axios.get("/api/shoppings/shoppings", {
        params: {
          search: debouncedSearch,
          page: currentPageBeforeDeletion,
          limit: 10,
        },
      });

      // If no data exists on the current page, go to the previous page (if it's > 1)
      if (data.shoppingLists.length === 0 && currentPageBeforeDeletion > 1) {
        setPagination((prev) => ({
          ...prev,
          currentPage: currentPageBeforeDeletion - 1, // Switch to the previous page
        }));
      } else {
        // Otherwise, stay on the current page and fetch the updated list
        setShoppingLists(data.shoppingLists);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalLists: data.pagination.totalLists,
        });
      }
    } catch (err) {
      message.error("Failed to delete list");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (listId, itemId) => {
    // Set loading only for this list
    setItemLoading((prev) => ({ ...prev, [listId]: true }));
    try {
      const { data } = await axios.delete("/api/shoppings/items", {
        params: { id: listId, itemId },
      });

      if (!data?.shoppingList) {
        throw new Error("Invalid response from server");
      }

      // Update only the specific shopping list
      setShoppingLists((prevLists) =>
        prevLists.map((list) =>
          list._id === data.shoppingList._id ? data.shoppingList : list
        )
      );

      message.success("Item deleted");
    } catch (err) {
      message.error("Failed to delete item");
      console.error(err);
    } finally {
      // Clear loading for this list
      setItemLoading((prev) => ({ ...prev, [listId]: false }));
    }
  };

  const addItem = async (itemData) => {
    try {
      setShoppingLists((prevLists) =>
        prevLists.map((list) => (list._id === itemData._id ? itemData : list))
      );
      message.success("Item added");
    } catch (err) {
      message.error("Failed to add item");
    }
  };

  useEffect(() => {
    fetchLists(pagination.currentPage);
  }, [pagination.currentPage]);

  useEffect(() => {
    // Reset to page 1 when search value changes
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchLists(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms debounce

    return () => clearTimeout(handler); // Cleanup on unmount or before new timeout
  }, [search]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Space
        className="mb-4 flex justify-between"
        direction="horizontal"
        style={{ width: "100%" }}
      >
        <Space>
          <Input.Search
            placeholder="Search lists..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
          />

          <Typography.Text
            strong
            style={{ fontSize: "16px", color: "#595959" }}
          >
            🧾 Total Lists:{" "}
            <span style={{ color: "#1890ff" }}>{pagination.totalLists}</span>
          </Typography.Text>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setEditingList({})}
        >
          Create New Shopping List
        </Button>
      </Space>

      {pagination.totalLists > 0 && (
        <Pagination
          current={pagination.currentPage}
          total={pagination.totalLists}
          pageSize={10}
          onChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
          // showTotal={(total) => `Total ${total} items`}
          style={{ marginTop: "10px", marginBottom: "10px" }}
        />
      )}

      {loading ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Spin tip="Loading..." />
        </div>
      ) : shoppingLists.length === 0 ? (
        <div className="text-center mt-10 text-gray-500 border-dashed border-1 p-5">
          <Typography.Title level={4}>
            🛒 No Shopping Lists Found
          </Typography.Title>
          <p>Create a new shopping list to get started.</p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {shoppingLists.map((list) => (
            <Col xs={24} md={12} key={list._id}>
              <Card
                title={`${capitalizeWords(list.name)} - ₹${
                  list.totalCost || 0
                }`}
                extra={
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setEditingList(list)}
                    />
                    <Popconfirm
                      title="Are you sure you want to delete this list?"
                      onConfirm={() => deleteList(list._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button size="small" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                }
                bodyStyle={{
                  display: "flex",
                  flexDirection: "column",
                  height: "345px",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: 500,
                    fontSize: 14,
                    background: "#fafafa",
                  }}
                >
                  🛒 Total Items: {list.items.length}
                </div>
                <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
                  <Table
                    loading={itemLoading[list._id]}
                    dataSource={list.items}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                    scroll={{ y: 120 }} // Fixes header and scrolls body
                    rowSelection={{
                      selectedRowKeys:
                        selectedItems[list._id]?.map((item) => item._id) || [],
                      onChange: (_, selectedRows) => {
                        setSelectedItems((prev) => ({
                          ...prev,
                          [list._id]: selectedRows,
                        }));
                      },
                    }}
                    columns={[
                      { title: "Item", dataIndex: "name" },
                      { title: "Price", dataIndex: "price" },
                      {
                        title: "Action",
                        render: (_, item) => (
                          <Space>
                            <Button
                              size="small"
                              onClick={() =>
                                setItemModalState({ open: true, list, item })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              danger
                              onClick={() => deleteItem(list._id, item._id)}
                            >
                              Delete
                            </Button>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
                {(selectedItems[list._id]?.length || 0) > 0 && (
                  <Button
                    type="primary"
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      handleAddExpense(selectedItems[list._id]);
                    }}
                    className="mb-2"
                    block
                  >
                    Add Expense
                  </Button>
                )}
                <Button
                  type="dashed"
                  onClick={() =>
                    setItemModalState({ open: true, list, item: null })
                  }
                  block
                >
                  + Add Item
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {pagination.totalLists > 0 && (
        <Pagination
          current={pagination.currentPage}
          total={pagination.totalLists}
          pageSize={10}
          onChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
          // showTotal={(total) => `Total ${total} items`}
          style={{ marginTop: "20px" }}
        />
      )}

      {editingList && (
        <ShoppingListModal
          visible={!!editingList}
          initialData={editingList}
          onClose={() => setEditingList(null)}
          onSuccess={() => {
            setEditingList(null);
            fetchLists(pagination.currentPage);
          }}
        />
      )}

      {itemModalState.open && (
        <ItemModal
          list={itemModalState.list}
          item={itemModalState.item}
          onClose={() =>
            setItemModalState({ open: false, list: null, item: null })
          }
          onSuccess={(itemData) => {
            setItemModalState({ open: false, list: null, item: null });
            addItem(itemData); // Add the item directly to the list
          }}
        />
      )}
      <AddTransactionModal
        visible={addTransactionModalVisible}
        onClose={() => setAddTransactionModalVisible(false)}
        onAddTransaction={() => {
          // Optional: Refresh data or trigger effect
          setAddTransactionModalVisible(false);
        }}
        initialValues={prefilledTransaction}
      />
    </div>
  );
};

export default ShoppingListManager;
