import { Modal, Form, Input, Button, message } from "antd";
import axios from "axios";

const ShoppingListModal = ({ visible, initialData, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEdit = !!initialData._id;

  const handleFinish = async (values) => {
    if (isEdit) {
      await axios.put(
        "/api/shoppings/shoppings",
        { ...values, items: initialData.items },
        { params: { id: initialData._id } }
      );
    } else {
      await axios.post("/api/shoppings/shoppings", values);
    }
    message.success("Shopping list created");
    onSuccess();
  };

  return (
    <Modal
      open={visible}
      title={isEdit ? "Edit Shopping List" : "New Shopping List"}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} onFinish={handleFinish} initialValues={initialData}>
        <Form.Item name="name" label="List Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          {isEdit ? "Update" : "Create"}
        </Button>
      </Form>
    </Modal>
  );
};

export default ShoppingListModal;
