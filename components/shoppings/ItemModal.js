import { Modal, Form, Input, InputNumber, Button, Space, Divider } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const ItemModal = ({ list, item, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEdit = !!item;

  const handleSubmit = async (values) => {
    try {
      if (isEdit) {
        const res = await axios.put("/api/shoppings/items", values, {
          params: { id: list._id, itemId: item._id },
        });
        onSuccess(res.data.shoppingList);
      } else {
        let lastRes = null;
        for (const i of values.items) {
          lastRes = await axios.post("/api/shoppings/items", i, {
            params: { id: list._id },
          });
        }
        onSuccess(lastRes.data.shoppingList);
      }
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Modal
      open={true}
      title={isEdit ? "Edit Item" : "Add Items"}
      onCancel={onClose}
      footer={null}
      bodyStyle={{ padding: 0 }}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        initialValues={isEdit ? item : { items: [{ name: "", price: 0 }] }}
        layout="vertical"
        style={{ display: "flex", flexDirection: "column", height: "70vh" }} // full height form
      >
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {isEdit ? (
            <>
              <Form.Item
                name="name"
                label="Item Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          rules={[
                            { required: true, message: "Item name required" },
                          ]}
                        >
                          <Input placeholder="Item Name" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "price"]}
                          rules={[
                            { required: true, message: "Price required" },
                          ]}
                        >
                          <InputNumber min={0} placeholder="Price" />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            style={{ color: "red" }}
                            onClick={() => remove(name)}
                          />
                        )}
                      </Space>
                    ))}
                  </>
                )}
              </Form.List>
            </>
          )}
        </div>

        {!isEdit && (
          <div style={{ padding: 16, borderTop: "1px solid #f0f0f0" }}>
            <Form.List name="items">
              {(fields, { add }) => (
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 12 }}
                >
                  Add More Items
                </Button>
              )}
            </Form.List>

            <Button type="primary" htmlType="submit" block>
              Save Items
            </Button>
          </div>
        )}

        {isEdit && (
          <div style={{ padding: 16, borderTop: "1px solid #f0f0f0" }}>
            <Button type="primary" htmlType="submit" block>
              Update Item
            </Button>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default ItemModal;
